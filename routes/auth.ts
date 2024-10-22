import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

router.post('/log-in', (req, res) => {
	res.status(200).send('Logged in successfully')
})

router.post('/register', async (req, res) => {
	try {
		const user = await prisma.user.create({
			data: { email: req.body.email, password: req.body.password },
		})
		res.status(201).json({ message: 'User registered successfully' })
	} catch (error) {
		res
			.status(500)
			.json({ message: 'Something went wrong when creating a user' })
    }
})

export default router
