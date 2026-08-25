import {React,useState} from 'react'
import { Link,useNavigate } from 'react-router';
import '../auth.form.scss'
import { useAuth } from '../hooks/useAuth';
function Register() {
  
  let navigate=useNavigate();
  const {loading,handleLogin}=useAuth();
  const [username,setUsername]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPasssword]=useState("");

  const handleSumbit=(e)=>{
    e.preventDefault();
    navigate("/")
  }

  if(loading){
      return (
        <main><h1>Loading....</h1></main>
      )
    }

 

  return (
    <main>
      <div className="form-containor">
      <h1>Register
      </h1>
        <form onSubmit={handleSumbit}>
          <div className="input-group">
          <label>Username</label>
          <input onChange={(e)=>{setUsername(e.target.value)}}
          name="username" type="text" aria-label="enter your username" placeholder="enter username"/>
        </div>
        <div className="input-group">
          <label>Email</label>
          <input  onChange={(e)=>{setEmail(e.target.value)}}
          name="email" type="text" aria-label="enter your email" placeholder="enter email"/>
        </div>
        <div className="input-group">
          <label>Password</label>
          <input onChange={(e)=>{setPasssword(e.target.value)}} 
          name="password" type="text" aria-label="enter your password" placeholder="enter your password"/>
        </div>
          <button className='button primary-button' type="button">sumbit</button>
        </form>
        <p> have an account?
          <Link to={"/login"}> Login</Link>
        </p>
        </div>
    </main>
  )
}

export default Register