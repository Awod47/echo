import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import { generateTokenAndSetCookie } from '../lib/utils/generateTokens.js'

export const signUp = async (req, res)=>{
    try {
        const { userName, fullName, email, password } = req.body

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)){
            return res.status(400).json({error: 'invalid email format'})
        }
        
        const existingUser = await User.findOne({ userName })
        if (existingUser){
            return res.status(400).json({error: 'username already taken'})
        }
        
        const existingEmail = await User.findOne({ email })
        if (existingEmail){
            return res.status(400).json({error: 'an account with this email already exists'})
        }
        
        if(password.length < 6){
            return res.status(400).json({error: 'password should be a minimum 6 characters'})
        }

        //hash
        const salt = await bcrypt.genSalt(10)
        const hashedPass = await bcrypt.hash(password, salt)

        const newUser = new User({
            fullname: fullName,
            username: userName,
            email: email,
            password: hashedPass,
        })

        if(newUser){
            generateTokenAndSetCookie(newUser._id, res)
            await newUser.save()

            res.status(201).json({
                _id: newUser._id,
                fullname: newUser.fullname,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImage,
                coverImg: newUser.coverImage
            })
        }
        else{
            res.status(400).json({error: 'invalid user data'})
        }

    } catch (error) {
        console.log('error in the signup controller', error)
        res.status(500).json({error: 'internal server error'})
    }
}

export const logIn = async (req, res)=>{
    try {
        const {username, password} = req.body
        const user = await User.findOne({username: username})
        if(!user){
            return res.status(400).json({error: 'invalid username or password'})
        }
        
        const isCorrectPassword = await bcrypt.compare(password, user.password)

        if(!isCorrectPassword){
            return res.status(400).json({error: 'invalid username or password'})
        }

        generateTokenAndSetCookie(user._id, res)

        res.status(200).json({
            _id: user._id,
                fullname: user.fullname,
                username: user.username,
                email: user.email,
                followers: user.followers,
                following: user.following,
                profileImg: user.profileImage,
                coverImg: user.coverImage
        })

    } catch (error) {
        console.log('error in the login controller', error)
        return res.status(500).json({error: 'internal server error'})
    }
}

export const logOut = (req, res)=>{
    try {
        res.cookie("jwt", "", {maxAge: 0})
        return res.status(200).json({message: 'logged out successfully'})
    } catch (error) {
        console.log('error in the logout controller', error)
        res.status(500).json({error: 'internal server error'})
    }
}

export const getMe = async (req, res) =>{
    try {
        const user = await User.findById(req.user._id).select('-password')
        res.status(200).json(user)
    } catch (error) {
        console.log('error in getMe controller', error)
        return res.status(500).json({error: 'internal server error'})
    }
}   