import axios from "axios";

export const uploadImage = async (img) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (img.size > maxSize) {
    alert("Kích thước ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.");
    throw new Error("File size too large.");
  }

  try {
    // Bước 1: Gọi API để lấy URL ký từ backend (hỗ trợ Supabase)
    const { data } = await axios.get(
      import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url",
    );
    const { uploadURL, publicURL } = data;

    /* 
        // --- Logic cũ của AWS S3 (Đã comment lại) ---
        // const { data: { uploadURL: s3UploadURL } } = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url");
        // await axios.put(s3UploadURL, img, {
        //     headers: { 'Content-Type': 'image/jpeg' }
        // });
        // const imgUrl = s3UploadURL.split("?")[0];
        // return imgUrl;
        */

    // Bước 2: Upload hình ảnh tới Storage bằng URL ký
    await axios.put(uploadURL, img, {
      headers: { "Content-Type": "image/jpeg" },
    });

    // Bước 3: Trả về Public URL sau khi upload thành công
    return publicURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Could not upload image.");
  }
};
