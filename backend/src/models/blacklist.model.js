const mongoose=require('mongoose');
const blacklistedSchema=new mongoose.Schema({
      token: {
        type:String,
        require:[true,"token is required to added to blaklist"]
      }
},{
  timestamp:true,
}
)
const tokenBlacklistModel=mongoose.model("blacklistetoken",blacklistedSchema);
module.exports=tokenBlacklistModel;