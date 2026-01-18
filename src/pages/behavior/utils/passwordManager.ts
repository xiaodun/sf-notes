import { verifyPassword } from "./encrypt";

class PasswordManager {
  private password: string = "";
  private verified: boolean = false;

  setPassword(password: string) {
    this.password = password;
    this.verified = true;
  }

  getPassword(): string {
    return this.password;
  }

  isVerified(): boolean {
    return this.verified && !!this.password;
  }

  clearPassword() {
    this.password = "";
    this.verified = false;
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

