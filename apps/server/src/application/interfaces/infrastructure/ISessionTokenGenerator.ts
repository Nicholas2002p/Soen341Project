export interface ISessionTokenGenerator {
    generate(): string;
    hash(token: string): string;
}