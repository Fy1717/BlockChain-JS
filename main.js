// SHA256 Şifreleme algoritmasını import edelim
const SHA256 = require('crypto-js/sha256');

// Default bir block sınıfı ile block yapısını tanımlayalım
// Blocklar birleşerek chain leri oluşturacaktır
class Block {
    // index = Block un chain dizisindeki indexini tutar
    // timestamp = Block un oluşturulma zamanını tutar
    // data = Block un taşıyacağı veriyi tutar
    // previousHash = Bir önceki block un hash ini tutar
    // hash = Block un güvenlik anahtarını tutar
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    // Block un verileri ve bir önceki block un hash i kullanılarak
    // güvenlik anahtarı SHA256 algoritması kullanılarak hesaplanır
    calculateHash() {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
    }
}

// BlockChain i tanımladığımızı bir sınıf oluşturduk
// Biliyoruz ki blockChain blocklardan oluşuyor
class BlockChain {
    constructor() {
        // Zinciri tanımlayıp ilk block u yani genesisBlock u attık
        this.chain = [this.createGenesisBlock()];
    }

    // İlk block u yaratan fonksiyondur
    createGenesisBlock() {
        return new Block(0, '01/01/2019', 'Genesis Block', '0')
    }

    // Zincirdeki son block u döndüren fonksiyondur
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    // Zincire yeni block eklememizi sağlayan fonksiyondur
    addBlock(newBlock) {
        // Yeni block un previousHash attribute u, son block un hash i ne eşittir
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
    }

    // Zincirdeki blockların hashlerini ve diğer blocklarla olan hash uyumunu kontrol eder
    // Uyum tam anlamıyla sağlanıyorsa true sağlanmıyorsa false döner
    isChainValid() {
        var valid = true;

        for (var i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash() ||
                currentBlock.previousHash !== previousBlock.hash) {
                valid = false;
            }
        }

        return valid;
    }
}

// BlockChain den bir örnek yaratıp içerisine örnek blocklar ekledik 
let fyCoin = new BlockChain();

// Block verilerine contructor a uygun olarak index, time, data gönderdik
// previousHash ve hash attributeleri addBlock fonksiyonu içerinde ayarlandı 
fyCoin.addBlock(new Block(1, '03/08/2019', {
    amount: 5
}));

fyCoin.addBlock(new Block(2, '24/0/2020', {
    amount: 7
}));


// Örnek BlockChain i console da görelim
// console.log(JSON.stringify(fyCoin, null, 4));

// BlockChain in güvenliğini kontrol edelim
console.log('Is BlockChain Valid ? --> ' + fyCoin.isChainValid())