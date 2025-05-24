import cloudinary from "../lib/cloudinary.js"
import Post from "../models/post.model.js"
import User from "../models/user.model.js"
import Notification from '../models/notification.model.js'

export const getAllPosts = async(req, res) =>{
    try{
        const posts = await Post.find().sort({createdAt : -1}).populate({
            path: 'user',
            select: '-password'
        }).populate({
            path: 'comments.user',
            select: '-password'
        })

        if(posts.length == 0){
            return res.status(200).json([])
        }

        return res.status(200).json(posts)
    }catch(error){
        console.log('error in get all posts controller', error)
        return res.status(500).json({error: 'internal server error'})
    }
}

export const createPost = async(req, res) =>{
    try {
        const {text} = req.body
        let {img} = req.body
        const userId = req.user._id
        
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({error: 'user not found'})
        }

        if(!text && !img){
            return res.status(400).json({error: 'post must have text or image'})
        }

        if(img){
            const uploadedResponse = await cloudinary.uploader.upload(img)
            img = uploadedResponse.secure_url
        }

        const newPost = new Post({
            user: userId,
            text: text,
            image: img
        })

        await newPost.save()

        return res.status(201).json(newPost)

    } catch (error) {
        console.log('error in createPost controller', error)
        return res.status(500).json({error: 'internal server error'})
    }
}

export const deletePost = async(req, res) =>{
    try {
        const post = await Post.findById(req.params.id)
        console.log(req.params.id)
        if(!post){
            return res.status(404).json({error: 'post not found'})
        }
        if(post.user.toString() != req.user._id){
            return res.status(401).json({error: 'unauthorized'})
        }
        if(post.image){
            const imgId = post.image.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy(imgId)  
        }

        await Post.findByIdAndDelete(req.params.id)

        return res.status(200).json({message: 'post deleted successfully'})

    } catch (error) {
        console.log('error in deletePost controller', error)
        return res.status(500).json({error: 'internal server error'})
    }
}

export const createComment = async(req, res)=>{
    try {
        const {text} = req.body
        const postId = req.params.id
        const userId = req.user._id

        const post = await Post.findById(postId)

        if(!text){
            return res.status(400).json({error: 'cannot leave an empty comment'})
        }
        if(!post){
            return res.status(404).json({error: 'post not found'})
        }

        const comment = {text: text, user: userId}
        // await Post.findByIdAndUpdate(postId, {$push: {comments: comment}})           also possible but doesnt return the comment/post

        post.comments.push(comment)
        await post.save()

        return res.status(200).json(post)

    } catch (error) {
        console.log('error in createComment controller', error)
        return res.status(500).json({error: 'internal server error'})
    }
}

export const likeUnlikePost = async(req, res)=>{
    try {
        const userId = req.user._id
        const postId = req.params.id

        const post = await Post.findById(postId)
    
        if(!post){
            return res.status(404).json({error: 'post not found'})
        }

        const alreadyLiked = post.likes.includes(userId)
        if(alreadyLiked){
            await Post.updateOne({_id: postId}, {$pull: {likes: userId}})
            await User.updateOne({_id: userId}, {$pull: {likedPosts: postId}})
            res.status(200).json({message: 'post unliked successfully'})
        }
        else{
            post.likes.push(userId)
            await User.updateOne({_id: userId}, {$push: {likedPosts: postId}})
            await post.save()

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: 'like'
            })
            await notification.save()

            return res.status(200).json({message: 'post liked successfully'})
        }

    } catch (error) {
        console.log('error in like post controller', error)
        return res.status(500).json({error: 'internal server error'})
    }
}

export const getLikedPosts = async(req, res)=> {
    const userId = req.params.id
    try {
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({error: 'user not found'})
        }
        
        const likedPosts = await Post.find({_id: {$in : user.likedPosts}}).populate({
            path: 'user',
            select: '-password'
        }).populate({
            path: 'comments.user',
            select: '-password'
        })

        return res.status(200).json(likedPosts)


    } catch (error) {
        console.log('error in getLikedPosts controller', error)
        return res.status(500).json({error: 'internal server error'})
    }
}

export const getfollowingPosts = async(req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({error: 'user not found'})
        }
        
        const following = user.following

        const followingPosts  = await Post.find({user: {$in : following}}).sort({createdAt: -1}).populate({
            path: 'user',
            select: '-password'
        }).populate({
            path: 'comments.user',
            select: '-password'
        })

        return res.status(200).json(followingPosts)

    } catch (error) {
        console.log('error in getfollowingPosts controller', error)
        return res.status(500).json({error: 'internal server error'})
    }
}

export const getUserPosts = async(req, res) => {
    try {
        const userId = req.params.id
        const user = await User.findById(userId)
        if(!user){
            return res.status(404).json({error: 'user not found'})
        }

        const userPosts = await Post.find({user: userId}).sort({createdAt: -1}).populate({
            path: 'user',
            select: '-password'
        }).populate({
            path: 'comments.user',
            select: '-password'
        })

        return res.status(200).json(userPosts)

    } catch (error) {
        console.log('error in getUserPosts controller', error)
        return res.status(500).json({error: 'internal server error'})
    }
}