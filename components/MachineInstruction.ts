export class MachineInstruction {
  
  public mnemonic?: string;
  public code?: number;
  public parameter?: string;
  public y: number = 0; // número do banco de memória

}