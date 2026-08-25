const app=require('./src/app');
const express=require('express');

require('dotenv').config();
const connectToDb=require('./src/config/database');

connectToDb();
app.use(express.json())
app.listen(3000,()=>{
  console.log("server is listning on port 3000");
})