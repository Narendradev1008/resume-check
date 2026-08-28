const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const interviewReportSchema = {
  type: "OBJECT",
  properties: {
    title: {
      type: "STRING",
      description: "The targeted job title extracted or inferred from the job description",
    },
    matchScore: {
      type: "NUMBER",
      description: "A score between 0 and 100 indicating profile match",
    },
    technicalQuestions: {
      type: "ARRAY",
      description: "Technical questions that can be asked in the interview",
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING" },
          intention: { type: "STRING" },
          answer: { type: "STRING" },
        },
        required: ["question", "intention", "answer"],
      },
    },
    behavioralQuestions: {
      type: "ARRAY",
      description: "Behavioral questions that can be asked in the interview",
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING" },
          intention: { type: "STRING" },
          answer: { type: "STRING" },
        },
        required: ["question", "intention", "answer"],
      },
    },
    skillGaps: {
      type: "ARRAY",
      description: "List of skill gaps in the candidate's profile",
      items: {
        type: "OBJECT",
        properties: {
          skill: { type: "STRING" },
          severity: {
            type: "STRING",
            enum: ["low", "medium", "high"],
          },
        },
        required: ["skill", "severity"],
      },
    },
    preparationPlan: {
      type: "ARRAY",
      description: "Day-wise preparation plan",
      items: {
        type: "OBJECT",
        properties: {
          day: { type: "NUMBER" },
          focus: { type: "STRING" },
          tasks: {
            type: "ARRAY",
            items: { type: "STRING" },
          },
        },
        required: ["day", "focus", "tasks"],
      },
    },
  },
  required: [
    "title",
    "matchScore",
    "technicalQuestions",
    "behavioralQuestions",
    "skillGaps",
    "preparationPlan",
  ],
};

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
`
    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: interviewReportSchema,
        }
    })

      return JSON.parse(response.text)


}


module.exports=generateInterviewReport
