import bcrypt from 'bcrypt';
import { IPasswordHasher } from '../../application/interfaces/infrastructure/IPasswordHasher.js';

export class BcryptPasswordHasher implements IPasswordHasher {
    // Hash a password using bcrypt
    async hash(password: string): Promise<string> {
        const saltRounds = 10; // You can adjust the number of salt rounds for security/performance trade-off
        return bcrypt.hash(password, saltRounds);
    }

    // Verify a password against a hash
    async verify(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}