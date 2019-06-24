export class Memory {
  private data: string[];
  private size: number;
  constructor(size: number) {
    this.size = size;
    this.data = (new Array<string>(size)).fill('00');
  }

  public write (address: number, byte: string) {
    if (byte.length !== 2 || !/[0-9a-f]+/i.test(byte))
      throw Error('INVALID_FORMAT');
    this.data[address] = byte;
  }

  public read (address: number, numOfBytes = 2) {
    let data: string = '';
    for (let i = 0; i < numOfBytes; i = i + 0x1) {
      data = data + this.data[address + i];
    }
    return data;
  }

  public print () {
    let output = '\n\n<b>### MEMORY ###</b><br/>\n';
    output = output + '<table>\n<tr>';
    output = output + `<th></th> <th>0</th> <th>1</th> <th>2</th> <th>3</th> <th>4</th> <th>5</th> <th>6</th> <th>7</th> <th>8</th> <th>9</th> <th>A</th> <th>B</th> <th>C</th> <th>D</th> <th>E</th> <th>F</th></tr>\n`;
    for (let line = 0x000; line < this.size; line = line + 0x010) {
      output = output +
                  '<tr><td><b>0x' + line.toString(16).toUpperCase().padStart(3, '0').substr(0,2) + '_</b></td>' +
                  '<td>' + this.data[line + 0x0] + '</td>' +
                  '<td>' + this.data[line + 0x1] + '</td>' +
                  '<td>' + this.data[line + 0x2] + '</td>' +
                  '<td>' + this.data[line + 0x3] + '</td>' +
                  '<td>' + this.data[line + 0x4] + '</td>' +
                  '<td>' + this.data[line + 0x5] + '</td>' +
                  '<td>' + this.data[line + 0x6] + '</td>' +
                  '<td>' + this.data[line + 0x7] + '</td>' +
                  '<td>' + this.data[line + 0x8] + '</td>' +
                  '<td>' + this.data[line + 0x9] + '</td>' +
                  '<td>' + this.data[line + 0xA] + '</td>' +
                  '<td>' + this.data[line + 0xB] + '</td>' +
                  '<td>' + this.data[line + 0xC] + '</td>' +
                  '<td>' + this.data[line + 0xD] + '</td>' +
                  '<td>' + this.data[line + 0xE] + '</td>' +
                  '<td>' + this.data[line + 0xF] +'</td></tr>';     
    }
    output = output + '\n</table>\n';

    return output;
  }
}