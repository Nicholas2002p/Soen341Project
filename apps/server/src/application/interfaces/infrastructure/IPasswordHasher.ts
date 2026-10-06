export interface IPasswordHasher {
    // Hashes a password using the requested work factor. The implementation owns the salt generation.
    hash(password: string, saltRounds?: number): Promise<string>;

    // Retrieves the default number of salt rounds used for hashing.
    getDefaultSaltRounds(): number;

    // Verifies if a given password matches the provided hash.
    verify(password: string, hash: string): Promise<boolean>;
}