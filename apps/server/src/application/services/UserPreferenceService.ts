import type { Prisma } from '../../generated/prisma/client.js';
import type {
    IUserPreferenceRepository,
    UserPreferenceRecord,
} from '../interfaces/repositories/IUserPreferenceRepository.js';

export const PUSH_NOTIFICATIONS_PREFERENCE_KEY = 'push_notifications';

export class UserPreferenceService {
    constructor(private readonly repository: IUserPreferenceRepository) {}

    private validateKey(key: string): void {
        if (!/^[a-z][a-z0-9_]*$/.test(key) || key.length > 100) {
            throw new Error('Preference keys must contain only lowercase letters, numbers, and underscores.');
        }
    }

    async getAll(userId: number): Promise<UserPreferenceRecord[]> {
        return this.repository.getAll(userId);
    }

    async get(userId: number, key: string): Promise<UserPreferenceRecord | null> {
        this.validateKey(key);
        return this.repository.get(userId, key);
    }

    async set(
        userId: number,
        key: string,
        value: Prisma.InputJsonValue | Prisma.JsonNullValueInput,
    ): Promise<UserPreferenceRecord> {
        this.validateKey(key);
        if (key === PUSH_NOTIFICATIONS_PREFERENCE_KEY && typeof value !== 'boolean') {
            throw new Error('push_notifications must be a boolean.');
        }
        return this.repository.set(userId, key, value);
    }

    async remove(userId: number, key: string): Promise<boolean> {
        this.validateKey(key);
        return this.repository.remove(userId, key);
    }

    async pushNotificationsEnabled(userId: number): Promise<boolean> {
        const preference = await this.repository.get(userId, PUSH_NOTIFICATIONS_PREFERENCE_KEY);
        return preference?.value === true;
    }
}
