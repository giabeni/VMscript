## Installation

This is a [Node.js](https://nodejs.org/en/) module.

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 0.10 or higher is required.

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
$ npm install
```

## Execution

To run the program, make sure you have all dependencies installed as detailed above. Then, open a Terminal in the root folder of the project and run

```bash
$ npm run program
```

It will start the VM, assemble the program in ./tests/program.txt, load it to the virtual memory and execute it. 
```

## Output

The buffer.txt and listing.txt outputfiles will be saved at ./outputs/.

## Logs

The logs from the VM, the Assembler and the Loader will be saved in HTML format at ./logs/.