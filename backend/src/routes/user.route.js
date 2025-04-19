import { Router } from "express";
import { followUser, getSuggestedUsers, getUserProfile, updateProfile } from "../controllers/user.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = Router()

router.get('/profile/:username', protectRoute, getUserProfile)
router.get('/suggested', protectRoute, getSuggestedUsers)
router.post('/follow/:id', protectRoute, followUser)
router.post('/update', protectRoute, updateProfile)

export default router
