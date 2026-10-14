import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { IProfileImageStorage } from '../../application/interfaces/infrastructure/IProfileImageStorage.js';

export class LocalProfileImageStorage implements IProfileImageStorage {
    constructor(private readonly directory: string) {}

    async save(content: Buffer, _contentType: string, extension: string): Promise<string> {
        await mkdir(this.directory, { recursive: true });
        const fileName = `${randomUUID()}.${extension}`;
        await writeFile(path.join(this.directory, fileName), content);
        return `/uploads/profile-pictures/${fileName}`;
    }

    async delete(url: string): Promise<void> {
        const fileName = path.basename(url);
        await rm(path.join(this.directory, fileName), { force: true });
    }
}
