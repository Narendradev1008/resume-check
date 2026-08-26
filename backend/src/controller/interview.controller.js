const pdfParse=require('pdf-parse');
const generateInterviewReport=require('../services/ai.services');
const interviewReportModel= require('../models/interviewReport.model')

async function generateInterViewReportController(req,res){

  if(!req.file) {
      return res.status(400).json({ message: "Resume PDF file is required." });
  }


   const resumeContent= await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()

   const {selfDescription,jobDescription}=req.body

   const interviewReportByAi=await generateInterviewReport(
    {resume : resumeContent.text,selfDescription,jobDescription})

    const interviewReport=await interviewReportModel.create({
        user: req.body.user,
        resume: resumeContent.text,
        selfDescription,
        jobDescription,
        ...interviewReportByAi
    })

    res.status(201).json({
      message:"interview report genrated succesfully",
      interviewReport
    })
}

module.exports={generateInterViewReportController,};