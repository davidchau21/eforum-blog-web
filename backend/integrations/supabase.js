import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import {
  supabaseBucket as bucketName,
  supabaseKey,
  supabaseUrl,
} from "../config/supabase.js";

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL or Key is missing in environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadFile = async (fileBuffer, fileName, mimeType) => {
  const extension = fileName.split(".").pop();
  const path = `images/${nanoid()}-${Date.now()}.${extension}`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(path, fileBuffer, {
      contentType: mimeType,
      upsert: false,
      cacheControl: "31536000",
    });

  if (error) {
    throw new Error(`Supabase upload error: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
};

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
    publicURL: publicUrlData.publicUrl,
  };
};

export default supabase;
