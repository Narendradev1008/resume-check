const express=require('express');
const authMiddleware=require('../middleware/auth.middleware')
const upload=require('../middleware/file.middleware');
const interviewController=require('../controller/interview.controller')

const interviewRouter=express.Router()

/**
 * @route POST /api/interview/
 * @description generate new interview report on the basis of user self description,resume pdf and job description.
 * @access private
 */
interviewRouter.post("/", authMiddleware.authUser, upload.single("resume"), interviewController.generateInterViewReportController)



/**
 * @route GET /api/interview/report/:interviewId
 * @description get interview report by interviewId.
 * @access private
 */
interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController)

/**
 * @route DELETE /api/interview/report/:interviewId
 * @description delete an interview report owned by the logged-in user.
 * @access private
 */
interviewRouter.delete("/report/:interviewId", authMiddleware.authUser, interviewController.deleteInterviewReportController)

/**
 * @route GET /api/interview/
 * @description get all interview reports of logged in user.
 * @access private
 */
interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController)

/**
 * @route post /api/interview/resume/pdf
 * @description generate resume pdf on the basis of user self description, resume content and job description.
 * @access private
 */
interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware.authUser, interviewController.generateResumePdfController)

/**
 * @route GET /api/interview/resume/pdf/:interviewReportId
 * @description retrieve a temporary private URL for a previously generated resume PDF.
 * @access private
 */
interviewRouter.get("/resume/pdf/:interviewReportId", authMiddleware.authUser, interviewController.getSavedResumePdfController)




module.exports=interviewRouter;
