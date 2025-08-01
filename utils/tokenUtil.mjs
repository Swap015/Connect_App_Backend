import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_EXPIRY = process.env.ACCESS_EXPIRY;
const REFRESH_EXPIRY = process.env.REFRESH_EXPIRY;


export const generateAccessToken = (userId) => {

    return jwt.sign({ userId },
        JWT_SECRET,
        { expiresIn: ACCESS_EXPIRY });

};

export const generateRefreshToken = (userId) => {
    return jwt.sign({ userId },
        JWT_SECRET,
        { expiresIn: REFRESH_EXPIRY });
};
