require('dotenv').config();
const app=require('./src/app');
const express=require('express');

const connectToDb=require('./src/config/database');

app.use(express.json())

const PORT = process.env.PORT || 3000;
  connectToDb();
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });


