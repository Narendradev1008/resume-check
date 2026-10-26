# ResumeCheck API - DeepSeek setup and flow

The two AI features are ready to use after the backend has a valid DeepSeek API key, a working MongoDB connection, and a logged-in user cookie.

## 1. Required configuration

Create or update `backend/.env`. Never commit this file or put the real API key in frontend code.

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECREAT=your_jwt_secret
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_MODEL=deepseek-flash
PORT=3000
```

`DEEPSEEK_MODEL` is optional. If it is absent, the backend uses `deepseek-flash`.

The old `GOOGLE_GENAI_API_KEY` and `GOOGLE_GENAI_MODEL` values are no longer used by the AI service and can be removed from `.env`.

Run the backend:

```bash
cd backend
npm install
npm run dev
```

Node.js 18 or later is required because the DeepSeek integration uses Node's built-in `fetch`. This project was verified with Node 24.

## 2. Authentication requirement

Both APIs are private. First sign in through the existing auth API so the browser receives the `token` cookie. Send requests with credentials enabled:

```js
fetch("http://localhost:3000/api/interview", {
  credentials: "include",
  // ...
})
```

The current backend checks the `token` cookie, not an `Authorization: Bearer ...` header.

## 3. API: generate and save an interview report

`POST /api/interview`

Send `multipart/form-data` with these fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `resume` | PDF file | Yes | Maximum 3 MB |
| `selfDescription` | Text | Yes | Candidate's own summary |
| `jobDescription` | Text | Yes | Target job description |

Frontend example:

```js
const formData = new FormData()
formData.append("resume", pdfFile)
formData.append("selfDescription", selfDescription)
formData.append("jobDescription", jobDescription)

const response = await fetch("http://localhost:3000/api/interview", {
  method: "POST",
  credentials: "include",
  body: formData,
})

const data = await response.json()
```

Successful response: `201 Created`

```json
{
  "message": "interview report genrated succesfully",
  "interviewReport": {
    "_id": "...",
    "title": "Backend Developer",
    "matchScore": 78,
    "technicalQuestions": [],
    "behavioralQuestions": [],
    "skillGaps": [],
    "preparationPlan": []
  }
}
```

Common failures: `400` for missing PDF, self-description, or job description; `401` for no/invalid login cookie; `502` when DeepSeek, JSON validation, PDF parsing, or database-side generation cannot complete.

## 4. API: generate a tailored resume PDF

`POST /api/interview/resume/pdf/:interviewReportId`

Replace `:interviewReportId` with the `_id` from the saved interview report. No request body is needed.

```js
const response = await fetch(
  `http://localhost:3000/api/interview/resume/pdf/${interviewReportId}`,
  {
    method: "POST",
    credentials: "include",
  },
)

if (!response.ok) throw new Error("Could not generate resume PDF")
const pdfBlob = await response.blob()
```

Successful response: `200 OK`, with `Content-Type: application/pdf` and an attachment filename. The endpoint only allows the report owner to generate its PDF; another user's report ID returns `404`.

## 5. DeepSeek flow

### Interview report

`PDF upload → text extraction → bounded resume/self-description/job-description prompt → DeepSeek JSON response → Zod validation → MongoDB save → report JSON response`

### Resume PDF

`saved report ID → owner check → saved candidate/job data → DeepSeek JSON response containing HTML → Zod validation → Puppeteer renders HTML → PDF download`

## 6. Implementation decisions

- **DeepSeek Chat Completions API:** The service sends requests to `https://api.deepseek.com/chat/completions` with `DEEPSEEK_API_KEY` as a Bearer token.
- **JSON mode:** Both tasks request `response_format: { "type": "json_object" }`. Prompts explicitly require JSON so the result can be parsed reliably.
- **Server-side validation:** The interview report and `{ "html": "..." }` resume payload are validated before they are saved or rendered.
- **Prompt limits:** Large extracted PDFs are shortened before the provider call to keep requests predictable and reduce cost/latency.
- **No invented resume data:** The resume prompt tells DeepSeek not to create candidate facts that are not present in the submitted information.
- **Safe failures:** Missing configuration, DeepSeek errors, empty responses, malformed JSON, and invalid AI output stop the request and return a `502` response. An interview report is saved only after the AI output validates.
- **PDF resource cleanup:** The headless browser is always closed, even if rendering fails.
- **No new SDK:** The integration uses built-in `fetch`, so no DeepSeek npm dependency is required.

## 7. Before production

- Confirm the deployed backend can reach `api.deepseek.com` over HTTPS.
- Set `DEEPSEEK_API_KEY` as a deployment secret, not a source-controlled variable.
- Configure the production frontend URL in the CORS allowlist in `backend/src/app.js`.
- Test both endpoints with a real account, a real PDF, and a funded/active DeepSeek key.
