const express=require('express');
const User=require('../models/User');
const router=express.Router();
const {body , validationResult}=require('express-validator');
const bcrypt=require('bcryptjs');
var jwt=require('jsonwebtoken');
const fetchuser=require('../middleware/fetchuser');

const JWT_SECRET='sujalisagoodboy'

// Route 1: create a user using post "/api/auth/createuser" . No login required 

router.post('/createuser',[
    body('name','enter a valid name').isLength({min:3}),
    body('email','enter a valid email').isEmail(),
    body('password','Password must be atleast 5 characters').isLength({min:3}),
    ],async(req,res)=>{
        //if there are errors , return bad request and errors
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    //check whether user with this email exist already
    try{

    //create a new user
    let user= await User.findOne({email:req.body.email});
    if (user){
        return res.status(400).json({error:"sorry a user with this email already exists"})
    }
    const salt=await bcrypt.genSalt(10);
    const secPass=await bcrypt.hash(req.body.password,salt);
    user=await User.create({
        name:req.body.name,
        password:secPass,
        email:req.body.email,
    });

    const data={
        user:{
            id:user.id
        }
    }

    const authtoken=jwt.sign(data,JWT_SECRET);
    
    res.json({authtoken})

}catch(error){
    console.error(error.message);
    res.status(500).send("some error occured");
}
})


//Route 2 : authenticate a user using :post "/api/auth/login". No login required
router.post('/login',[
    body('email','enter a valid email').isEmail(),
    body('password','Password cannot be blank').exists(),
    ],async(req,res)=>{

            //if there are errors , return bad request and errors
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    const {email,password}=req.body;
    try{
        let user=await User.findOne({email});
        if(!user){
            res.status(400).json({error:"Please try to login with correct credentials "});
        }

        const passwordCompare=await bcrypt.compare(password,user.password);
        if(!passwordCompare){
            res.status(400).json({error:"Please try to login with correct credentials "});
        }

        const data={
            user:{
                id:user.id
            }
        }
    
        const authtoken=jwt.sign(data,JWT_SECRET);
        res.json({authtoken});
    } catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
    });



    //ROUTE 3: GET LOGGEDIN USER USING :POST "/api/auth/getuser"  . LOGIN REQUIRED

    router.post('/getuser',fetchuser,async(req,res)=>{

    try{
        userId="req.user.id";
        const user=await User.findById(userId).select("-password");
        res.send(user);
    }catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }

})

module.exports=router