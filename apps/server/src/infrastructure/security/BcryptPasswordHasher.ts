import bcrypt from 'bcrypt';
import type { IPasswordHasher } from '../../application/interfaces/infrastructure/IPasswordHasher.js';

export class BcryptPasswordHasher implements IPasswordHasher {
    private static readonly DEFAULT_SALT_ROUNDS = 10;

    // Hashes a password using bcrypt with an optional salt. If no salt is provided, a new salt will be generated.
    async hash(password: string, salt?: string): Promise<string> {
        return bcrypt.hash(password, salt ?? await this.generateSalt());
    }

    // Generates a new salt for password hashing using bcrypt with the default number of salt rounds.
    async generateSalt(saltRounds: number = BcryptPasswordHasher.DEFAULT_SALT_ROUNDS): Promise<string> {
        return bcrypt.genSalt(saltRounds);
    }

    // Retrieves the default number of salt rounds used for hashing, which is defined as a static constant in the class.
    getDefaultSaltRounds(): number {
        return BcryptPasswordHasher.DEFAULT_SALT_ROUNDS;
    }

    // Verifies if a given password matches the provided hash using bcrypt's compare function.
    async verify(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}