import axios from "axios";
import { geminiApiKey } from "../config/ai.js";

export const getPersonalizedRecommendation = async (interests, blogs) => {
    const API_KEY = geminiApiKey;

    if (!API_KEY) {
        // Fallback: Simple tag-based sorting if no API key
        return blogs.sort((a, b) => {
            const aMatches = a.tags.filter(tag => interests.includes(tag)).length;
            const bMatches = b.tags.filter(tag => interests.includes(tag)).length;
            return bMatches - aMatches;
        });
    }

    try {
        const prompt = `
        User interests: ${interests.join(", ")}
        
        List of blogs (JSON):
        ${JSON.stringify(blogs.map(b => ({ id: b.blog_id, title: b.title, tags: b.tags })))}
        
        Task: Based on the user's interests, select and rank the top 10 blogs that would be most interesting to them. 
        Return ONLY a JSON array of blog IDs in the recommended order. Example: ["id1", "id2"]
        `;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
            {
                contents: [{ parts: [{ text: prompt }] }]
            }
        );

        const resultText = response.data.candidates[0].content.parts[0].text;
        const recommendedIds = JSON.parse(resultText.match(/\[.*\]/s)[0]);

        // Re-order blogs based on AI recommendations
        const recommendedBlogs = recommendedIds.map(id => blogs.find(b => b.blog_id === id)).filter(Boolean);

        // Add remaining blogs that AI didn't pick at the end
        const remainingBlogs = blogs.filter(b => !recommendedIds.includes(b.blog_id));

        return [...recommendedBlogs, ...remainingBlogs];

    } catch (err) {
        console.error("Gemini Error:", err.message);
        return blogs; // Return original if AI fails
    }
};
