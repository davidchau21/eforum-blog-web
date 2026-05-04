import File from '../Schema/File.js';
import { uploadFile } from '../integrations/supabase.js';

class FileService {
  async uploadFiles(userId, files) {
    if (!files || files.length === 0) throw new Error("No files uploaded");

    const media = [];
    await Promise.all(files.map(async (file) => {
      const publicUrl = await uploadFile(file.buffer, file.originalname, file.mimetype);
      
      const newImage = new File({
        type: file.mimetype,
        user: userId,
        location: publicUrl
      });

      media.push({ url: publicUrl, type: file.mimetype });
      await newImage.save();
    }));

    return media;
  }

  async getUploadUrl() {
    const { generateUploadURL } = await import("../integrations/supabase.js");
    return await generateUploadURL();
  }
}

export default new FileService();
