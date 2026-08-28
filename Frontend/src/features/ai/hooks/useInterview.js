import {getAllInterviewReports,genrateInterviewReport, getInterviewReportById} from '../services/interview.api.js'

import { useContext } from 'react'
import {InterviewContext}from '../interview.context.jsx'
export const useInterview = () => {
     const context=useContext(InterviewContext);
     if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
     }
    const { loading, setLoading, report, setReport, reports, setReports }=context

    const genrateReport=async({jobDescription,selfDescription,resumeFile})=>{
      setLoading(true);
      try{
        const response =await genrateInterviewReport({jobDescription,selfDescription,resumeFile})
        setReport(response.interviewReport)
      }
      catch(err){
          console.log(err)
      }finally{
        setLoading(false);
      }
    }
      const getReportById = async (interviewId) => {
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
        return response.interviewReport
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

        return response.interviewReports
    }
        return { loading, report, reports, generateReport, getReportById, getReports}


}