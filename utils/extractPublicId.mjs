
export function extractPublicId(url) {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
};
