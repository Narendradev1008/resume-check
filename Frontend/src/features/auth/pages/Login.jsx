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
    }
  

  if(loading){
      return (
        <main><h1>Loading....</h1></main>
      )
    }

  return (
    <main>
      <div className="form-containor">
      <h1>Login</h1>
        <form onSubmit={handleSumbit}>
        <div className="input-group">
          <label>Email</label>
          <input onChange={(e)=>{setEmail(e.target.value)}} name="email" type="text" aria-label="enter your email" placeholder="enter email"/>
        </div>
        <div className="input-group">
          <label>Password</label>
          <input onChange={(e)=>{setPassword(e.target.value)}} name="password" type="text" aria-label="enter your password" placeholder="enter your password"/>
        </div>
          <button className='button primary-button' type="button submit">Sumbit</button>
        </form>
        <p>Don't have an account?
          <Link to={'/Register'}> Register</Link>
        </p>
        </div>
    </main>
  )
}

export default Login