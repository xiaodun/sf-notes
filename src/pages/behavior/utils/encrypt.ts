import cryptoJS from "crypto-js";

/**
 * 使用密码加密文本
 */
export function encryptText(text: string, password: string): string {
  return cryptoJS.AES.encrypt(text, password).toString();
}

/**
 * 使用密码解密文本
 * 如果密码错误，返回空字符串，不抛出错误
 */
export function decryptText(encryptedText: string, password: string): string {
  try {
    const bytes = cryptoJS.AES.decrypt(encryptedText, password);
    const decrypted = bytes.toString(cryptoJS.enc.Utf8);
    // 如果解密结果为空，说明密码可能错误，但返回空字符串而不抛出错误
    return decrypted || "";
  } catch (error) {
    // 不抛出错误，返回空字符串
    return "";
  }
}

/**
 * 验证密码是否正确（通过尝试解密encryptedName或encryptedData来判断）
 * 优先使用encryptedName，如果没有则使用encryptedData
 */
export function verifyPassword(encryptedNameOrData: string, password: string, useDataAsFallback: boolean = false): boolean {
  try {
    // 尝试解密，如果能成功解密且结果不是空字符串，则密码正确
    const decrypted = decryptText(encryptedNameOrData, password);
    if (useDataAsFallback) {
      // 如果使用encryptedData，检查是否等于"加密"
      return decrypted === "加密";
    } else {
      // 使用encryptedName，检查是否不为空
      return decrypted && decrypted.trim().length > 0;
    }
  } catch (error) {
    return false;
  }
}

