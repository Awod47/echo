import { Router } from "express";
import { createPost, deletePost, createComment, likeUnlikePost, getAllPosts, getLikedPosts, getfollowingPosts, getUserPosts } from "../controllers/post.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = Router()

router.get('/all', protectRoute, getAllPosts)
router.get('/user/:id', protectRoute, getUserPosts)
router.get('/following', protectRoute, getfollowingPosts)
router.get('/liked/:id', protectRoute, getLikedPosts)
router.post('/create', protectRoute, createPost)
router.post('/comment/:id', protectRoute, createComment)
router.post('/like/:id', protectRoute, likeUnlikePost)
router.delete('/delete/:id', protectRoute, deletePost)

export default router