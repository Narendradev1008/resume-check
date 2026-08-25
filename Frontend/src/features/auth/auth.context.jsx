import {createContext,useState,useEffect} from 'react'
export const AuthContext=createContext();

export const AuthProvider=({children})=>{
     const [user,setUser]=useState(null);
     const [loading,setLoading]=useState(true);
     useEffect( ()=>{
        const getandsetuser=async()=>{
        try {
                const data = await getMe()
                setUser(data.user)
            } catch (err) { } finally {
                setLoading(false)
            }
      }
      getandsetuser();
    },[])
    
     return(
     <AuthContext.Provider value={{user,setUser,loading,setLoading}}>
      {children}
     </AuthContext.Provider>
     )
}
