// Define the interface for the session token generator, which provides methods for generating and hashing session tokens.
export interface ISessionTokenGenerator {
    generate(): string;
    hash(token: string): string;
}