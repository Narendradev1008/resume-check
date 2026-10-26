const mongoose=require('mongoose');

const dns = require("node:dns");
dns.setServers(["1.1.1.1", "1.0.0.1"]);
const connectToDb=async ()=>{
  try{
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('database connected succesfully');
  }
  catch(err){
    console.log(err);
  }
}
module.exports=connectToDb;