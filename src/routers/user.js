const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail, sendCancellationEmail} = require('../emails/account')

//Setup
const router = new express.Router()
const upload = multer({
    //dest: 'avatars', //Remove storing from file system
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Invalid file type. File should be JPG, JPEG or PNG.'))
        }
        return cb(undefined, true)
    }
})

const errorHandler = (error, req, res, next) => {
    res.status(400).send({error: error.message})
}

//login
router.post('/users/login', async(req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch(e) {
        console.log(e)
        res.status(400).send(e)
    }
})

//Logout single session
router.post('/users/logout', auth, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return (token.token !== req.token)
        })
        await req.user.save()
        res.send()
    } catch(e) {
        console.log(e)
        res.status(500).send(e)
    }
})

//Logout all
router.post('/users/logoutAll', auth, async(req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch(e) {
        console.log(e)
        res.status(500).send(e)
    }
})

//Get all the users
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

//Get a single user
// router.get('/users/:id', auth, async (req, res) => {
//     const _id = req.params.id

//     try {
//         const user = await User.findById(_id)
//         if(!user) {
//             return res.status(404).send({})
//         }
//         res.send(user)        
//     } catch(e) {
//         res.status(500).send(e)
//     }
// })

//Create a new user
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch(e) {
        res.status(400).send(e)
    }
})

//Upload an avatar for the user
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    await req.user.save()
    res.send()
}, errorHandler)

//Update a single user
router.patch('/users/me', auth, async (req, res) => {
    const incomingFields = Object.keys(req.body)
    const validFields = ['name', 'email', 'password', 'age']
    const isValidUpdate = incomingFields.every((update) => validFields.includes(update))
    if(!isValidUpdate) {
        return res.status(400).send({'Error': 'Invalid field being updated'})
    }

    try {
        const user = req.user
        incomingFields.forEach((update) => user[update] = req.body[update])
        await user.save()
        
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        if(!user) {
            return res.status(404).send()
        }
        res.send(user)        
    } catch(e) {
        res.status(400).send(e)
    }
})

//Delete own profile
router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id)
        // if(!user) {
        //     return res.status(404).send()
        // }
        await req.user.remove()
        sendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user)        
    } catch(e) {
        console.log(e)
        res.status(400).send(e)
    }
})

//Delete own avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send(req.user)        
    } catch(e) {
        res.status(400).send(e)
    }
})

//Get Avatar
router.get('/users/:id/avatar', async(req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar) {
            throw new Error('Invalid user')
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch(e) {
        res.status(400).send(e)
    }
})

module.exports = router