import type { Request, Response } from 'express';
import type { ProfileData } from '../../application/interfaces/repositories/IProfileRepository.js';
import { profileService } from '../../infrastructure/container.js';

function getAuthenticatedUserId(res: Response): number {
    return (res.locals.user as { id: number }).id;
}

function profileData(body: unknown): ProfileData | null {
    // Check if the body is a valid object
    if (!body || typeof body !== 'object') {
        return null;
    }

    const value = body as Record<string, unknown>;
    // Check that required fields are strings and not empty
    if (typeof value.firstName !== 'string' || !value.firstName.trim()) {
        return null;
    }

    if (typeof value.lastName !== 'string' || !value.lastName.trim()) {
        return null;
    }

    // Check that optional fields are either undefined, null, or strings
    const optionalFields = ['middleName', 'phone', 'bio', 'location', 'profileURL'];
    if (optionalFields.some((field) => value[field] !== undefined && value[field] !== null && typeof value[field] !== 'string')) {
        return null;
    }

    // Trim the string values and return the ProfileData object
    return {
        firstName: value.firstName.trim(),
        middleName: typeof value.middleName === 'string' ? value.middleName.trim() : value.middleName as null | undefined,
        lastName: value.lastName.trim(),
        phone: typeof value.phone === 'string' ? value.phone.trim() : value.phone as null | undefined,
        bio: typeof value.bio === 'string' ? value.bio.trim() : value.bio as null | undefined,
        location: typeof value.location === 'string' ? value.location.trim() : value.location as null | undefined,
        profileURL: typeof value.profileURL === 'string' ? value.profileURL.trim() : value.profileURL as null | undefined,
    };
}

export class ProfileController {
    async getPublic(req: Request, res: Response): Promise<void> {
        const userId = Number(req.params.userId);

        if (!Number.isInteger(userId) || userId <= 0) {
            res.status(400).json({ message: 'A valid user id is required.' });
            return;
        }

        const profile = await profileService.getPublicByUserId(userId);

        if (!profile) {
            res.status(404).json({ message: 'No profile has been created for this account.' });
            return;
        }

        res.status(200).json({ profile });
    }

    // Get the profile for the authenticated user
    async get(req: Request, res: Response): Promise<void> {
        // get the profile for the authenticated user
        const profile = await profileService.getByUserId(getAuthenticatedUserId(res));

        // if the profile was not found, return a 404 Not Found response
        if (!profile) {
            res.status(404).json({ message: 'No profile has been created for this account.' });
            return;
        }

        // return the profile in the response
        res.status(200).json({ profile });
    }

    // Upsert the profile for the authenticated user
    async upsert(req: Request, res: Response): Promise<void> {
        // validate the request body and convert it to ProfileData
        const data = profileData(req.body);

        // if the data is invalid, return a 400 Bad Request response
        if (!data) {
            res.status(400).json({
                message: 'A profile requires firstName and lastName, with optional text fields.',
            });
            return;
        }


        // upsert the profile for the authenticated user
        const profile = await profileService.upsert(getAuthenticatedUserId(res), data);

        // if the profile was not found, return a 404 Not Found response
        if (!profile) {
            res.status(404).json({ message: 'No profile has been created for this account.' });
            return;
        }

        // return the updated profile in the response
        res.status(200).json({ profile });
    }

    // Upload and persist a profile picture for the authenticated user
    async uploadPicture(req: Request, res: Response): Promise<void> {
        const file = req.file;

        // If no file was uploaded, return a 400 Bad Request response
        if (!file) {
            res.status(400).json({ message: 'An image file is required.' });
            return;
        }

        // Check if the authenticated user has an existing profile before allowing the upload of a profile picture
        const userId = getAuthenticatedUserId(res);
        const existingProfile = await profileService.getByUserId(userId);

        // If the user does not have an existing profile, return a 404 Not Found response
        if (!existingProfile) {
            res.status(404).json({ message: 'Create a profile before uploading a profile picture.' });
            return;
        }

        // Update the user's profile with the new profile picture URL and return the updated profile
        const profile = await profileService.upsert(userId, {
            firstName: existingProfile.firstName,
            middleName: existingProfile.middleName,
            lastName: existingProfile.lastName,
            phone: existingProfile.phone,
            bio: existingProfile.bio,
            location: existingProfile.location,
            profileURL: `/uploads/profile-pictures/${file.filename}`,
        });

        // Return the updated profile in the response
        res.status(200).json({ profile });
    }
}

export const profileController = new ProfileController();