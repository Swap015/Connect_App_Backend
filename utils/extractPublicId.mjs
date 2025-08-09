
export function extractPublicId(url) {
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/;
    const match = url.match(regex);
    return match ? match[1] : null; 
}
