import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { IFileStorage } from '../../application/interfaces/infrastructure/IFileStorage.js';

// Stores files in a folder on the server. The folder is not served publicly,
// so files can only be downloaded through the API after an ownership check.
export class LocalFileStorage implements IFileStorage {
    constructor(private readonly directory: string) {}

    // Only use the base name of a key so it can never point outside the storage folder
    private resolve(storageKey: string): string {
        return path.join(this.directory, path.basename(storageKey));
    }

    // Save a file under a random name and return that name as its key
    async save(content: Buffer, extension: string): Promise<string> {
        await mkdir(this.directory, { recursive: true });

        const storageKey = `${randomUUID()}.${extension}`;
        await writeFile(this.resolve(storageKey), content);

        return storageKey;
    }

    // Read a stored file by its key
    async read(storageKey: string): Promise<Buffer> {
        return readFile(this.resolve(storageKey));
    }

    // Delete a stored file, does nothing if it does not exist
    async delete(storageKey: string): Promise<void> {
        await rm(this.resolve(storageKey), { force: true });
    }
}
