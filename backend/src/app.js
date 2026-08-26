const express=require('express');
const cookieparser=require('cookie-parser');
const cors=require('cors');

const app=express();
app.use(express.json());
app.use(cookieparser());



app.use(cors({
  origin: 'http://localhost:5173', // Your local React / Vite frontend
  credentials: true
}))

// require all routes here
const authRouter=require('./routes/auth.routes');
const interviewRouter=require('./routes/interview.routes');

// all auth api routes here
app.use('/api/auth',authRouter)
app.use('/api/interview',interviewRouter)


app.get('/',(req,res)=>{
  res.json({ message: 'Auth API endpoint is active' });
});
;
module.exports=app;