# Prepwise

Prepwise is an AI-powered interview preparation platform. It compares a candidate profile with a target job description and creates interview reports, skill-gap insights, questions, preparation plans, and tailored resume PDFs.

## Features

- Secure account registration and login with HTTP-only JWT cookies
- Resume PDF upload or self-description based candidate profile
- AI-generated match score, skill gaps, and role evaluation
- Technical and behavioral interview questions with answer guidance
- Personalized preparation plan and tailored resume PDF generation
- Private PDF storage, preview, and download through AWS S3
- Responsive React dashboard

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | React, Vite, React Router, Sass, Axios |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Authentication | JWT, HTTP-only cookies, bcrypt |
| AI | DeepSeek Chat Completions API |
| File handling | Multer, pdf-parse, Puppeteer |
| PDF storage | AWS S3 and pre-signed URLs |

## Local Setup

### Prerequisites

- Node.js 18 or newer
- MongoDB connection string
- DeepSeek API key
- AWS S3 bucket and credentials for tailored-resume PDFs

### Backend

Create `backend/.env` with these values:

    MONGODB_URI=your_mongodb_connection_string
    JWT_SECREAT=your_long_random_jwt_secret
    DEEPSEEK_API_KEY=your_deepseek_api_key
    DEEPSEEK_MODEL=deepseek-flash
    PORT=3000
    AWS_REGION=your_aws_region
    AWS_S3_BUCKET=your_private_s3_bucket
    AWS_ACCESS_KEY_ID=your_aws_access_key_id
    AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key

`JWT_SECREAT` is intentionally spelled this way because it matches the existing application configuration.

Install and start the API:

    cd backend
    npm install
    npm run dev

The API runs at `http://localhost:3000`.

### Frontend

The client uses `http://localhost:3000` automatically in development. To use another API, add `VITE_API_URL` to `Frontend/.env`.

    cd Frontend
    npm install
    npm run dev

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Application Flow

1. A user registers or signs in.
2. They add a job description and either a PDF resume or self-description.
3. The API analyzes the profile with DeepSeek and saves a validated report to MongoDB.
4. The dashboard presents the match score, skill gaps, questions, and preparation plan.
5. A tailored resume PDF can be generated, saved privately to S3, previewed, and downloaded.

## API Overview

All interview routes require the authenticated browser cookie.

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/logout` | Sign out |
| GET | `/api/auth/get-me` | Retrieve the signed-in user |
| POST | `/api/interview` | Generate and save an interview report |
| GET | `/api/interview` | List the user's reports |
| GET | `/api/interview/report/:interviewId` | Retrieve one report |
| DELETE | `/api/interview/report/:interviewId` | Delete one report |
| POST | `/api/interview/resume/pdf/:interviewReportId` | Generate a tailored resume PDF |
| GET | `/api/interview/resume/pdf/:interviewReportId` | Get a temporary preview or download URL |

## Security and Validation

- Only PDF resumes up to 3 MB are accepted.
- AI responses and generated resume HTML are validated server-side.
- Secrets belong in environment variables, never in Git or frontend code.
- Resume files are private and accessed through time-limited signed URLs.
- Local cookies use `SameSite=Lax`; production uses secure HTTPS cookies with `SameSite=None`.

## Scripts

| Directory | Command | Description |
| --- | --- | --- |
| `Frontend` | `npm run dev` | Start the Vite development server |
| `Frontend` | `npm run build` | Build the production frontend |
| `Frontend` | `npm run lint` | Run frontend linting |
| `backend` | `npm run dev` | Start the Express API with Nodemon |

## Resume Project Description

**Prepwise - AI Interview Preparation Platform**
Built a full-stack web application that analyzes candidate profiles against job descriptions to generate interview reports, skill-gap insights, technical and behavioral questions, preparation roadmaps, and tailored resume PDFs.
