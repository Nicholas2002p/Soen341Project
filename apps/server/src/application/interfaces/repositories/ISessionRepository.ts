export interface session {
    id: number;
    userId: number;
    expiresAt: Date;
}

// Define the interface for the session repository, which provides methods for creating, retrieving, and deleting sessions in the system.
export interface ISessionRepository {
    create(userId: number, tokenHash: string, expiresAt: Date): Promise<session>;
    getByTokenHash(tokenHash: string): Promise<session | null>;
    delete(sessionId: number): Promise<void>;
    deleteTokenByHash(tokenHash: string): Promise<void>;
}