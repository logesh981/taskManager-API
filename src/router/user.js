const express=require("express")
const router=express.Router()
const User=require("../models/user")
const auth=require("../middleware/auth")
const multer=require('multer')
const {sendWelcomeEmail,sendCancelationEmail}=require('../email/account')
router.post("/users",async(req,res)=>{
    const user=new User(req.body)
    console.log(user)
    try{
        console.log(user.email)
        await user.save()
        console.log(user.email)
        sendWelcomeEmail(user.email,user.name)
        
        const token= await user.generateAuthToken()
        res.status(201).send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
})

router.post('/users/login',async(req,res)=>{
    try{
        
        const user=await User.findByCredentials(req.body.email,req.body.password)
        const token= await user.generateAuthToken()
        res.send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
})
router.post("/users/logout",auth,async(req,res)=>{
    try{
    req.user.tokens=req.user.tokens.filter((token)=>{
        return token.token!==req.token
    })
    await req.user.save()
    res.status(200).send(req.user)
}catch(e){
   res.status(500).send()
}
})
router.post("/users/logoutAll",auth,(req,res)=>{
    try{
      req.user.tokens=[]
      req.user.save()
      res.status(200).send()
    }catch(e){
        res.status(500).send()
    }
})
router.get("/users/me",auth,async(req,res)=>{
    res.send(req.user)
})

// router.get("/users/:id",async(req,res)=>{
//     const _id=req.params.id
//     try{
//         const user=await User.findById(_id)
//         if(!user){
//             return res.status(404).send()
//         }
//         res.send(user)
//     }catch(e){
//         res.status(500).send()
//     }
// })
router.patch("/users/me",auth,async(req,res)=>{
    const updates=Object.keys(req.body)
    const allowedUpdates=["name","age","email","password"]
    const isValidOperation=updates.every((update)=>allowedUpdates.includes(update))
    if(!isValidOperation){
        return res.status(400).send({error:"enter a valid property"})
    }
    try{
        
        updates.forEach((update)=> req.user[update] = req.body[update])
        await req.user.save()
        //const usere=await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
    //   if(!user){
    //     return res.status(404).send()
    //   }
      res.send(req.user)
      }catch(e){
      res.status(400).send(e)
      }
  })
router.delete("/users/me",auth,async(req,res)=>{
    try{
        // const user=await User.findByIdAndDelete(req.user._id)
        // if(!user){
        //     return res.status(404).send()
        // }
        await req.user.remove()
        sendCancelationEmail(req.user.email,req.user.name)
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})
const upload=multer({
    
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
             return cb(new Error("uplaod only pictures"))
        }
        cb(undefined,true)
    }

})
router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
    req.user.avatar=req.file.buffer
    await req.user.save()
    res.status(200).send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})
router.delete('/users/me/avatar',auth,async (req,res)=>{
    if(req.user.avatar){
        req.user.avatar=undefined
        await req.user.save()
    }
    res.status(200).send()
})
router.get('/users/:id/avatar',async(req,res)=>{
    try{
    const user= await User.findById(req.params.id)
    if(!user||!user.avatar){
        throw new Error()
    }
    res.set('Content-Type','image/jpg')
    res.send(user.avatar)
    }catch(e){
    res.status(404).send()
    }
    
})
module.exports=router