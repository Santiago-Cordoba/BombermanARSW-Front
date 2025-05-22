import CryptoJS from "crypto-js";

const SECRET_KEY = "clave-super-secreta-123"; 
const IV = "1234567890abcdef"; 


export const decryptData = (encryptedData: string): string => {
  try {
    const keyHash = CryptoJS.SHA256(SECRET_KEY);
    const key = CryptoJS.enc.Hex.parse(keyHash.toString().substring(0, 32)); 
    const iv = CryptoJS.enc.Utf8.parse(IV);
    

    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    const result = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!result) {
      throw new Error("Decryption failed - empty result");
    }
    
    return result;
  } catch (error) {
    console.error("Decryption error:", error);
    throw error;
  }
};


export const encryptData = (data: any): string => {
  const keyHash = CryptoJS.SHA256(SECRET_KEY);
  const key = CryptoJS.enc.Hex.parse(keyHash.toString().substring(0, 32)); 
  const iv = CryptoJS.enc.Utf8.parse(IV);
  
  const stringData = typeof data === 'string' ? data : JSON.stringify(data);
  
  return CryptoJS.AES.encrypt(stringData, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString();
};