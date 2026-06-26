import axios from "axios";

export const uploadImage = async (img) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (img.size > maxSize) {
    alert("Kích thước ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB.");
    throw new Error("File size too large.");
  }

  try {
    const ext = img.name.split(".").pop().toLowerCase() || "jpeg";
    // Bước 1: Gọi API để lấy URL ký từ backend kèm phần mở rộng thực tế
    const { data } = await axios.get(
      import.meta.env.VITE_SERVER_DOMAIN + `/files/get-upload-url?ext=${ext}`,
    );
    const { uploadURL, publicURL } = data;

    // Bước 2: Upload hình ảnh tới Storage bằng URL ký và Content-Type phù hợp
    await axios.put(uploadURL, img, {
      headers: { "Content-Type": img.type || "image/jpeg" },
    });

    // Bước 3: Trả về Public URL sau khi upload thành công
    return publicURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Could not upload image.");
  }
};

export const uploadVideo = async (videoFile) => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (videoFile.size > maxSize) {
    alert("Kích thước video quá lớn. Vui lòng chọn video dưới 50MB.");
    throw new Error("File size too large.");
  }

  try {
    const ext = videoFile.name.split(".").pop().toLowerCase() || "mp4";
    // Bước 1: Gọi API để lấy URL ký từ backend kèm phần mở rộng video
    const { data } = await axios.get(
      import.meta.env.VITE_SERVER_DOMAIN + `/files/get-upload-url?ext=${ext}`,
    );
    const { uploadURL, publicURL } = data;

    // Bước 2: Upload video tới Storage bằng URL ký
    await axios.put(uploadURL, videoFile, {
      headers: { "Content-Type": videoFile.type || "video/mp4" },
    });

    // Bước 3: Trả về Public URL
    return publicURL;
  } catch (error) {
    console.error("Error uploading video:", error);
    throw new Error("Could not upload video.");
  }
};
