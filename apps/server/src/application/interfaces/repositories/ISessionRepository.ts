export interface session {
    id: string;
    userId: string;
    expiresAt: Date;
}

export interface ISessionRepository {
    create(userId: string, tokenHash: string, expiresAt: Date): Promise<session>;
    getByTokenHash(tokenHash: string): Promise<session | null>;
    delete(sessionId: string): Promise<void>;
    deleteTokenByHash(tokenHash: string): Promise<void>;
}