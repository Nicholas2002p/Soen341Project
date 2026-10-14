export interface IProfileImageStorage {
    save(content: Buffer, contentType: string, extension: string): Promise<string>;
    delete(url: string): Promise<void>;
}
