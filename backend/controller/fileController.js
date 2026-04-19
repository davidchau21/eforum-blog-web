import User from '../Schema/User.js';
import File from '../Schema/File.js';
import { uploadFile } from '../service/supabase.js';
import AWS from 'aws-sdk';

/*
/**
 * AWS S3 File Upload (Original) - Commented out
 * /
export const createFileS3 = async (req, res, next) => {
    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_BUCKET_REGION
    });

    try {
        const files = req.files;
        if (!files) {
            return res.status(400).json({ code: 400, success: false, message: "No files uploaded" });
        }

        const loggedInUserId = req.user.id;
        const user = await User.findById(loggedInUserId);
        const media = [];

        await Promise.all(files.map(async (file) => {
            const filename = file.originalname.replace(/\..+$/, "");
            const fileContent = file.buffer;
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `images/${filename}`,
                Body: fileContent,
                ContentType: file.mimetype,
            };

            const data = await s3.upload(params).promise();

            const newImage = new File({
                type: file.mimetype,
                user: user,
                location: data.Location
            });

            media.push({ url: data.Location, type: file.mimetype });
            await newImage.save();
        }));

        return res.status(200).json(media);
    } catch (error) {
        next(error);
    }
};
*/

/**
 * Supabase Storage File Upload
 */
export const createFileSupabase = async (req, res, next) => {
    try {
        const files = req.files;
        if (!files) {
            return res.status(400).json({ code: 400, success: false, message: "No files uploaded" });
        }

        const loggedInUserId = req.user.id;
        const user = await User.findById(loggedInUserId);
        const media = [];

        await Promise.all(files.map(async (file) => {
            const publicUrl = await uploadFile(file.buffer, file.originalname, file.mimetype);

            const newImage = new File({
                type: file.mimetype,
                user: user,
                location: publicUrl
            });

            media.push({ url: publicUrl, type: file.mimetype });
            await newImage.save();
        }));

        return res.status(200).json(media);
    } catch (error) {
        next(error);
    }
};

// Default export uses Supabase for now
export const createFile = createFileSupabase;
