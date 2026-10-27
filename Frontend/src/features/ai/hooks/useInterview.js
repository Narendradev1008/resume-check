import {getAllInterviewReports,genrateInterviewReport, getInterviewReportById,generateResumePdf, getSavedResumePdf, deleteInterviewReport} from '../services/interview.api.js'
import { useContext,useEffect } from 'react'
import { useParams } from "react-router"

import {InterviewContext}from '../interview.context.jsx'
export const useInterview = () => {

    const {interviewId}=useParams();
     const context=useContext(InterviewContext);

     if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
     }
    const { loading, setLoading, report, setReport, reports, setReports }=context

    const generateReport=async({jobDescription,selfDescription,resumeFile})=>{
      setLoading(true);
      let response=null;
      try{
        response =await genrateInterviewReport({jobDescription,selfDescription,resumeFile})
        setReport(response.interviewReport)
      }
      catch(err){
          console.log(err)
      }finally{
        setLoading(false);
      }
      return response.interviewReport
    }


      const getReportById = async (interviewId) => {
        setLoading(true)
        let response=null;
        try {
            response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
        
    }

     
     const getReports = async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            setReports(response.interviewReports)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }

        return response.interviewReport
    }

    const removeReport = async (interviewId) => {
        await deleteInterviewReport(interviewId)
        setReports((currentReports) => currentReports.filter((item) => item._id !== interviewId))
        setReport((currentReport) => currentReport?._id === interviewId ? null : currentReport)
    }
     const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        try {
            const generationResponse = await generateResumePdf({ interviewReportId })
            if (generationResponse.generatedResume) {
                setReport((currentReport) => currentReport
                    ? { ...currentReport, generatedResume: generationResponse.generatedResume }
                    : currentReport)
            }
            const response = await getSavedResumePdf({ interviewReportId })
            return response.url
        }
        catch (error) {
            console.log(error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const getResumeDownloadUrl = async (interviewReportId) => {
        const response = await getSavedResumePdf({ interviewReportId, download: true })
        return response.url
    }

    const getResumePreviewUrl = async (interviewReportId) => {
        const response = await getSavedResumePdf({ interviewReportId })
        return response.url
    }
   

    
    return { loading, report, reports, generateReport, getReportById, getReports, removeReport, getResumePdf, getResumePreviewUrl, getResumeDownloadUrl }


}
