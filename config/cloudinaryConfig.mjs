

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const profileStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'connect/profile',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }],
    },
});

export const postStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'connect/posts',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

export default cloudinary;
