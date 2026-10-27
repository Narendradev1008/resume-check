import {React,useState} from 'react'
import { Link,useNavigate } from 'react-router';
import '../auth.form.scss'
import { useAuth } from '../hooks/useAuth';
function Register() {
  
  let navigate=useNavigate();
  const {loading,handleRegister}=useAuth();
  const [username,setUsername]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPasssword]=useState("");
  const [error,setError]=useState("")

  const handleSumbit=async (e)=>{
    e.preventDefault();
    setError("")
    try {
      await handleRegister({username,email,password})
      navigate("/")
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create your account. Please try again.")
    }
  }
  if(loading){
      return (
       <main className="loading-screen">
            <div className="loading-spinner"></div>
        </main>
      )
    }

 

  return (
    <main className="auth-page">
      <div className="auth-card">
      <p className="auth-card__eyebrow">ResumeCheck</p>
      <h1>Create your account</h1>
      <p className="auth-card__subtitle">Save interview reports and generate tailored resumes for your applications.</p>
        <form onSubmit={handleSumbit}>
          <div className="input-group">
          <label htmlFor="username">Username</label>
          <input id="username" value={username} onChange={(e)=>{setUsername(e.target.value)}}
          name="username" type="text" autoComplete="username" placeholder="Choose a username" required />
        </div>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input id="email" value={email} onChange={(e)=>{setEmail(e.target.value)}}
          name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input id="password" value={password} onChange={(e)=>{setPasssword(e.target.value)}}
          name="password" type="password" autoComplete="new-password" placeholder="Create a password" required />
        </div>
          <button className='auth-card__submit' type="submit">Create account</button>
        </form>
        {error && <p className="auth-card__error" role="alert">{error}</p>}
        <p className="auth-card__switch">Already have an account?
          <Link to={"/login"}> Sign in</Link>
        </p>
        </div>
    </main>
  )
}

export default Register
