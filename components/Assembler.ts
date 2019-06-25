import { AssemblyInstruction } from "./AssemblyInstruction";
import fs from 'fs';
import { MachineInstruction } from "./MachineInstruction";
import { SymbolsTable } from "./SymbolsTable";
import { binToHex } from "../lib/utils";
import { Memory } from './Memory';
import { Logger } from './Logger';

export class Assembler {

  private step: number = 0;
  private lines: string[] = [];
  public counter = 0x0;
  private symbols: SymbolsTable = new SymbolsTable();

  public bufferOut: string[] = [];
  public numBytes = 0;
  public checkSum = 0x0;
  public listing: string[] = [];
  public memory: Memory;
  private logger: Logger = new Logger('./logs/assembler.html');

  constructor(memory: Memory){
    this.memory = memory;

    this.logger.h1('ASSEMBLER LOGS');
    this.logger.p('Processed at ' + (new Date()).toLocaleDateString());
    this.logger.hr();
  }

  public translateFile(path: string) {
    this.logger.h2('Starting to assemble...');
    this.logger.key('Program Path: ', path);

    const file = fs.readFileSync(path); //carrega conteúdo do arquivo em assembly
    this.logger.h3('Source code:');

    this.lines = file.toString().split("\n"); // separa instruções em vetor, linha por linha

    const code = this.lines.join('<br/>');
    this.logger.textarea(file.toString());

    this.logger.hr();
    this.fillSymbolsTable(this.lines); // inicia Passo 1

    if(this.step === 0) { // se finalizou passo 2, bufferOut e listing estão prontos para serem gravados
      this.bufferOut.unshift(this.numBytes.toString(16).padStart(2, '0'));
      let checksum = 0x0;
      this.bufferOut.forEach(b => { 
        checksum = (checksum + Number('0x' + b)) % 0x100;
      });
      // console.log('checksum', checksum);
      
      this.bufferOut.push(checksum.toString(16).padStart(2, '0'));
      fs.writeFileSync('./output/buffer.txt', this.bufferOut.join(' '));
      fs.writeFileSync('./output/listing.txt', this.listing.join('\n'));
    }

  }

  public fillSymbolsTable(lines: string[]) { // passo 1 do montador

    this.step = 1;
    this.logger.h3('**** STARTING STEP 1 *****');
    
    lines.forEach((line, i) => {

      this.logger.openContainer();
      this.logger.h4('Proccessing line ' + (i+1));
      this.logger.hr();
      this.logger.key(`Line ${i+1}`, line, true);
      this.logger.key(`Counter Antes`, `/${this.counter.toString(16).padStart(3, '0')}`);

      const instruction = new AssemblyInstruction(line); // separa infos a partir do código

      if(instruction.hasLabel()) { // se tiver rótulo
        this.logger.key('Label', instruction.label);
        if(this.symbols.labelExists(instruction.label)) {// se rótulo já estiver na tabela
          this.logger.p('Label already in symbols table');
          if (!this.symbols.getSymbol(instruction.label).defined) { 
            this.logger.p('Label already defined');
            this.symbols.setValue(instruction.label, this.counter);
          }
        } else { // se rótulo não estiver na tabela   
          this.logger.p('Inserting label in symbols table');
          this.symbols.add({
            label: instruction.label,
            defined: instruction.isLink() ? true : false,
            value: instruction.isLink() ? Number('0x'+this.counter.toString(16)) : undefined,
            type: 'ADDRESS',
          }); // adiciona rótulo na tabela
        }
      }

      if(instruction.hasLabelParameter()) { // se tiver rótulo
        this.logger.key('Label Parameter', instruction.getLabelParameter());
        
        if(!this.symbols.labelExists(instruction.getLabelParameter())) { // se rótulo não estiver na tabela
          this.logger.p('Inserting label in symbols table');
          this.symbols.add({
            label: instruction.getLabelParameter(),
            value: instruction.isLink() ? this.counter : undefined,
            defined: instruction.isLink() ? true : false,
            type: 'ADDRESS',
          }); // adiciona rótulo na tabela
        }
      }

      if (instruction.isPseudo()) {
        this.logger.h5('Executing pseudo instruction: ' + instruction.mnemonic);
        this.executePseudo(instruction);
      } 

      this.logger.block(this.symbols.print(), true);

      this.counter = this.counter + Assembler.getInstructionLength(instruction.mnemonic);
      this.logger.key(`Counter Depois ${i}`, `/${this.counter.toString(16).padStart(3, '0')}`);

      this.logger.closeContainer();
    });
  }

