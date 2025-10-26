
import { GoogleGenAI, Type } from "@google/genai";
import { FruitAnalysis } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = "gemini-2.5-flash";

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

export const analyzeFruitImage = async (
  imageBase64: string,
  mimeType: string
): Promise<FruitAnalysis[]> => {
  const imagePart = fileToGenerativePart(imageBase64, mimeType);
  const prompt = `Phân tích hình ảnh để xác định tất cả các loại trái cây có mặt. Đối với mỗi loại trái cây, hãy cung cấp tên, tình trạng (ví dụ: chín, xanh, hỏng), điểm tin cậy, mô tả ngắn gọn và điểm độ chín từ 1 (còn xanh) đến 10 (chín). Trả về kết quả phân tích dưới dạng một mảng JSON các đối tượng. Nếu không tìm thấy trái cây nào, hãy trả về một mảng rỗng. Vui lòng trả lời bằng tiếng Việt.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          imagePart,
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              fruitName: {
                type: Type.STRING,
                description: "Tên của loại trái cây được xác định (ví dụ: 'Chuối', 'Táo')."
              },
              condition: {
                type: Type.STRING,
                description: "Tình trạng của trái cây. Có thể là 'chín', 'xanh', 'tươi', 'hỏng', 'tốt', 'xấu', hoặc 'không xác định'."
              },
              confidence: {
                type: Type.NUMBER,
                description: "Điểm tin cậy từ 0.0 đến 1.0 cho toàn bộ phân tích."
              },
              description: {
                type: Type.STRING,
                description: "Một bản tóm tắt ngắn gọn, trong một câu về kết quả phân tích."
              },
              ripenessScore: {
                type: Type.NUMBER,
                description: "Điểm số từ 1 (rất xanh) đến 10 (chín hoàn hảo hoặc tươi)."
              }
            },
            required: ["fruitName", "condition", "confidence", "description", "ripenessScore"],
          }
        },
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    // Type assertion to ensure the result matches our interface
    return result as FruitAnalysis[];

  } catch (error) {
    console.error("Error analyzing image with Gemini API:", error);
    throw new Error("Không thể nhận được phân tích từ AI. Vui lòng kiểm tra console để biết thêm chi tiết.");
  }
};
