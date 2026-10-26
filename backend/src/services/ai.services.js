const { z } = require("zod")
const chromium = require("@sparticuz/chromium")
const puppeteer = require("puppeteer-core")

const DEEPSEEK_CHAT_COMPLETIONS_URL = "https://api.deepseek.com/chat/completions"

// Bound inputs so an unusually large PDF cannot make an AI request too large
// or slow. PDF text is already extracted before it reaches this service.
const truncateText = (value, limit) => {
  const text = String(value || "").replace(/\s+/g, " ").trim()
  return text.length > limit ? `${text.slice(0, limit)}\n[Content truncated]` : text
}

const interviewReportSchema = z.object({
  title: z.string(),
  matchScore: z.number().min(0).max(100),
  technicalQuestions: z.array(z.object({
    question: z.string(),
    intention: z.string(),
    answer: z.string(),
  })),
  behavioralQuestions: z.array(z.object({
    question: z.string(),
    intention: z.string(),
    answer: z.string(),
  })),
  skillGaps: z.array(z.object({
    skill: z.string(),
    severity: z.enum(["low", "medium", "high"]),
  })),
  preparationPlan: z.array(z.object({
    day: z.number(),
    focus: z.string(),
    tasks: z.array(z.string()),
  })),
})

const resumeHtmlSchema = z.object({ html: z.string().min(1) })

async function createDeepSeekCompletion({ systemPrompt, userPrompt, maxTokens }) {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY is not configured")
  }

  const response = await fetch(DEEPSEEK_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || "deepseek-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: maxTokens,
    }),
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const providerMessage = payload?.error?.message || response.statusText
    throw new Error(`DeepSeek request failed (${response.status}): ${providerMessage}`)
  }

  const content = payload?.choices?.[0]?.message?.content
  if (!content) {
    throw new Error("DeepSeek returned no completion content")
  }

  try {
    return JSON.parse(content)
  } catch {
    throw new Error("DeepSeek returned invalid JSON")
  }
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
  const report = await createDeepSeekCompletion({
    systemPrompt: `You are an expert technical recruiter and interview coach. Return only one valid JSON object; no Markdown or prose. The object must have exactly these fields: title (string), matchScore (number 0-100), technicalQuestions (array of objects with question, intention, answer strings), behavioralQuestions (same object shape), skillGaps (array of objects with skill string and severity of low, medium, or high), and preparationPlan (array of objects with day number, focus string, and tasks array of strings). Generate exactly 5 technical questions, exactly 3 behavioral questions, at most 5 skill gaps, and a 5-day preparation plan with at most 3 short tasks per day. Keep each answer under 60 words.`,
    userPrompt: `Candidate resume:\n${truncateText(resume, 18000)}\n\nCandidate self-description:\n${truncateText(selfDescription, 4000)}\n\nTarget job description:\n${truncateText(jobDescription, 12000)}`,
    maxTokens: 4096,
  })

  return interviewReportSchema.parse(report)
}

async function generatePdfFromHtml(htmlContent) {
  const executablePath = await chromium.executablePath()
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath,
    headless: chromium.headless,
  })

  try {
    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })
    return await page.pdf({
      format: "A4",
      margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
    })
  } finally {
    await browser.close()
  }
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const result = await createDeepSeekCompletion({
    systemPrompt: `You are an expert resume writer. Return only one valid JSON object; no Markdown or prose. It must have exactly one field, html, containing a complete, self-contained HTML document for a professional, ATS-friendly resume. Use only inline CSS; do not use external assets, scripts, or remote fonts. Do not invent candidate facts. Keep it to one or two A4 pages when printed.`,
    userPrompt: `Create a resume tailored to this job description. Highlight relevant real experience and strengths from the candidate information. Make the content sound human-written and the design simple and professional.\n\nCandidate resume:\n${truncateText(resume, 18000)}\n\nCandidate self-description:\n${truncateText(selfDescription, 4000)}\n\nTarget job description:\n${truncateText(jobDescription, 12000)}`,
    maxTokens: 10000,
  })

  const { html } = resumeHtmlSchema.parse(result)
  return generatePdfFromHtml(html)
}

module.exports = { generateInterviewReport, generateResumePdf }
