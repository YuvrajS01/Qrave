import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMenuItemDetails = async (itemName: string) => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a fancy restaurant menu description for a dish named "${itemName}". 
      Also suggest a price (number only), a category (Starter, Main, Dessert, Drink), and boolean flags for isVegetarian and isSpicy.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING, description: "A tempting, high-end 1-sentence description" },
            price: { type: Type.NUMBER, description: "Suggested price between 10 and 50" },
            category: { type: Type.STRING, enum: ["Starters", "Mains", "Desserts", "Drinks"] },
            isVegetarian: { type: Type.BOOLEAN },
            isSpicy: { type: Type.BOOLEAN }
          },
          required: ["description", "price", "category", "isVegetarian", "isSpicy"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};
