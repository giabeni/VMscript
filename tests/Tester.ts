import { AssemblyInstruction } from '../components/AssemblyInstruction';
import { Assembler } from '../components/Assembler';
import { Loader } from '../components/Loader';
import { Memory } from '../components/Memory';
import { VirtualMachine } from '../components/VirtualMachine';
export class Tester {

  static testLineTranslation(line: string, expectedBin?: string, expectedHex?: string) {
    const instruction = new AssemblyInstruction(line);
    const param = instruction.getBinParameter();
    const mnemonic = Assembler.getMnemonicCode(instruction.mnemonic);
    const opLength = Assembler.getOperandLength(instruction.mnemonic);

    return { 
      instruction,
      param,
      paramDec: Number('0b'+param),
      paramHex: Number('0b'+param).toString(16),
      mnemonic,
      opLength
    }

  }

  static testFile1() {
    const vm = new VirtualMachine();
    vm.loadProgram('./tests/program3.txt');
    vm.setPC(0x010);
    vm.run();
    vm.printMemory();
  }
}