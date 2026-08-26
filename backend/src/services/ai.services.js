const {GoogleGenAI}=require('@google/genai')
const {z}=require('zod');
 const ai = new GoogleGenAI({
     apiKey: process.env.GOOGLE_GENAI_API_KEY,
    });

async function invokeGeminiAi(){
   const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: "what is an interview in detail",
  });

  console.log(response.text);
}

module.exports=invokeGeminiAi
