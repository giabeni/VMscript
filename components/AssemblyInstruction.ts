import { binToComplement2, binToComplement2inv } from "../lib/utils";

export class AssemblyInstruction {
  public label: string = '';
  public mnemonic: string = '';
  public parameter?: string;
  public comment?: string;
  private link = false;

  constructor(line: string) {
    line = line.split(';',2)[0];
    this.comment = line.split(';', 2)[1];
    const lineElements = line.split(/(\s+)/).filter(e => e.trim().length > 0); //separa elementos por espaço;
    if (lineElements.length === 2) {
      this.mnemonic = lineElements[0].toUpperCase();
      this.parameter = lineElements[1];
    } else 
    if (lineElements.length === 3) {
      if (lineElements[2].charAt(0) === ';') {
        this.mnemonic = lineElements[0].toUpperCase();
        this.parameter = lineElements[1];
        this.comment = lineElements[2];
      } else {
        this.label = lineElements[0];
        this.mnemonic = lineElements[1].toUpperCase();
        this.parameter = lineElements[2];
      }
    } else 
    if(lineElements.length === 4){
      this.label = lineElements[0];
      this.mnemonic = lineElements[1].toUpperCase();
      this.parameter = lineElements[2];
      this.comment = lineElements[3];
    } else 
    if(lineElements.length === 1){
      this.label = lineElements[0];
      this.link = true;
    }
  }

  setProperties(label: string, mnemonic: string, parameter: string, comment: string = ''): void {
    this.label = label;
    this.mnemonic = mnemonic.toUpperCase();
    this.parameter = parameter;
    this.comment = comment;
  }

  isPseudo(): boolean {
    return ['@', '#', '$', 'K'].includes(this.mnemonic);
  }

  hasLabel(): boolean {
    return this.label !== undefined && this.label.length > 0;
  }

  getBinParameter(bytes = 3): string { 
    if (!this.parameter)
      return '';
    
    let signal = (this.parameter.charAt(0) === '-') ? -1 : 1;
    let parameter = this.parameter;
    parameter = parameter.replace('+', '');
    parameter = parameter.replace('-', '');
    
    let binValue: string;
    if (parameter.charAt(0) === '/') { // se for HEXA (/)
      binValue = (Number('0x' + parameter.slice(1))).toString(2); // converte para binario    
      if(signal === -1) { // se for negativo
        binValue = binToComplement2inv(Number('0b'+binValue)); // retira 1 e inverte bits (complemento de dois)
      }  
    }
    else if (parameter.charAt(0) === '"') { // se for ASCII
      binValue = (Number(parameter.slice(1, parameter.length - 1).charCodeAt(0))).toString(2); // se for ASCII ("), retorna o código ascii bin
      if(signal === -1) { // se for negativo
        binValue = binToComplement2(Number('0b'+binValue)); // inverte bits e add 1 (complemento de dois)
      }
    }
    else  {
      binValue = (Number(parameter)).toString(2); // se for decimal, retorna convertido para base 2
      if(signal === -1) { // se for negativo
        binValue = binToComplement2(Number('0b'+binValue)); // inverte bits e add 1(complemento de dois)
      }
    }

    

    return binValue.padStart(4*bytes, '0'); // retorna com padding
  }

  public isLink(): boolean {
    return this.link;
  }

  public getLabelParameter(): string {
    if(this.parameter) {
      return this.parameter;
    } else {
      throw Error('NO_PARAMETER');
    }
  }

  public hasLabelParameter(): boolean {
    if (this.parameter) {
      if (['/', '+', '-', '"'].includes(this.parameter.charAt(0))) { // se parametro é imediato
        return false;
      } else if(/^\d+$/.test(this.parameter)) { // se só contem digitos
        return false;
      } else return true;
    } else 
      return false;
  }

}