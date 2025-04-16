import { Router } from "express";
import {getMe, logIn, logOut, signUp} from '../controllers/auth.controller.js'
import protectRoute from "../middleware/protectRoute.js";

const router = Router()

router.post('/signup', signUp)
router.post('/login', logIn)
router.post('/logout', logOut)
router.get('/user-check', protectRoute, getMe)

export default router