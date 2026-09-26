export interface IPasswordHasher {
    // Hashes a password with an optional salt. If no salt is provided, a new salt will be generated.
    hash(password: string, salt?: string): Promise<string>;

    // Generates a new salt for password hashing.
    generateSalt(): Promise<string>;

    // Retrieves the default number of salt rounds used for hashing.
    getDefaultSaltRounds(): number;

    // Verifies if a given password matches the provided hash.
    verify(password: string, hash: string): Promise<boolean>;
}