export interface SymbolLine {
  label: string,
  value: number | undefined,
  defined: boolean,
  type: 'ADDRESS' | 'CONSTANT',
}

export class SymbolsTable {
  symbols: SymbolLine[] = [];
  constructor() {

  }

  add(symbol: SymbolLine) {
    this.symbols.push(symbol);
  }

  labelExists(label: string) {
    const symbol = this.symbols.find(s => s.label === label);
    if (symbol !== undefined)
      return true;
    else
      return false;
  }

  getSymbol(label: string): SymbolLine {
    const symbol = this.symbols.find(s => s.label === label);
    if (symbol !== undefined)
      return symbol;
    else
      throw Error('LABEL_NOT_FOUND');
  }

  getHexValue(label: string): string {
    const symbol = this.symbols.find(s => s.label === label);
    if (symbol !== undefined && symbol.value !== undefined)
      return symbol.value.toString(16);
    else
      throw Error('LABEL_NOT_FOUND');

  }

  setValue(label: string, value: number) {
    const symbol = this.symbols.find(s => s.label === label);
    if (symbol !== undefined)
      symbol.value = value;
    else
      throw Error('LABEL_NOT_FOUND');
    
    symbol.defined = true;
  }

  print(): string {
    let output = '\n\n<b>### Symbols Table ###</b><br/>\n';
    output = output + '<table>\n';
    output = output + `<tr><th>LABEL</th> <th>TYPE</th> <th>DEFINED</th> <th>VALUE</th></tr>\n`;
    
    for (const s of this.symbols) {

      output = output + ` <tr>
                            <td>${s.label}</td> 
                            <td>${s.type}</td> 
                            <td>${s.defined}</td>
                            <td>${s.value !== undefined ? '/'+s.value.toString(16).padStart(3, '0') : '?'}</td>
                          </tr>`;
    }
    output = output + '</table>\n';
    return output;
  }
}