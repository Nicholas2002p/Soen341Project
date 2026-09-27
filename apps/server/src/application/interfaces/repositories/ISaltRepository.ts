export interface ISaltRepository {
    // Saves the salt associated with a specific user ID. If a salt already exists for the user, it will be updated; otherwise, a new entry will be created.
    save(userId: number, salt: string): Promise<void>;

    // Retrieves the rounds saved for a user's password salt.
    getSaltRounds(userId: number): Promise<number | null>;
}