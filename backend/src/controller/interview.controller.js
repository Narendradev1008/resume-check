const pdfParse=require('pdf-parse');
const generateInterviewReport=require('../services/ai.services');
const interviewReportModel= require('../models/interviewReport.model')

async function generateInterViewReportController(req,res){
   const resumeContent=pdfParse(req.file.buffer);
   const {selfDescription,jobDescription}=req.body

   const interviewReportByAi=await generateInterviewReport(
    {resume : resumeContent,selfDescription,jobDescription})

    const interviewReport=interviewReportModel.create({
        user: req.body.user,
        resume: resumeContent,
        selfDescription,
        jobDescription,
        ...interviewReportByAi
    })

    res.status(201).json({
      message:"interview report genrated succesfully",
      interviewReport
    })
}

module.exports={}