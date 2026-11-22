import { unavailable } from './unavailable';

export function createTransport(): never {
  return unavailable('nodemailer (SMTP)');
}
export default { createTransport };
