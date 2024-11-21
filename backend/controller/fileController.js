import User from '../Schema/User.js';
import File from '../Schema/File.js';
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region:  process.env.AWS_BUCKET_REGION
});

export const createFile = async (req, res, next) => {
    try {
        const files = req.files;
        if (!files) {
            return res.status(400).json({ code: 400, success: false, message: "No files uploaded" });
        }

        const loggedInUserId = req.user.id;
        const user = await User.findById(loggedInUserId);
        const media = [];

        // Use Promise.all to handle all the file uploads
        await Promise.all(files.map(async (file) => {
            const filename = file.originalname.replace(/\..+$/, "");
            const fileContent = file.buffer;
            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: `images/${filename}`, // File path and name in S3
                Body: fileContent,
                ContentType: file.mimetype, // Image MIME type
            };

            // Use s3.upload with a promise
            const data = await s3.upload(params).promise();

            // Save the file URL to MongoDB
            const newImage = new File({
                type: file.mimetype,
                user: user,
                location: data.Location
            });

            // Push the file location to media array and save to the database
            media.push({url:data.Location,type:file.mimetype});
            await newImage.save();
        }));

        // Send the uploaded URLs back in the response
        return res.status(200).json(media);

    } catch (error) {
        next(error);
    }
};
