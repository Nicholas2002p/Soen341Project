import type { Prisma } from '../../../generated/prisma/client.js';

export interface UserPreferenceRecord {
    key: string;
    value: Prisma.JsonValue;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserPreferenceRepository {
    getAll(userId: number): Promise<UserPreferenceRecord[]>;
    get(userId: number, key: string): Promise<UserPreferenceRecord | null>;
    set(userId: number, key: string, value: Prisma.InputJsonValue | Prisma.JsonNullValueInput): Promise<UserPreferenceRecord>;
    remove(userId: number, key: string): Promise<boolean>;
}
