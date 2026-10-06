export interface ISaltRepository {
    // Saves the password work factor associated with a user. Existing values are updated.
    save(userId: number, saltRounds: number): Promise<void>;

    // Retrieves the rounds saved for a user's password salt.
    getSaltRounds(userId: number): Promise<number | null>;
}