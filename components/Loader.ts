import fs from 'fs';
import { Memory } from './Memory';
import { Logger } from './Logger';

export class Loader {

  public counter = 0x0;
  public buffer: string[] = [];
  private memory: Memory;
  private logger: Logger = new Logger('./logs/loader.html');
  constructor(memory: Memory){
    this.memory = memory;

    this.logger.h1('LOADER LOGS');
    this.logger.p('Processed at ' + (new Date()).toLocaleDateString());
    this.logger.hr();
  }

  load() {

    this.logger.h2('Starting load...');    

    this.logger.h3('Getting buffer');
    this.logger.openContainer();
    const buffer = this.buffer;
    this.logger.block(buffer.join('  '), true);
    if (buffer.length === 0) {
       this.logger.h4('Buffer is empty. Aborting...');
       throw Error('EMPTY_BUFFER');
    }
    this.logger.h4('Buffer not empty.');
    this.logger.closeContainer();

    if(!this.checkBuffer(buffer)) {
      throw Error('INVALID_BUFFER');
    }

    const startAddress = Number('0x' + buffer[1] + buffer[2]);
    this.counter = startAddress;

    this.logger.h3('Filling memory...');
    for (let i = 3; i < buffer.length - 1; i = i + 1) {
      this.logger.openContainer();
      
      this.logger.key('Address', this.counter.toString(16).toUpperCase());
      this.logger.key('Value', buffer[i].toUpperCase());
      this.memory.write(this.counter, buffer[i].toUpperCase());
      this.counter = this.counter + 0x1;

      this.logger.closeContainer();
    };

    this.logger.block(this.memory.print(), true);
  }

  checkBuffer(buffer: string[]) {
    this.logger.h3('Checking data...');
    const checksum = Number('0x' + buffer[buffer.length - 1]);
    this.logger.openContainer();
    this.logger.key('Checksum', checksum.toString(16).toUpperCase());
    let sum = 0x0;

    for (let i = 0; i < buffer.length - 1; i++) {
      sum = (sum + Number('0x' + buffer[i])) % 0x100;
    };

    this.logger.key('Sum', sum.toString(16).toUpperCase());
    if (checksum === sum) {
      this.logger.h4('DATA OK');
    } else {
      this.logger.h4('INVALID DATA!');
    }

    this.logger.closeContainer();

    return checksum === sum;
  }

  setBuffer(path: string) {
    const file = fs.readFileSync(path); //carrega conteúdo do arquivo
    const bytes = file.toString().split(/(\s+)/).filter(e => e.trim().length > 0); //cria array separado por espaços

    this.buffer = bytes;
  }
}