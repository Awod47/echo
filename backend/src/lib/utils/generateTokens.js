import jwt from 'jsonwebtoken'

export const generateTokenAndSetCookie = (userId, res) =>{
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: '15d'
    })

    res.cookie('jwt', token, {
        maxAge: 15 * 24 * 60 * 60* 1000,
        httpOnly: true, //prevents XSS and cross-site scripting attacks
        sameSite: 'strict', //CSRF, cross-site and forgery attacks
        secure: process.env.NODE_ENV !== 'development',
    })
}