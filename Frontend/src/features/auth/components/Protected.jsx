import { useAuth} from "../hooks/useAuth";
import React from 'react'
import { Navigate } from "react-router";
import './protected.scss'
function Protected({children}) {
  const {loading,user} =useAuth();
  if(loading){
    return (<main className="loading-screen">
            <div className="loading-spinner"></div>
        </main>)
  }
  if(!user) {
    return <Navigate to={'/login'}/>
  }
  return children
}

export default Protected