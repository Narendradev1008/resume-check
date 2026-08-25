import { useAuth} from "../hooks/useAuth";
import React from 'react'
import { Navigate } from "react-router";
function Protected({children}) {
  const {loading,user} =useAuth();
  if(loading){
    return (<main><p>Loading....</p></main>)
  }
  if(!user) {
    return <Navigate to={'/login'}/>
  }
  return children
}

export default Protected