  private executePseudo(instruction: AssemblyInstruction, buffer?: string[]) {
    switch (instruction.mnemonic) {

      case '@':
        if (instruction.hasLabelParameter()) {
          this.counter = Number(this.symbols.getHexValue(instruction.getLabelParameter()));
        } else {
          this.counter = binToHex(instruction.getBinParameter());
        }
        if (this.step === 2 && buffer) {
          for(let i = 0; i < 4; i = i + 2) {
            buffer.push(binToHex(instruction.getBinParameter()).toString(16).padStart(4, '0').substr(i, 2));
          }
        }
      break;

      case '#':        
        if (instruction.hasLabelParameter()) {
          this.counter = Number('0x'+ this.symbols.getHexValue(instruction.getLabelParameter()));
        } else {
          this.counter = binToHex(instruction.getBinParameter());
        }
        if (this.step === 1) {
          this.logger.closeContainer();
          this.assemble(this.lines); 
        } else if (this.step === 2) {
          this.step = 0;
        }
      break;
        
      case 'K':
        if (this.step === 2) {
          this.memory.write(this.counter, Number('0b'+instruction.getBinParameter(2)).toString(16).padStart(2, '0'));
        }
      break;
      case '$':

      break;
    }
  }

  public assemble(lines: string[]) {
    this.step = 2;
    this.numBytes = 1;
    this.bufferOut = [];
    this.listing = [];

    this.logger.h3('**** STARTING STEP 2 *****');
    lines.forEach((line, i) => {

      const instruction = new AssemblyInstruction(line);
      let instrCode: string = '';

      this.logger.openContainer();
      this.logger.h4('Proccessing line ' + (i+1));
      this.logger.hr();
      this.logger.key(`Line ${i+1}`, line, true);
      this.logger.key(`Counter (current)`, `/${this.counter.toString(16).padStart(3, '0')}`);

      if(instruction.isPseudo()) {
        this.executePseudo(instruction, this.bufferOut);
        const opLength = Assembler.getOperandLength(instruction.mnemonic); // pega tamanho do operando (xx...)
        if (!['@', '#'].includes(instruction.mnemonic))
          instrCode = Number('0b' + instruction.getBinParameter()).toString(16).padStart(opLength, '0');
      } else if (!instruction.isLink()) {
        
        const mneCode = Assembler.getMnemonicCode(instruction.mnemonic).toString(16); // pega código equivalente a mnemonico
        
        const opLength = Assembler.getOperandLength(instruction.mnemonic); // pega tamanho do operando (xx...)
        let operand: string;

        if (instruction.hasLabelParameter()) {
          operand = this.symbols.getHexValue(instruction.getLabelParameter());
        } else {
          operand = Number('0b' + instruction.getBinParameter()).toString(16);
        }
        instrCode = mneCode + operand.padStart(opLength, '0'); // ex. 8037
        // console.log(`\t\t mnemonic: ${mneCode} opLength: ${opLength} operand: ${operand} intrCode: ${instrCode}  `);
        this.logger.key(`Mnemonic`, mneCode);
        this.logger.key(`Operand Length`, opLength.toString(16));
        this.logger.key(`operand`, operand);
        this.logger.key(`Instr. Code`, instrCode);

        for(let i = 0; i < opLength + 1; i = i + 2) {
          this.bufferOut.push(instrCode.substr(i, 2));
          this.numBytes++;;
        }
      }

      this.listing.push
      (`${(i+1).toString().padStart(2, '0')}      ${this.counter.toString(16).padStart(3, '0')}      ${instrCode}      ${line}`);

      this.logger.h4('Output: ');
      this.logger.block(`${(i+1).toString().padStart(2, '0')}      ${this.counter.toString(16).padStart(3, '0')}      ${instrCode}      ${line}`, true);

      this.logger.hr();
      this.counter = this.counter + Assembler.getInstructionLength(instruction.mnemonic);
      // console.log(`\tBuffer ${i}:`, this.bufferOut);
      this.logger.key(`Counter (next)`, `/${this.counter.toString(16).padStart(3, '0')}`);

      this.logger.closeContainer();
    });

    this.logger.h3('LISTING:');
    this.logger.textarea(this.listing.join('\n'));

    this.logger.h3('BUFFER:');
    this.logger.textarea(this.bufferOut.join(' '));

    this.logger.h3('Memory after assembling');
    this.logger.block(this.memory.print(), false);
  }
  
