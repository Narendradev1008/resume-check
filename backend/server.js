require('dotenv').config();
const app=require('./src/app');
const express=require('express');

const invokeGeminiAi=require('./src/services/ai.services');
const connectToDb=require('./src/config/database');

app.use(express.json())

const PORT = process.env.PORT || 3000;
  connectToDb();
  
  // Call the AI service safely
  invokeGeminiAi();

  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });


