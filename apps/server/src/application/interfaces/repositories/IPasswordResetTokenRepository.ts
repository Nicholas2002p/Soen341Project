export interface PasswordResetToken {
    id: number;
    userId: number;
    tokenHash: string;
    expiresAt: Date;
}

export interface IPasswordResetTokenRepository {
    create(userId: number, tokenHash: string, expiresAt: Date): Promise<PasswordResetToken>;
    getByTokenHash(tokenHash: string): Promise<PasswordResetToken | null>;
    deleteById(id: number): Promise<void>;
    deleteByUserId(userId: number): Promise<void>;
}
