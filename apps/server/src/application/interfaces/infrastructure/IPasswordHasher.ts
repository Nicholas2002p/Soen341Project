export interface IPasswordHasher {
    //hash a password, returns the hashed password
    hash(password: string): Promise<string>;

    //verify a password against a hash, returns true if the password matches the hash, false otherwise
    verify(password: string, hash: string): Promise<boolean>;
}