import fs from 'fs';

export class Logger {
  private path: string;
  constructor(path: string) {
    this.path = path;
    fs.writeFileSync(path, '');
    fs.appendFileSync(path, `<!DOCTYPE html>`, 'utf8');
    fs.appendFileSync(path, `
    <style>
      body {
        padding: 20px 100px;
        font-family: Arial;
        color: #000;
      }

      h1 {
        color: darkblue;
      }

      h3 {
        color: darkgreen;
      }

      h4 {
        color: darkblue;
      }

      h5 {
        color: #666666;
      }

      span {
        background: rgba(255, 255, 255, 0.5);
      }

      blockquote {
        border: 1px dashed #d07100;
        padding: 5px;
        background: rgba(255, 255, 255, 0.5);
        font-family: Courier;
      }

      table {
        width: 100%;
        text-align: left;
        border-collapse: collapse;
      }
      
      table th{
        border-bottom: 1px solid #ddd;
      }

      table td{
        border-bottom: 1px solid #e0e0e0;
        padding: 5px 0;
      }

      .show-hover {
        height: 18px;
        overflow: hidden;
      }

      .show-hover:hover {
        height: auto;
      }

    </style>
    
    `, 'utf8');
  }

  h1(text: string) {
    fs.appendFileSync(this.path, `<h1>${text}</h1>`, 'utf8');
  }

  h2(text: string) {
    fs.appendFileSync(this.path, `<h2>${text}</h2>`, 'utf8');
  }

  h3(text: string) {
    fs.appendFileSync(this.path, `<h3>${text}</h3>`, 'utf8');
  }

  h4(text: string) {
    fs.appendFileSync(this.path, `<h4>${text}</h4>`, 'utf8');
  }

  h5(text: string) {
    fs.appendFileSync(this.path, `<h5>${text}</h5>`, 'utf8');
  }

  p(text: string) {
    fs.appendFileSync(this.path, `<p>${text}</p>`, 'utf8');
  }

  hr() {
    fs.appendFileSync(this.path, `<hr/>`, 'utf8');
  }

  block(text: string, hidden = false) {
    if(hidden){
      fs.appendFileSync(this.path, `<center><small>(Pass mouse over to open)</small></center>`, 'utf8');
      fs.appendFileSync(this.path, `<blockquote class="show-hover">${text}</blockquote>`, 'utf8');
    }else
      fs.appendFileSync(this.path, `<blockquote>${text}</blockquote>`, 'utf8');
  }

  key(key: string, value: string, breakLine = false) {
    fs.appendFileSync(this.path, `<span style="padding: 5px; border: 1px solid #ccc; margin:auto 5px; font-family: Courier;"><strong>${key}:</strong> ${value}</span>`, 'utf8');
    if(breakLine)
      fs.appendFileSync(this.path, '\n<p></p>\n', 'utf8');
  }

  openContainer(level = 1) {
    fs.appendFileSync(this.path, `<div style="margin: 20px 0px 10px ${level*2}%; border: 1px solid #999; padding: 10px; background: rgba(150,150,150,0.2);">`, 'utf8');
  }

  closeContainer() {    
    fs.appendFileSync(this.path, `</div>`, 'utf8');
  }

  openIndentation(level = 1) {    
    fs.appendFileSync(this.path, `<div style="padding-left: ${level*5}%">`, 'utf8');
  }

  closeIndentation() {    
    fs.appendFileSync(this.path, `</div>`, 'utf8');
  }

  textarea(text: string) {
    fs.appendFileSync(this.path, `<pre><textarea disabled rows="25" cols="100" style="padding: 10px">${text}</textarea></pre>`, 'utf8');
  }


}