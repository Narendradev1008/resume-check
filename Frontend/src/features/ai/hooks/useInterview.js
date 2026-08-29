import {getAllInterviewReports,genrateInterviewReport, getInterviewReportById,generateResumePdf} from '../services/interview.api.js'
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
     const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        let response = null
        try {
            response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
        }
        catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }
   

    
    return { loading, report, reports, generateReport, getReportById, getReports,getResumePdf}


}