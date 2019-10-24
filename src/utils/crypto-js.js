var CryptoJS = require("crypto-js");

var key = "aaaabbbbccccddddeeeeffffgggghhhh"; // 密钥，必须32字节
var iv = "1234567812345678"; // 初始向量，必须16字节

/* aes-256-cbc 加密
 *@method encrypt
 *@text{string} 需要加密的信息
 *@return {string} base64密文
 */
function encrypt(text) {
    return CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv), // 初始向量
        mode: CryptoJS.mode.CBC, // 加密模式 aes-256-cbc
        padding: CryptoJS.pad.Pkcs7 // 模式填充
    }).toString()
}

/* aes-256-cbc 解密
 *@method decrypt
 *@text{string} 需要解密的信息
 *@return {string} 明文
 */
function decrypt(text) {
    var result = CryptoJS.AES.decrypt(text, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    })
    return result.toString(CryptoJS.enc.Utf8)
}

export {
    encrypt,
    decrypt,
}