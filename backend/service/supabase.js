import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
import { nanoid } from "nanoid";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
const bucketName = process.env.SUPABASE_BUCKET || "edublog";

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL or Key is missing in environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Uploads a file buffer to Supabase Storage
 * @param {Buffer} fileBuffer - The file content
 * @param {string} fileName - Original file name
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export const uploadFile = async (fileBuffer, fileName, mimeType) => {
  const extension = fileName.split(".").pop();
  const path = `images/${nanoid()}-${Date.now()}.${extension}`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(path, fileBuffer, {
      contentType: mimeType,
      upsert: false,
      cacheControl: '31536000', // Cache for 1 year
    });

  if (error) {
    throw new Error(`Supabase upload error: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
};

/**
 * Generates a signed upload URL for client-side uploads
 * @returns {Promise<string>} - The signed upload URL
 */
export const generateUploadURL = async () => {
  const path = `images/${nanoid()}-${Date.now()}.jpeg`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUploadUrl(path);

  if (error) {
    throw new Error(`Supabase signed URL error: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(path);

  return {
    uploadURL: data.signedUrl,
    publicURL: publicUrlData.publicUrl
  };
};

export default supabase;

/*
// --- Example: Create a bucket programmatically ---
// Note: This usually requires the SUPABASE_SERVICE_ROLE_KEY (not the ANON_KEY)
const createNewBucket = async (name) => {
  const { data, error } = await supabase.storage.createBucket(name, {
    public: true,
  })
  if (error) console.error('Error creating bucket:', error)
  else console.log('Bucket created:', data)
}
*/
