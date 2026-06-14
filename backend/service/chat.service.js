import Knowledge from "../Schema/Knowledge.js";

// Helper function to calculate Cosine Similarity in-memory
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Function to call Gemini REST API to get embedding vector
async function getEmbedding(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in environment variables!");
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "models/gemini-embedding-001",
      content: {
        parts: [{ text }],
      }
    })
  });
  
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Embedding API error (status ${response.status}): ${errText}`);
  }

  const data = await response.json();
  if (!data || !data.embedding || !data.embedding.values) {
    throw new Error("Invalid embedding response structure from Google API");
  }

  return data.embedding.values;
}

class ChatService {
  async getSupportChatResponseStream(message) {
    // 1. Get embedding for the user message
    const queryVector = await getEmbedding(message);

    // 2. Fetch all knowledge blocks from MongoDB, excluding metadata
    const allKnowledge = await Knowledge.find({ content: { $not: /^__metadata__:/ } });

    // 3. Calculate similarity in-memory
    const matches = allKnowledge.map(doc => {
      const similarity = cosineSimilarity(queryVector, doc.embedding);
      return { content: doc.content, similarity };
    });

    const topMatches = matches
      .filter(match => match.similarity > 0.6)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    const context = topMatches.map(match => match.content).join("\n\n");

    const systemInstruction = `
Bạn là trợ lý AI thông minh chuyên hỗ trợ người dùng của diễn đàn học tập EForum.

Quy tắc trả lời:
- Hãy trả lời một cách lịch sự, thân thiện, bổ ích và rõ ràng.
- Sử dụng ngôn từ tiếng Việt tự nhiên và hỗ trợ định dạng Markdown (như in đậm, danh sách, khối code...) để dễ nhìn.
- Đối với các câu hỏi liên quan đến tính năng, quy định, tài khoản, bài viết, điểm số hoặc chính sách của EForum: Bạn bắt buộc phải ưu tiên sử dụng thông tin tài liệu chính thức dưới đây để trả lời chính xác 100%.
- Đối với các câu hỏi chung, câu hỏi về học tập, lập trình, viết lách, giải bài tập hoặc trò chuyện thông thường: Hãy sử dụng tri thức tổng quát của bạn để giải đáp tận tình và tốt nhất có thể cho người dùng, đóng vai trò là một người bạn đồng hành hữu ích của diễn đàn.

Tài liệu EForum liên quan:
${context || "Không có tài liệu nào tương ứng."}
    `;

    // 4. Calling Gemini Stream API via native fetch
    const apiKey = process.env.GEMINI_API_KEY;
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: message }]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (status ${response.status}): ${errorText}`);
    }

    return response;
  }
}

export default new ChatService();
