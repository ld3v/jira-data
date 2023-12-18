import * as crypto from "node:crypto";

export const encryptData = (data: string): string => {
  try {
    const iv = Buffer.from(process.env.CIPHER_IV as string, "hex");
    const sr = Buffer.from(process.env.CIPHER_SECRET as string, "hex");
    const cipherText = crypto.createCipheriv("aes-256-cbc", sr, iv);
    return Buffer.from(
      cipherText.update(data, "utf8", "hex") + cipherText.final("hex")
    ).toString("base64");
  } catch (err: any) {
    throw err.message;
  }
};

export const decryptData = <T>(token: string): T => {
  try {
    const iv = Buffer.from(process.env.CIPHER_IV as string, "hex");
    const sr = Buffer.from(process.env.CIPHER_SECRET as string, "hex");
    const buff = Buffer.from(token, "base64");
    const decipher = crypto.createDecipheriv("aes-256-cbc", sr, iv);
    const jsonStringifiedData =
      decipher.update(buff.toString("utf8"), "hex", "utf8") +
      decipher.final("utf8");
    return JSON.parse(jsonStringifiedData);
  } catch (err: any) {
    throw err.message;
  }
};
