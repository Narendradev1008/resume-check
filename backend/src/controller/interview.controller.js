const pdfParse=require('pdf-parse');
const {generateInterviewReport,generateResumePdf}=require('../services/ai.services');
const interviewReportModel= require('../models/interviewReport.model')
const { uploadResumePdf, createResumeDownloadUrl, deleteResumePdf } = require('../services/resume-storage.service')
/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req,res){
  if (!req.file) {
      return res.status(400).json({ message: "Resume PDF file is required." });
  }

  const { selfDescription, jobDescription } = req.body
  if (!selfDescription || !jobDescription) {
    return res.status(400).json({
      message: "Self description and job description are required.",
    })
  }

  try {
    const startedAt = Date.now()
    const resumeContent= await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
    const pdfParsedAt = Date.now()

    const interviewReportByAi=await generateInterviewReport(
      {resume : resumeContent.text,selfDescription,jobDescription})
    const aiCompletedAt = Date.now()

    const interviewReport=await interviewReportModel.create({
        user: req.user.id,
        resume: resumeContent.text,
        selfDescription,
        jobDescription,
        ...interviewReportByAi
    })

    console.info("Interview report timing (ms)", {
      pdfParsing: pdfParsedAt - startedAt,
      aiGeneration: aiCompletedAt - pdfParsedAt,
      databaseSave: Date.now() - aiCompletedAt,
      total: Date.now() - startedAt,
    })

    return res.status(201).json({
      message:"interview report genrated succesfully",
      interviewReport
    })
  } catch (error) {
    console.error("Interview report generation failed:", error.message)
    return res.status(502).json({
      message: "Unable to generate the interview report at this time.",
    })
  }
}
/**
 * @description Controller to get interview report by interviewId.
 */

async function getInterviewReportByIdController(req,res){
    const {interviewId}=req.params
    const interviewReport=await interviewReportModel.findOne({_id:interviewId,user:req.user.id});

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}

/** 
 * @description Controller to get all interview reports of logged in user.
 */

async function getAllInterviewReportsController(req,res){
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}

/**
 * @description Delete one interview report owned by the logged-in user.
 */
async function deleteInterviewReportController(req, res) {
    const { interviewId } = req.params

    try {
        const interviewReport = await interviewReportModel.findOneAndDelete({
            _id: interviewId,
            user: req.user.id,
        })

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." })
        }

        if (interviewReport.generatedResume?.storageKey) {
            deleteResumePdf(interviewReport.generatedResume.storageKey).catch((error) => {
                console.error("Generated resume cleanup failed:", error.message)
            })
        }

        return res.status(200).json({ message: "Interview report deleted successfully." })
    } catch (error) {
        return res.status(400).json({ message: "Invalid interview report id." })
    }
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findOne({
        _id: interviewReportId,
        user: req.user.id,
    })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    if (interviewReport.generatedResume?.status === "ready" && interviewReport.generatedResume.storageKey) {
        return res.status(200).json({
            message: "A resume has already been generated for this report.",
            generatedResume: interviewReport.generatedResume,
        })
    }

    if (interviewReport.generatedResume?.status === "generating") {
        return res.status(409).json({
            message: "Resume generation is already in progress.",
        })
    }

    const claimedReport = await interviewReportModel.findOneAndUpdate({
        _id: interviewReportId,
        user: req.user.id,
        "generatedResume.status": { $nin: ["generating", "ready"] },
    }, {
        $set: { "generatedResume.status": "generating" },
        $unset: {
            "generatedResume.storageKey": "",
            "generatedResume.generatedAt": "",
        },
    }, { new: true })

    if (!claimedReport) {
        return res.status(409).json({ message: "Resume generation is already in progress." })
    }

    const { resume, jobDescription, selfDescription } = claimedReport

    try {
        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })
        const storageKey = await uploadResumePdf({
            userId: req.user.id,
            interviewReportId,
            pdfBuffer,
        })

        const generatedAt = new Date()
        claimedReport.generatedResume = { storageKey, status: "ready", generatedAt }
        await claimedReport.save()

        return res.status(201).json({
            message: "Resume generated and saved successfully.",
            generatedResume: claimedReport.generatedResume,
        })
    } catch (error) {
        console.error("Resume PDF generation failed:", error.message)
        await interviewReportModel.updateOne({
            _id: interviewReportId,
            user: req.user.id,
            "generatedResume.status": "generating",
        }, { $set: { "generatedResume.status": "failed" } })

        return res.status(502).json({
            message: "Unable to generate the resume PDF at this time.",
        })
    }
}

async function getSavedResumePdfController(req, res) {
    const { interviewReportId } = req.params

    try {
        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id,
        }).select("generatedResume")

        if (!interviewReport?.generatedResume?.storageKey || interviewReport.generatedResume.status !== "ready") {
            return res.status(404).json({ message: "Generated resume not found." })
        }

        const url = await createResumeDownloadUrl(interviewReport.generatedResume.storageKey, {
            download: req.query.download === "true",
        })
        return res.status(200).json({ url, expiresInSeconds: 600 })
    } catch (error) {
        console.error("Resume preview URL generation failed:", error.message)
        return res.status(502).json({ message: "Unable to retrieve the generated resume at this time." })
    }
}


module.exports={generateInterViewReportController,getInterviewReportByIdController,getAllInterviewReportsController,deleteInterviewReportController,generateResumePdfController,getSavedResumePdfController};