  public static getMnemonicCode(mnemonic: string): number {
    switch(mnemonic) {
      case 'JP': return 0x0;
      case 'JZ': return 0x1;
      case 'JN': return 0x2;
      case 'LV': return 0x3;
      case '+' : return 0x4;
      case '-' : return 0x5;
      case '*' : return 0x6;
      case '/' : return 0x7;
      case 'LD': return 0x8;
      case 'MM': return 0x9;
      case 'SC': return 0xA;
      case 'RS': return 0xB;
      case 'HM': return 0xC;
      case 'GD': return 0xD;
      case 'PD': return 0xE;
      case 'MA': return 0xF;
      default: return NaN;
    }
  }

  public static getOperandLength(mnemonic: string): number {    
    switch(mnemonic) {
      case 'JP': return 3;
      case 'JZ': return 3;
      case 'JN': return 3;
      case 'LV': return 3;
      case '+' : return 3;
      case '-' : return 3;
      case '*' : return 3;
      case '/' : return 3;
      case 'LD': return 3;
      case 'MM': return 3;
      case 'SC': return 3;
      case 'RS': return 3;
      case 'HM': return 3;
      case 'GD': return 3;
      case 'PD': return 3;
      case 'MA': return 3;
      case '@': return 3;
      case '#': return 3;
      case '$': return 3;
      case 'K': return 2;
      default: 
        throw Error('MNEMONIC_NOT_FOUND');
    }
  }

  public static getInstructionLength(mnemonic: string): number {
    switch(mnemonic) {
      case 'JP': return 0x2;
      case 'JZ': return 0x2;
      case 'JN': return 0x2;
      case 'LV': return 0x2;
      case '+' : return 0x2;
      case '-' : return 0x2;
      case '*' : return 0x2;
      case '/' : return 0x2;
      case 'LD': return 0x2;
      case 'MM': return 0x2;
      case 'SC': return 0x2;
      case 'RS': return 0x2;
      case 'HM': return 0x2;
      case 'GD': return 0x2;
      case 'PD': return 0x2;
      case 'MA': return 0x2;
      case '@' : return 0x0;
      case '#' : return 0x0;
      case '$' : return 0x2;
      case 'K' : return 0x1;
      default: return 0x0;
    }
  }

  public static getMnemonic(code: number): string {
    switch(code) {
      case 0x0: return 'JP';
      case 0x1: return 'JZ';
      case 0x2: return 'JN';
      case 0x3: return 'LV';
      case 0x4 : return '+';
      case 0x5 : return '-';
      case 0x6 : return '*';
      case 0x7 : return '/';
      case 0x8: return 'LD';
      case 0x9: return 'MM';
      case 0xA: return 'SC';
      case 0xB: return 'RS';
      case 0xC: return 'HM';
      case 0xD: return 'GD';
      case 0xE: return 'PD';
      case 0xF: return 'MA';
      default: 
        throw Error('MNEMONIC_NOT_FOUND');
    }
  }
}