const steem = require('@steemit/steem-js');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let refBlockNum = 0;
let prefix = 0;
let fromAccount = '';
let toAccount = '';
let amountToSend = '';

let privateKey = '';

let transaction = {
  ref_block_num: 0,
  ref_block_prefix: 0,
  expiration: '',
  operations: [],
  extensions: []
}

let time = new Date();
time.setHours(time.getHours() + 1);
let expirationTime = time.toISOString().split('.')[0];

async function handleArgs() {
        if (process.argv.length != 7)
          handleError('Usage: node sign_offline_transfer.js <ref block num> <prefix> <from account> <to account> <amount>');
        refBlockNum = process.argv[2];
        prefix = process.argv[3];
        fromAccount = process.argv[4];
        toAccount = process.argv[5];
        amountToSend = process.argv[6];
}

async function buildTransaction() {
  transaction.ref_block_num = parseInt(refBlockNum);
  transaction.ref_block_prefix = parseInt(prefix);
  transaction.expiration = expirationTime;
  transaction.operations = [[
    'transfer',
    {
      from: fromAccount,
      to: toAccount,
      amount: amountToSend + ' STEEM',
      memo: ''
    }
  ]];
}

async function signTransaction() {
  console.log('Signed transaction: \n');
  console.log(JSON.stringify(steem.auth.signTransaction(transaction, [privateKey])));
  console.log('\n');
  process.exit(0);
}

function waitInputFromTerminal(questionText) {
  return new Promise((resolve, reject) => {
      rl.question(questionText, (input) => resolve(input) );
  });
}

async function getWifFromTerminal() {
  privateKey = await waitInputFromTerminal('Please enter your private WIF: ');
  if(!steem.auth.isWif(privateKey)) {
    handleError('This is not a valid WIF');
  }
}

function handleError(err) {
  console.log(`Error: ${err}`);
  process.exit(1);
}

handleArgs()
.then(getWifFromTerminal)
.then(buildTransaction)
.then(signTransaction);