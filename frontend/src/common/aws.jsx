import axios from "axios";

export const uploadImage = async (img) => {
    try {
        // Bước 1: Gọi API để lấy URL ký
        const { data: { uploadURL } } = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url");

        // Bước 2: Upload hình ảnh tới S3 bằng URL ký
        await axios.put(uploadURL, img, {
            headers: { 'Content-Type': 'image/jpeg' } // Bạn đã chỉ định đúng Content-Type
        });

        // Bước 3: Lấy URL của file sau khi upload thành công
        const imgUrl = uploadURL.split("?")[0]; // Xóa phần query params để lấy URL của ảnh
        return imgUrl;
        
    } catch (error) {
        console.error("Error uploading image:", error);
        throw new Error("Could not upload image.");
    }
};