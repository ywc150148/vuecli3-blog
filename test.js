// let date = '2018-03-07T16:00:00.000Z';
// let d = new Date(date).getTime()
// console.log(d)
// // console.log(date.format('YYYY-MM-DD HH:mm:ss'))

// function reg (s)   {
//     let reg = /^([a-zA-Z0-9_-]|[@]){6,12}$/;
//     console.log("s",s)
//     if (!reg.exec(s) || Object.prototype.toString.call(s)=== "[object Undefined]") return false
//     return true
// }



// console.log("reg",reg())

// const CryptoJS = require("crypto-js");

// // Encrypt 加密 
// var cipherText = CryptoJS.AES.encrypt(
//     "my message",
//     "secretkey123"
// ).toString();
// console.log(cipherText)
// // Decrypt 解密
// var bytes = CryptoJS.AES.decrypt(cipherText, "secretkey123");
// var originalText = bytes.toString(CryptoJS.enc.Utf8);
// console.log(originalText); // 'my message'

// const CryptoJS = require('crypto-js');  //引用AES源码js

// const key = CryptoJS.enc.Utf8.parse("1234123412ABCDEF");  //十六位十六进制数作为密钥
// const iv = CryptoJS.enc.Utf8.parse('ABCDEF1234123412');   //十六位十六进制数作为密钥偏移量

// //解密方法
// function Decrypt(word) {
//     let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
//     let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
//     let decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
//     let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
//     return decryptedStr.toString();
// }

// //加密方法
// function Encrypt(word) {
//     let srcs = CryptoJS.enc.Utf8.parse(word);
//     let encrypted = CryptoJS.AES.encrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
//     return encrypted.ciphertext.toString().toUpperCase();
// }

// export default {
//     Decrypt ,
//     Encrypt
// }

// var CryptoJS = require("crypto-js");

// var key = "aaaabbbbccccddddeeeeffffgggghhhh"; // 密钥，必须32字节
// var iv = "1234567812345678"; // 初始向量，必须16字节

/* aes-256-cbc 加密
 *@method encrypt
 *@text{string} 需要加密的信息
 *@return {string} base64密文
 */
// function encrypt(text) {
//     return CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(key), {
//         iv: CryptoJS.enc.Utf8.parse(iv), // 初始向量
//         mode: CryptoJS.mode.CBC, // 加密模式 aes-256-cbc
//         padding: CryptoJS.pad.Pkcs7 // 模式填充
//     }).toString()
// }


/* aes-256-cbc 解密
 *@method decrypt
 *@text{string} 需要解密的信息
 *@return {string} 明文
 */
// function decrypt(text) {
//     var result = CryptoJS.AES.decrypt(text, CryptoJS.enc.Utf8.parse(key), {
//         iv: CryptoJS.enc.Utf8.parse(iv),
//         mode: CryptoJS.mode.CBC,
//         padding: CryptoJS.pad.Pkcs7
//     })
//     return result.toString(CryptoJS.enc.Utf8)
// }

// var text = "ni你好33";
// var encoded = encrypt(text)
// console.log(encoded);
// console.log(decrypt(encoded))

// let bs = 'data:image/png;base64,iVBORw0KGgoI='
// function calculateSize(base64){
//     base64 = base64.split(',')[1]
//     base64 = base64.replace('=', "");
//     let length = base64.length;
//     let fileLength =  parseInt(length-(length/8)*2);
//     console.log('fileLength',fileLength)
// }

// calculateSize(bs)
