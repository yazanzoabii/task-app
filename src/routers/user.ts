import express from 'express'
import { User } from '../models/user'
import { auth } from '../middleware/auth'
export const userRouter = express.Router()

interface RequestBody {
    generateAuthToken(): unknown;
    save(): unknown;
    // properties of the req.body object
}

userRouter.post('/users', async (req:any, res) => {
    const user = new User(req.body) as unknown as RequestBody

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

userRouter.post('/users/login', async (req:any, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password) as unknown as RequestBody
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

userRouter.post('/users/logout', auth, async (req:any, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

userRouter.post('/users/logoutAll', auth, async (req:any, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

userRouter.get('/users/me', auth, async (req:any, res) => {
    res.send(req.user)
})

userRouter.patch('/users/me', auth, async (req:any, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

userRouter.delete('/users/me', auth, async (req:any, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

//module.exports = userRouter