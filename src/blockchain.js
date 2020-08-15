// Bu projede block larımızda data yerine para transferlerini kaydettik
// Burada transferlerin yapısını da bir class yardımıyla tanımlayacağız
// Böylece basit bir kripto para kodlamasına giriştik
// Blocklar lardaki index feature ını kaldırdık
// Burada aynı zamanda madencilik ödülü ekleyeceğiz
// Ve bekleyen işlemleri tutabileceğimiz bir alana ihtiyacımız olacak
// Blocklar arasında yapılan işlemler geçici olarak işlemler dizisinde saklanmalıdır
// Böylece bir sonraki bloğa bu işlemleri dahil edebiliriz
// Bu yüzden blockChain sınıfımızda boş bir dizi oluşturacağız
// Bir de madencilerin ne kadar ödül alacağını tutan bir veri ekleyeceğiz
// Bu ödül default olarak 100 birim para olabilir
// Madenci bir block oluşturduğunda bu ödüle sahip olabilmelidir
// Artık addBlock yerine minePendingTransactions fonksiyonumuzu yazabiliriz
// Bu fonksiyon ödülün aktarılacağı adresi parametre olarak almalıdır
// Sonra da yine bu fonksiyonda yaptığımız block ekleme işlemini tanıtacağız
// Son olarak block umuzu zincire ekleyeceğiz
// Madenci block unu oluşturduğuna göre ödülünü vereceğiz
// Bekleyen işlemler dizisini sıfırladıktan sonra para aktarma fonksiyonu ile madenciye ödülünü verelim
// Bu işlemde fromAddress null olacaktır çünkü para sistemden çıkıyor herhangi birinden değil
// Bir transfer yapıldığında bakiyelerin güncellenmesi gerekir
// Bu güncelleme için getBalanceOfAdress adında fonksiyonumuzu yarattık
// Bu fonksiyon tüm blokların tüm transactionları tarar  

// SHA256 Şifreleme algoritmasını import edelim
const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');


// Para aktarımı verisini tanımlıyoruz
// Bir adresten bir adrese bir miktar para işlemi gerçekleşir
// Bu duruma göre constructorımızı oluşturalım
// Transaction güvenliği için de keyler kullanılacak
class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    // BUrada standart hashleme yaparız
    calculateHash() {
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.fromAddress) {
            throw new Error('Transaction yapılamıyor!!');
        }

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    isValid() {
        // Adress alanını kontrol etmeliyiz
        if (this.fromAddress === null) {
            return true;
        }

        // Signature feature ında problem olup olmadığını kontrol etmeliyiz
        if (!this.signature || this.signature.length === 0) {
            throw new Error('Transactionda signature bulunmuyor!!');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');

        return publicKey.verify(this.calculateHash(), this.signature);
    }
}



// Default bir block sınıfı ile block yapısını tanımlayalım
// Blocklar birleşerek chain leri oluşturacaktır
class Block {
    // timestamp = Block un oluşturulma zamanını tutar
    // transactions = Block un taşıyacağı para transfer verilerini tutar
    // previousHash = Bir önceki block un hash ini tutar
    // hash = Block un güvenlik anahtarını tutar
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    // Block un verileri ve bir önceki block un hash i kullanılarak
    // güvenlik anahtarı SHA256 algoritması kullanılarak hesaplanır
    calculateHash() {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    // Kendi yarattığımız bloklara ayrt edici kimlik atıyoruz
    // Difficult değeri kaç ise o sayıda hash in başına 0 ekledik
    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log('Block Mined: ' + this.hash);
    }

    hasValidTransactions() {
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false;
            }
        }

        return true;
    }
}

// BlockChain i tanımladığımızı bir sınıf oluşturduk
// Biliyoruz ki blockChain blocklardan oluşuyor
class BlockChain {
    constructor() {
        // Zinciri tanımlayıp ilk block u yani genesisBlock u attık
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    // İlk block u yaratan fonksiyondur
    createGenesisBlock() {
        return new Block('01/01/2019', 'Genesis Block', '0')
    }

    // Zincirdeki son block u döndüren fonksiyondur
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    // Madencinin ödülünün verildiği fonksiyondur
    minePendingTransactions(miningRewardAddress) {
        var block = new Block(Date.now(), this.pendingTransactions);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!')
        this.chain.push(block)

        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ]
    }

    // BlockChain deki transferler dizisine yapılan transferi ekler
    addTransaction(transaction) {
        if (!transaction.fromAddress || !transaction.toAddress) {
            throw new Error('Transactionlar from ve to addres leri içermelidir!!');
        }

        if (!transaction.isValid()) {
            console.log('Transaction onaylanmadı!!')
        }

        this.pendingTransactions.push(transaction)
    }

    // Transaction sonrası tüm bütçeleri güncelleyen fonksiyondur
    getBalanceOfAddress(address) {
        var balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    // Zincirdeki blockların hashlerini ve diğer blocklarla olan hash uyumunu kontrol eder
    // Uyum tam anlamıyla sağlanıyorsa true sağlanmıyorsa false döner
    isChainValid() {
        var valid = true;

        for (var i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash() ||
                currentBlock.previousHash !== previousBlock.hash ||
                !currentBlock.hasValidTransactions()) {
                valid = false;
            }
        }

        return valid;
    }
}

// Burada oluşturduğumuz classları dışarıda kullanmak için export ediyoruz
module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;