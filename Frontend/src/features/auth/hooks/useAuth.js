import { useContext ,useEffect} from "react";
import { AuthContext } from "../auth.context.jsx";
import {login,logout,register,getMe} from '../services/auth.api'


export const useAuth =()=>{

  const context=useContext(AuthContext);
  

  const {user,setUser,loading,setLoading}=context;

  const handleLogin=async ({email,password})=>{
    setLoading(true);
    try{
    const data=await login({email,password});
    setUser(data.user);
    }
    catch(err){
      console.log(err);
    }
    finally{
      setLoading(false);
    }

  }

  const handleRegister=async ({username,email,password})=>{
    setLoading(true);
    try{
    const data=await register({username,email,password});
    setUser(data.user);
    }
    catch(err){
      console.log(err);
    }
    finally{
    setLoading(false);
    }
  }

  const handleLogout=async ()=>{
    setLoading(true);
    try{
    await logout();
    setUser(null);
    }
    catch(err){
      console.log(err);
    }
    setLoading(false);
  }

   useEffect(()=>{
        const getandsetuser=async()=>{
        const data=await getMe();
        setUser(data.user);
        setLoading(false);
      }
      getandsetuser();
    },[])
   return {user,loading,handleLogin,handleLogout,handleRegister}
}
