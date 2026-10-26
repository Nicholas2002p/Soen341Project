import { randomUUID } from 'node:crypto';
import type { IFileStorage } from '../../application/interfaces/infrastructure/IFileStorage.js';
import { getSupabaseClient } from './SupabaseClient.js';

export class SupabaseFileStorage implements IFileStorage {
    constructor(private readonly bucketName: string) {}

    // Save a file to Supabase storage and return the storage key
    async save(content: Buffer, extension: string): Promise<string> {
        // Generate a random storage key for the file
        const storageKey = `${randomUUID()}.${extension}`;

        // Upload the file to Supabase storage
        const { error } = await getSupabaseClient().storage
            .from(this.bucketName) 
            .upload(storageKey, content, { // Set the content type based on the file extension
                contentType: this.getContentType(extension),
                upsert: false,
            });

        if (error) { // If there's an error during upload, throw it
            throw error;
        }

        return storageKey;
    }

    // Read a stored file from Supabase storage
    async read(storageKey: string): Promise<Buffer> {
        // Download the file from Supabase storage
        const { data, error } = await getSupabaseClient().storage
            .from(this.bucketName)
            .download(storageKey);

        // If there's an error during download, throw it
        if (error) {
            if (error.statusCode !== '404') {
                throw error;
            }

            const missingFileError = new Error(error.message);
            missingFileError.name = 'FileNotFoundError';
            (missingFileError as NodeJS.ErrnoException).code = 'ENOENT';
            throw missingFileError;
        }

        if (!data) {
            throw new Error('Supabase returned no data for a successful download.');
        }

        // Convert the downloaded data to a Buffer and return it
        return Buffer.from(await data.arrayBuffer());
    }

    // Delete a stored file from Supabase storage
    async delete(storageKey: string): Promise<void> {
        // Remove the file from Supabase storage
        const { error } = await getSupabaseClient().storage
            .from(this.bucketName)
            .remove([storageKey]);

        //  If there's an error during deletion, throw it
        if (error) {
            throw error;
        }
    }

    // Determine the content type based on the file extension
    private getContentType(extension: string): string {
        switch (extension.toLowerCase()) {
            case 'pdf':
                return 'application/pdf'; // Add more cases for other file types as needed
            case 'doc':
                return 'application/msword';
            case 'docx':
                return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            default:
                return 'application/octet-stream';
        }
    }
}