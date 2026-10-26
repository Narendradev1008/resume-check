import {React,useState} from 'react'
import { Link ,useNavigate} from 'react-router';
import '../auth.form.scss'
import { useAuth } from '../hooks/useAuth';

function Login() {

  const navigate=useNavigate();
  const {loading,handleLogin}=useAuth();

  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("")

  const  handleSumbit=async (e)=>{
    e.preventDefault();
    await handleLogin({email,password});
    navigate('/');
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
      <h1>Welcome back</h1>
      <p className="auth-card__subtitle">Sign in to access your interview reports and saved resumes.</p>
        <form onSubmit={handleSumbit}>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input id="email" value={email} onChange={(e)=>{setEmail(e.target.value)}} name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input id="password" value={password} onChange={(e)=>{setPassword(e.target.value)}} name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required />
        </div>
          <button className='auth-card__submit' type="submit">Sign in</button>
        </form>
        <p className="auth-card__switch">Don't have an account?
          <Link to={'/register'}> Create one</Link>
        </p>
        </div>
    </main>
  )
}

export default Login
