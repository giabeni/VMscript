export function not(binNumber : number | string): number {
  binNumber = binNumber.toString(2); // ex. 0000 1010

  if (binNumber.length > 4 && binNumber.length <= 8) {
    binNumber = binNumber.padStart(8, '0'); 
  }else if (binNumber.length > 9 && binNumber.length <= 12) {
    binNumber = binNumber.padStart(12, '0'); 
  }else if (binNumber.length <= 4) {
    binNumber = binNumber.padStart(4, '0'); 
  }
  
  binNumber = binNumber.replace(/1/g, 'X'); // ex. 0000 X0X0
  binNumber = binNumber.replace(/0/g, '1'); // ex. 1111 X1X1
  binNumber = binNumber.replace(/X/g, '0'); // ex. 1111 0101

  return Number('0b' + binNumber);
}

export function binToComplement2inv(binNumber: number) {
  // console.log('bin', binNumber.toString(2));
  
  binNumber = binNumber - 0b1;
  // console.log('bin-1', binNumber.toString(2));
  binNumber = not(binNumber);
  // console.log('not bin', binNumber.toString(2));

  return binNumber.toString(2);
}

export function binToComplement2(binNumber: number) {
  // console.log('bin', binNumber.toString(2));
  binNumber = not(binNumber);  
  // console.log('not bin', binNumber.toString(2));
  binNumber = binNumber + 0b1;
  // console.log('bin + 1', binNumber.toString(2));
  return binNumber.toString(2);
}

export function binToHex(binNumber: string) {
  return Number('0x' + Number('0b'+binNumber).toString(16));
}