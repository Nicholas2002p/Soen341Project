import { randomUUID } from 'node:crypto';
import type { IProfileImageStorage } from '../../application/interfaces/infrastructure/IProfileImageStorage.js';
import { getSupabaseClient } from './SupabaseClient.js';

const BUCKET_NAME = 'profile-images';

export class SupabaseProfileImageStorage implements IProfileImageStorage {
    async save(content: Buffer, contentType: string, extension: string): Promise<string> {
        const storageKey = `${randomUUID()}.${extension}`;
        const { error } = await getSupabaseClient()
            .storage
            .from(BUCKET_NAME)
            .upload(storageKey, content, { contentType, upsert: false });

        if (error) {
            throw error;
        }

        return getSupabaseClient()
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
        const { error } = await getSupabaseClient()
            .storage
            .from(BUCKET_NAME)
            .remove([storageKey]);

        if (error) {
            throw error;
        }
    }
}
