import Document from "../Schema/Document.js";
import { uploadDocumentFile } from "../integrations/supabase.js";

class DocumentService {
  async uploadDocument(userId, file, title, description) {
    if (!file) throw new Error("Vui lòng chọn file tài liệu.");
    if (!title || title.trim() === "") throw new Error("Vui lòng điền tiêu đề tài liệu.");

    // Validate size and file type
    const allowedExtensions = ["pdf", "ppt", "pptx", "doc", "docx"];
    const extension = file.originalname.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      throw new Error("Định dạng file không được hỗ trợ. Chỉ nhận PDF, PPT, PPTX, DOC, DOCX.");
    }

    const maxLimit = 15 * 1024 * 1024; // 15MB
    if (file.size > maxLimit) {
      throw new Error("Dung lượng file vượt quá giới hạn 15MB.");
    }

    // Upload to Supabase
    const publicUrl = await uploadDocumentFile(file.buffer, file.originalname, file.mimetype);

    // Save to Database
    const newDoc = new Document({
      title: title.trim(),
      description: (description || "").trim(),
      file_url: publicUrl,
      file_name: file.originalname,
      file_type: extension,
      file_size: file.size,
      author: userId,
    });

    await newDoc.save();
    return newDoc;
  }

  async getDocuments(searchQuery, sort, page = 1, limit = 6, authorId = null) {
    const skip = (page - 1) * limit;
    const findQuery = {};

    if (authorId) {
      findQuery.author = authorId;
    }

    if (searchQuery && searchQuery.trim() !== "") {
      findQuery.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
      ];
    }

    let sortOption = { createdAt: -1 }; // Default: Latest
    if (sort === "downloads") {
      sortOption = { downloads: -1, createdAt: -1 };
    } else if (sort === "views") {
      sortOption = { views: -1, createdAt: -1 };
    }

    const list = await Document.find(findQuery)
      .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const totalDocs = await Document.countDocuments(findQuery);

    return {
      list,
      totalDocs,
      page,
      limit,
    };
  }

  async getDocumentById(documentId) {
    const doc = await Document.findById(documentId)
      .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img");
    if (!doc) throw new Error("Tài liệu không tồn tại.");

    // Increment views
    doc.views += 1;
    await doc.save();

    return doc;
  }

  async incrementDownload(documentId) {
    const doc = await Document.findById(documentId);
    if (!doc) throw new Error("Tài liệu không tồn tại.");

    doc.downloads += 1;
    await doc.save();

    return doc;
  }

  async deleteDocument(documentId, userId) {
    const doc = await Document.findById(documentId);
    if (!doc) throw new Error("Tài liệu không tồn tại.");

    if (doc.author.toString() !== userId.toString()) {
      throw new Error("Bạn không có quyền xóa tài liệu này.");
    }

    await Document.findByIdAndDelete(documentId);
    return { success: true, message: "Xóa tài liệu thành công." };
  }
}

export default new DocumentService();
