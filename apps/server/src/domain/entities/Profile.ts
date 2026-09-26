// Contains all info a entry in the profile table would have
export interface Profile {
    profileId: number;
    userId: number;
    firstName: string;
    middleName: string | null;
    lastName: string;
    phone: string | null;
    bio: string | null;
    location: string | null;
    profileURL: string | null;
}

export interface PublicProfile {
    userId: number;
    firstName: string;
    middleName: string | null;
    lastName: string;
    bio: string | null;
    location: string | null;
    profileURL: string | null;
}