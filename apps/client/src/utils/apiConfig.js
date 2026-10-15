export function getApiUrl(path) {
    const apiBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

    if (!apiBaseUrl) {
        throw new Error("VITE_API_URL is not configured");
    }

    return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
