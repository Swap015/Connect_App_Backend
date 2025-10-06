
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

//PROFILE PHOTO
export const profileStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'connect/profile',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
    },
});

//POST
export const postStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        let resourceType = 'image';
        if (file.mimetype === 'application/pdf') {
            resourceType = 'raw';
        } else if (file.mimetype.startsWith('video/')) {
            resourceType = 'video';
        }
        return {
            folder: 'connect/posts',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf', 'mp4', 'mov'],
            resource_type: resourceType,
        };
    },
});


//RESUME

export const resumeStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "connect/resumes",
        allowed_formats: ["pdf"],  
        resource_type: "auto",     
    },
});


// CHAT (attachments)
export const chatStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        let resourceType = "image";
        if (file.mimetype.startsWith("video/")) {
            resourceType = "video";
        } else if (
            file.mimetype !== "image/jpeg" &&
            file.mimetype !== "image/png" &&
            file.mimetype !== "image/webp"
        ) {
            resourceType = "raw"; // for docs, pdfs, zips etc
        }

        return {
            folder: "connect/chat",
            resource_type: resourceType,
        };
    },
});



export default cloudinary;
