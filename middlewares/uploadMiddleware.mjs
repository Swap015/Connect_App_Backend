
import multer from 'multer';
import { profileStorage, postStorage, resumeStorage, chatStorage } from '../config/cloudinaryConfig.mjs';

export const uploadProfile = multer({ storage: profileStorage });
export const uploadPost = multer({ storage: postStorage });
export const uploadResume = multer({ storage: resumeStorage });
export const uploadChat = multer({ storage: chatStorage });

