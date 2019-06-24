import { Memory } from './Memory';
import { Assembler } from './Assembler';
import { Loader } from './Loader';
import { Logger } from './Logger';

export class VirtualMachine {
  private pc: number = 0x0;
  private acc: number = 0x0;
  private register: number = 0x0;
  public memory: Memory;
  public assembler: Assembler;
  public loader: Loader;
  private breakpoint: number | undefined;
  private status: 'RUNNING'|'PAUSED' = 'PAUSED';
  private logger: Logger = new Logger('./logs/vm.html');

  constructor(){
    console.log("Starting Virtual Machine...");
    

    this.memory = new Memory(256);
    this.assembler = new Assembler(this.memory);
    this.loader = new Loader(this.memory);

    this.logger.h1('VIRTUAL MACHINE LOGS');
    this.logger.p('Processed at ' + (new Date()).toLocaleDateString());
    this.logger.hr();
  }

  public loadProgram(filePath: string) {
    console.log("Assembling program.txt ...");
    this.logger.h2('Loading program');
    this.logger.key('File Path: ', filePath);

    this.assembler.translateFile(filePath);
    this.loader.setBuffer('./output/buffer.txt');

    console.log("Loading program to memory ...");
    this.loader.load();
  }

  public setPC(address: number) {
    this.pc = address;
    this.logger.h3('Setting PC to: /' + address.toString(16).toUpperCase());
  }

  public run(breakpoint?: number) {
    console.log("Running program ...");

    this.status = 'RUNNING';
    if(breakpoint) {
      this.breakpoint = breakpoint;
    }

    this.logger.h2('STARTING EXECUTION');
    if(this.breakpoint)
      this.logger.h3('Until breakpoint /' + this.breakpoint.toString(16));
    else
      this.logger.h3('No breakpoints');

    while(this.status === 'RUNNING') {
      this.logger.openContainer();
      this.logger.h4('\n\n Fetching next instruction...');
      this.logger.key('PC', this.pc.toString(16));
      if(this.breakpoint && this.pc === this.breakpoint) {
        this.breakpoint = undefined;
        this.status = 'PAUSED';
        this.logger.h3('Reached breakpoint. Pausing.');
        return;
      }

      
      let instrCode = this.memory.read(this.pc);
      this.logger.key('Instruction Code', instrCode);

      const mnemonic = Assembler.getMnemonic(Number('0x'+instrCode.charAt(0)));
      this.logger.key('Mnemonic', mnemonic, true);
      const opLength = Assembler.getOperandLength(mnemonic);

      this.register = Number('0x' + instrCode.substr(1, opLength));
      this.logger.key('Operand Register', this.register.toString(16).toUpperCase());

      this.logger.key('Accumulator (before)', this.acc.toString(16).toUpperCase());
      this.executeInstruction(mnemonic);
      
      this.logger.hr();
      this.printMemory();
      this.logger.hr();

      this.logger.key('Next Instruction', this.pc.toString(16).toUpperCase());
      this.logger.key('Accumlator (after)', this.acc.toString(16).toUpperCase());

      this.logger.closeContainer();
    }

  }

  public printMemory() {
    this.logger.block(this.memory.print(), true);
  }

  private JP() {
    this.pc = this.register;
  }

  private JN() {
    if(this.acc < 0) {
      this.pc = this.register;
    } else {
      this.pc = this.pc + 0x2;
    }
  }

  private ADD() {
    this.acc = this.acc + Number('0x'+this.memory.read(this.register, 1));
    this.pc = this.pc + 0x2;
  }

  private MULT() {
    this.acc = this.acc * Number('0x' + this.memory.read(this.register, 1));
    this.pc = this.pc + 0x2;
  }

  private SUB() {
    this.acc = this.acc - Number('0x' + this.memory.read(this.register, 1));
    this.pc = this.pc + 0x2;
  }

  private DIV() {
    this.acc = this.acc / Number('0x' + this.memory.read(this.register, 1));
    this.pc = this.pc + 0x2;
  }

  private LD() {
    this.acc = Number('0x' + this.memory.read(this.register, 1));
    this.pc = this.pc + 0x2;
  }

  private SC() {
    const pcString = Number('0x'+this.pc)
    this.memory.write(this.register, this.pc.toString(16).substr(0,4));
    this.memory.write(this.register + 0x1, this.pc.toString(16).substr(4,4));

    this.pc = this.register + 0x2;
  }

  private HM() {
    this.status = 'PAUSED';
    this.pc = this.register;
  }

  private JZ() {
    if (this.acc === 0x0) {
      this.pc = this.register;
    } else {
      this.pc = this.pc + 0x2;
    }
  }

  private LV() {
    this.acc = this.register;
    this.pc = this.pc + 2;
  }

  private MM() {
    this.memory.write(this.register, this.acc.toString(16).padStart(2, '0'));
    this.pc = this.pc + 0x2;
  }

  private MA() {
    const address = Number('0x'+ this.memory.read(this.register, 1));
    this.memory.write(address, this.acc.toString(16).padStart(2, '0'));
    this.pc = this.pc + 0x2;
  }

  private RS() {
    this.pc = this.register;
  }

  private executeInstruction(mnemonic: string) {
    switch(mnemonic) {
      case 'JP': 
        this.JP();
      break;
      case 'JZ': 
        this.JZ();
      break;
      case 'JN': 
        this.JN();
      break;
      case 'LV': 
        this.LV();
      break;
      case '+': 
        this.ADD();
      break;
      case '-': 
        this.SUB();
      break;
      case '*': 
        this.MULT();
      break;
      case '/': 
        this.DIV();
      break;
      case 'LD': 
        this.LD();
      break;
      case 'MM': 
        this.MM();
      break;
      case 'MA': 
        this.MA();
      break;
      case 'SC': 
        this.SC();
      break;
      case 'HM': 
        this.HM();
      break;
      case 'RS': 
        this.RS();
      break;
    }
  }

  
}