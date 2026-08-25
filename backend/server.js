const app=require('./src/app');
const express=require('express');

require('dotenv').config();
const connectToDb=require('./src/config/database');

connectToDb();
app.use(express.json())
const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
  console.log(`server is listning on port {PORT}`);
})