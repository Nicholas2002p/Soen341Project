import bcrypt from 'bcrypt';
import type { IPasswordHasher } from '../../application/interfaces/infrastructure/IPasswordHasher.js';

export class BcryptPasswordHasher implements IPasswordHasher {
    private static readonly DEFAULT_SALT_ROUNDS = 10;

    // Bcrypt owns salt generation; callers only provide the work factor.
    async hash(password: string, saltRounds: number = BcryptPasswordHasher.DEFAULT_SALT_ROUNDS): Promise<string> {
        return bcrypt.hash(password, saltRounds);
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