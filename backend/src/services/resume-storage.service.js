const { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")

const bucketName = process.env.AWS_S3_BUCKET
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-southeast-2",
})

const ensureStorageIsConfigured = () => {
  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET is not configured")
  }
}

const getResumeStorageKey = ({ userId, interviewReportId }) =>
  `resumes/${userId}/${interviewReportId}/resume.pdf`

async function uploadResumePdf({ userId, interviewReportId, pdfBuffer }) {
  ensureStorageIsConfigured()

  const storageKey = getResumeStorageKey({ userId, interviewReportId })
  await s3Client.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: storageKey,
    Body: pdfBuffer,
    ContentType: "application/pdf",
    ContentDisposition: `inline; filename="resume_${interviewReportId}.pdf"`,
    ServerSideEncryption: "AES256",
  }))

  return storageKey
}

async function createResumeDownloadUrl(storageKey, { download = false } = {}) {
  ensureStorageIsConfigured()

  return getSignedUrl(s3Client, new GetObjectCommand({
    Bucket: bucketName,
    Key: storageKey,
    ResponseContentType: "application/pdf",
    ResponseContentDisposition: download ? "attachment; filename=generated-resume.pdf" : "inline",
  }), { expiresIn: 60 * 10 })
}

async function deleteResumePdf(storageKey) {
  ensureStorageIsConfigured()

  await s3Client.send(new DeleteObjectCommand({
    Bucket: bucketName,
    Key: storageKey,
  }))
}

module.exports = { uploadResumePdf, createResumeDownloadUrl, deleteResumePdf }
