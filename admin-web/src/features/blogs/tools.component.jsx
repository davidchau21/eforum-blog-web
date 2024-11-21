// importing tools

import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import axios from "axios";

export const uploadImage = async (img) => {
  try {
    // Bước 1: Gọi API để lấy URL ký
    const {
      data: { uploadURL },
    } = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url");

    // Bước 2: Upload hình ảnh tới S3 bằng URL ký
    await axios.put(uploadURL, img, {
      headers: { "Content-Type": "image/jpeg" }, // Bạn đã chỉ định đúng Content-Type
    });

    // Bước 3: Lấy URL của file sau khi upload thành công
    const imgUrl = uploadURL.split("?")[0]; // Xóa phần query params để lấy URL của ảnh
    return imgUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Could not upload image.");
  }
};

const uploadImageByFile = async (e) => {
  return uploadImage(e).then((url) => {
    if (url) {
      return {
        success: 1,
        file: { url },
      };
    }
  });
};

const uploadImageByURL = async (e) => {
  let link = new Promise((resolve, reject) => {
    try {
      resolve(e);
    } catch (err) {
      reject(err);
    }
  });

  return link.then((url) => {
    return {
      success: 1,
      file: { url },
    };
  });
};

export const tools = {
  embed: Embed,
  list: {
    class: List,
    inlineToolbar: true,
  },
  image: {
    class: Image,
    config: {
      uploader: {
        uploadByUrl: uploadImageByURL,
        uploadByFile: uploadImageByFile,
      },
    },
  },
  header: {
    class: Header,
    config: {
      placeholder: "Type Heading....",
      levels: [2, 3],
      defaultLevel: 2,
    },
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
  },
  marker: Marker,
  inlineCode: InlineCode,
};
