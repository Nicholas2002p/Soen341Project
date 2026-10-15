import { randomUUID } from 'node:crypto';
import type { IProfileImageStorage } from '../../application/interfaces/infrastructure/IProfileImageStorage.js';
import { getSupabaseClient } from './SupabaseClient.js';

const BUCKET_NAME = 'profile-images';

export interface SupabaseProfileImageStorageClient {
    storage: {
        from(bucket: string): {
            upload(
                path: string,
                content: Buffer,
                options: { contentType: string; upsert: boolean },
            ): Promise<{ error: Error | null }>;
            getPublicUrl(path: string): { data: { publicUrl: string } };
            remove(paths: string[]): Promise<{ error: Error | null }>;
        };
    };
}

export class SupabaseProfileImageStorage implements IProfileImageStorage {
    constructor(
        private readonly client: SupabaseProfileImageStorageClient = getSupabaseClient(),
    ) {}

    async save(content: Buffer, contentType: string, extension: string): Promise<string> {
        const storageKey = `${randomUUID()}.${extension}`;
        const { error } = await this.client
            .storage
            .from(BUCKET_NAME)
            .upload(storageKey, content, { contentType, upsert: false });

        if (error) {
            throw error;
        }

        return this.client
            .storage
            .from(BUCKET_NAME)
            .getPublicUrl(storageKey).data.publicUrl;
    }

    async delete(url: string): Promise<void> {
        const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
        const markerIndex = url.indexOf(marker);

        if (markerIndex < 0) {
            return;
        }

        const storageKey = decodeURIComponent(url.slice(markerIndex + marker.length));
        const { error } = await this.client
            .storage
            .from(BUCKET_NAME)
            .remove([storageKey]);

        if (error) {
            throw error;
        }
    }
}
