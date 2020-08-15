// blockchain.js dosyası içerisinden kullanacağımız classları alıyoruz
const {
    BlockChain,
    Transaction
} = require('./blockchain');

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('e8a81f343672200dd43ceef9ede090a91519d636006f299acc2f423121e50599')
const myWalletAddress = myKey.getPublic('hex');


let fyCoin = new BlockChain();

// Benden, 'KİME', Ne Kadar? 
// Bir hesaptan başka bir hesaba para gönderelim
// Bu işlemler sıraya girip bekleyecekler
// Yani blocklarımızı oluşturduk ve zincire girmesini bekleyeceğiz 
const tx1 = new Transaction(myWalletAddress, 'Alıcı Adresi (Public Key)', 10);
tx1.signTransaction(myKey);
fyCoin.addTransaction(tx1);

console.log('STARTING THE MINER..');

// Şimdi de madenciye giddecek olan miktarı belirlicez
// İşlemleri ben yaptıysam bana düşecek olan payı belirlemeliyim
fyCoin.minePendingTransactions(myWalletAddress)

// Hesabımdaki değişikliği görelim
// Başlangıçta 0 olması normaldir
console.log('FYHesap Bakiyesi --> ', fyCoin.getBalanceOfAddress(myWalletAddress))
console.log('------------------------------------------------------')

var chainLength = Number(fyCoin.chain.length - 1);
var transactionLength = Number(fyCoin.chain[chainLength].transactions.length - 1);
var lastTransactionData = fyCoin.chain[chainLength].transactions[transactionLength];

console.log('Gönderen Adresi --> ' + lastTransactionData.fromAddress)
console.log('Alıcı Adresi --> ' + lastTransactionData.toAddress)
console.log('Miktar --> ' + lastTransactionData.amount)