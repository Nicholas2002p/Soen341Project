// Define the interface for file storage, so resumes can be stored on disk now and moved to cloud storage later.
export interface IFileStorage {
    // Save a file and return the key used to find it later
    save(content: Buffer, extension: string): Promise<string>;

    // Read a stored file by its key
    read(storageKey: string): Promise<Buffer>;

    // Delete a stored file, does nothing if it does not exist
    delete(storageKey: string): Promise<void>;
}
