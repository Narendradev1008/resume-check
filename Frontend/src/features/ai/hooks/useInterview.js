import {getAllInterviewReports,genrateInterviewReport, getInterviewReportById,generateResumePdf, getSavedResumePdf, deleteInterviewReport} from '../services/interview.api.js'
import { useContext } from 'react'

import {InterviewContext}from '../interview.context.jsx'
export const useInterview = () => {

     const context=useContext(InterviewContext);

     if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
     }
    const { loading, setLoading, report, setReport, reports, setReports }=context

    const generateReport=async({jobDescription,selfDescription,resumeFile})=>{
      setLoading(true);
      try{
        const response =await genrateInterviewReport({jobDescription,selfDescription,resumeFile})
        setReport(response.interviewReport)
        return response.interviewReport
      }
      catch(err){
          throw err
      }finally{
        setLoading(false);
      }
    }


      const getReportById = async (interviewId) => {
        setLoading(true)
        try {
            const response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
            return response.interviewReport
        } catch (error) {
            setReport(null)
            throw error
        } finally {
            setLoading(false)
        }
        
    }

     
     const getReports = async () => {
        setLoading(true)
        try {
            const response = await getAllInterviewReports()
            setReports(response.interviewReports)
            return response.interviewReports
        } catch (error) {
            setReports([])
            throw error
        } finally {
            setLoading(false)
        }
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
