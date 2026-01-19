import { verifyPassword } from "./encrypt";

class PasswordManager {
  private password: string = "";
  private verified: boolean = false;
  private setTime: number = 0; // 密码设置的时间戳（毫秒）
  private readonly EXPIRY_TIME = 60 * 60 * 1000; // 1小时（毫秒）

  setPassword(password: string) {
    this.password = password;
    this.verified = true;
    this.setTime = Date.now();
  }

  getPassword(): string {
    // 检查是否过期
    if (this.isExpired()) {
      this.clearPassword();
      return "";
    }
    return this.password;
  }

  isVerified(): boolean {
    // 检查是否过期
    if (this.isExpired()) {
      this.clearPassword();
      return false;
    }
    return this.verified && !!this.password;
  }

  clearPassword() {
    this.password = "";
    this.verified = false;
    this.setTime = 0;
  }

  private isExpired(): boolean {
    if (!this.verified || !this.password || this.setTime === 0) {
      return false;
    }
    const now = Date.now();
    const elapsed = now - this.setTime;
    return elapsed >= this.EXPIRY_TIME;
  }

  verifyPassword(encryptedNameOrData: string, useDataAsFallback: boolean = false): boolean {
    if (!this.password) {
      return false;
    }
    try {
      return verifyPassword(encryptedNameOrData, this.password, useDataAsFallback);
    } catch (error) {
      return false;
    }
  }
}

// 全局单例
const passwordManager = new PasswordManager();

export default passwordManager;

