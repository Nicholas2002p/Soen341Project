const defaultProfilePath = '/uploads/profile-pictures/profile_default.jpg';
const publicServerURL = process.env.PUBLIC_SERVER_URL?.replace(/\/+$/, '');

export function toPublicProfileURL(profileURL: string): string {
    if (!publicServerURL || /^[a-z][a-z\d+.-]*:/i.test(profileURL) || profileURL.startsWith('//')) {
        return profileURL;
    }

    return `${publicServerURL}/${profileURL.replace(/^\/+/, '')}`;
}

export const defaultProfileURL = toPublicProfileURL(
    process.env.DEFAULT_PROFILE_IMAGE_URL ?? defaultProfilePath,
);
