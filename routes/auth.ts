import express from 'express'
import { PrismaClient } from '@prisma/client'
import { isValidPassword, isValidEmail } from '../utils/auth/validate'

const router = express.Router()
const prisma = new PrismaClient()

router.post('/log-in', (req, res) => {
	res.status(200).send('Logged in successfully')
})

router.post('/register', async (req, res) => {
	const { email, password } = req.body

	try {
		if (isValidEmail(email) && isValidPassword(password)) {
			await prisma.user.create({
				data: { email, password },
			})
			res.status(201).json({ message: 'User registered successfully' })
		} else {
			res.status(400).json({
				error:
					'Invalid credentials: Password or email does not meet requirements.',
			})
		}
	} catch (error) {
		res.status(500).json({ error: 'Something went wrong when creating a user' })
	}
})

export default router
