// npm install elliptic
// public ve private keyin alınabileceği kütüphaneler

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const key = ec.genKeyPair();
const publicKey = key.getPublic('hex') // 16 bitlik alınıyor
const privateKey = key.getPrivate('hex') // 16 bitlik alınıyor

console.log('PRIVATE KEY ---> ', privateKey)
console.log('PUBLIC KEY ---> ', publicKey)