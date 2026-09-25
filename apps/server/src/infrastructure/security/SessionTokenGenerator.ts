import { randomBytes, createHash } from 'node:crypto';
import { ISessionTokenGenerator } from '../../application/interfaces/infrastructure/ISessionTokenGenerator.js';

export class SessionTokenGenerator implements ISessionTokenGenerator {
    // Generate a random session token and return it as a hexadecimal string
    generate(): string {
        return randomBytes(32).toString('hex');
    }

    // Hash the session token using SHA-256 and return the hash as a hexadecimal string
    hash(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }
}
