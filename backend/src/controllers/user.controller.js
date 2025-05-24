import cloudinary from "../lib/cloudinary.js"
import Notification from "../models/notification.model.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"

export const getUserProfile =async(req, res) => {
    const username  = req.params.username
    try {
        const user = await User.findOne({username: username}).select('-password')
        if(!user){
            return res.status(404).json({error: 'user not found'})
        }
        return res.status(200).json(user)

    } catch (error) {
        console.log('error in getUserProfile controller', error)
        return res.status(500).json({ error: 'internal server error'})
    }
}

export const followUser = async (req, res)=>{
    try {
        const { id } = req.params
        const userToFollow = await User.findById(id)
        const currentUser = await User.findById( req.user._id )

        // console.log(currentUser, userToFollow)

        if(id == req.user._id){
            return res.status(400).json({error: 'cannot follow/unfollow yourself'})
        }
        if(!userToFollow || !currentUser){
            return res.status(404).json({error: 'user doesnt exist'})
        }

        const isFollowing = currentUser.following.includes(id)

        if(isFollowing){
            await User.findByIdAndUpdate(id, {$pull: {followers: req.user._id}})
            await User.findByIdAndUpdate(req.user._id, {$pull: {following: id}})

            //TODO: return id of user
            return res.status(200).json({message: 'unfollowed successfully'})
        }else{
            await User.findByIdAndUpdate(id, {$push: {followers: req.user._id}})
            await User.findByIdAndUpdate(req.user._id, {$push: {following: id}})

            const newNotification = new Notification({
                from: req.user._id,
                to: id,
                type: 'follow',
            })

            await newNotification.save()

            //TODO: return id of user
            return res.status(200).json({message: 'followed successfully'})
        }


    } catch (error) {
        console.log('error in get followUser controller', error)
        return res.status(500).json({ error: 'internal server error'})
    }
}

export const getSuggestedUsers =async( req, res) =>{
    try {
        const userId = req.user._id
        const usersIFollow = await User.findById(userId).select('following')

        const users = await User.aggregate([
            {
                $match:{
                    _id: {$ne: userId}
                }
            },
            {
                $sample: {size: 10}
            }
        ])

        const filteredUsers = users.filter(user=>!usersIFollow.following.includes(user._id))
        const suggestedUsers = filteredUsers.slice(0,4)

        suggestedUsers.forEach((user) => (user.password = null))

        res.status(200).json(suggestedUsers)

    } catch (error) {
        console.log('error in suggestedUsers controller', error)
        return res.status(500).json({error: 'internal server error'})
    }
}

export const updateProfile = async(req, res) => {
    const {fullname, email, username, currentPassword, newPassword, bio, link} = req.body
    let{profileImg, coverImg} = req.body

    const userId = req.user._id

    try {
        let user = await User.findById(userId)
        if(!user){
            return res.status(404).json({error: 'user not found'})
        }

        if(!newPassword && currentPassword || newPassword && !currentPassword){
            return res.status(400).json({error: 'both current and new passwords required'})
        }

        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword, user.password)
            if(!isMatch){
                return res.status(400).json({error: 'current password is incorrect'})
            }
            if(newPassword.length < 6){
                return res.status(400).json({error: 'password must be atleast 6 characters'})
            }

            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(newPassword, salt)
        }

        if(profileImg){
            if(user.profileImage){
                await cloudinary.uploader.destroy(user.profileImage.split("/").pop().split(".")[0])
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadedResponse.secure_url
        }

        if(coverImg){
            if(user.coverImage){
                await cloudinary.uploader.destroy(user.coverImage.split("/").pop().split(".")[0])
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg)
            coverImg = uploadedResponse.secure_url
        }

        user.fullname = fullname || user.fullname
        user.email = email || user.email
        user.username = username || user.username
        user.bio = bio || user.bio
        user.link = link || user.link
        user.profileImage = profileImg || user.profileImage
        user.coverImage = coverImg || user.coverImage

        user = await user.save()

        user.password = null

        return res.status(200).json(user)
    
    } catch (error) {
        console.log('error in updateProfile', error)
        return res.status(500).json({error: 'internal server error'})
    }
}