const express=require('express');
const cookieparser=require('cookie-parser');
const cors=require('cors');

const app=express();
app.use(express.json());
app.use(cookieparser());



app.use(cors({
 origin: [
    'https://resume-check-pearl.vercel.app',
    'http://localhost:5173'
  ], // Your local React / Vite frontend
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

// Lightweight endpoint for hosting health checks and external uptime monitors.
// Keep this independent of MongoDB and AI providers so it can answer quickly.
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use((error, req, res, next) => {
  if (error) {
    return res.status(400).json({ message: error.message || "Request could not be processed." })
  }
  next()
})

module.exports=app;
