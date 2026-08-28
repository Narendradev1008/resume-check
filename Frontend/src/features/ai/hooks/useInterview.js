import {getAllInterviewReports,genrateInterviewReport, getInterviewReportById} from '../services/interview.api.js'
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
        let response=null;
        setLoading(true)
        response = null
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
            setReports(response.interviewReport)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }

        return response.interviewReport
    }

    useEffect(()=>{
        if(interviewId){
            getReportById(interviewId);
        }
        else{
            getReports();
        }
    },[interviewId])
        return { loading, report, reports, generateReport, getReportById, getReports}


}