import cryptoJS from "crypto-js";

/**
 * 使用密码加密文本
 */
export function encryptText(text: string, password: string): string {
  return cryptoJS.AES.encrypt(text, password).toString();
}

/**
 * 使用密码解密文本
 */
export function decryptText(encryptedText: string, password: string): string {
  try {
    const bytes = cryptoJS.AES.decrypt(encryptedText, password);
    return bytes.toString(cryptoJS.enc.Utf8);
  } catch (error) {
    throw new Error("解密失败，密码可能不正确");
  }
}

/**
 * 验证密码是否正确（通过解密encryptedData，判断是否等于"加密"）
 */
export function verifyPassword(encryptedData: string, password: string): boolean {
  try {
    const decrypted = decryptText(encryptedData, password);
    return decrypted === "加密";
  } catch (error) {
    return false;
  }
}

