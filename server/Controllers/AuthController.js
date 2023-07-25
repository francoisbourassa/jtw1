const User = require("../Models/UserModel");
const { createSecretToken } = require("../util/SecretToken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.Login = async (req, res, next) => {
  try {
    console.log('Starting user login process');
    const { email, password } = req.body;
    if(!email || !password ){
      console.log('Missing email or password');
      return res.json({message:'All fields are required'})
    }
    console.log('Searching user in the database');
    const user = await User.findOne({ email });
    console.log('User Found:', user);  
    if(!user){
      console.log('No user found or incorrect password');
      return res.json({message:'Incorrect password or email' }) 
    }
    console.log('Comparing passwords');
    const auth = (password === user.password);
    console.log('Password Matches:', auth);  
    if (!auth) {
      console.log('Passwords do not match');
      return res.json({message:'Incorrect password or email' }) 
    }
    console.log('Creating token for the user');
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    console.log('User logged in successfully');
    res.status(201).json({ message: "User logged in successfully", success: true });
    next()
  } catch (error) {
    console.error('Error occurred during the login process:', error);
  }
}

module.exports.Signup = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;
    if(!email || !password || !username ){
      return res.json({message:'All fields are required'})
    }

    const existingUser = await User.findOne({ email });
    if(existingUser) {
      return res.json({message:'User already exists' }) 
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ email, password: hashedPassword, username });
    await user.save();

    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    res.status(201).json({ message: "User signed up successfully", success: true });
    next()
  } catch (error) {
    console.error(error);
  }
}

module.exports.getSignup = async (req, res, next) => {
    try {
        res.send("Signup page");
    } catch (error) {
        console.error(error);
    }
}

module.exports.userVerification = (req, res) => {
  const token = req.cookies.token
  if (!token) {
    return res.json({ status: false })
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
     return res.json({ status: false })
    } else {
      const user = await User.findById(data.id)
      if (user) return res.json({ status: true, user: user.username })
      else return res.json({ status: false })
    }
  })
}
