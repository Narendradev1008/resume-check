const app=require('./src/app');
const express=require('express');

require('dotenv').config();
const connectToDb=require('./src/config/database');
const dns = require("node:dns");
dns.setServers(["1.1.1.1", "1.0.0.1"]);
connectToDb();
app.use(express.json())
app.listen(3000,()=>{
  console.log("server is listning on port 3000");
})