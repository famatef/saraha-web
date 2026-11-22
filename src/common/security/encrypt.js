import crypto from 'node:crypto';
import { ENCRYPTION_KEY } from '../../../config/config.service.js';
const key = Buffer.from(ENCRYPTION_KEY, 'utf8');
const IV_LENGTH = 16;

export function Encrypt(plainText) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');

  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}
export function Decrypt(text) {
    const[ivHex, encryptedText] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}


