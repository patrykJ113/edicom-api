import express from 'express'
import { PrismaClient } from '@prisma/client'
import { isValidPassword, isValidEmail } from '../utils/auth/validate'
import bcrypt from 'bcrypt'

const router = express.Router()
const prisma = new PrismaClient()

router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body

		const user = await prisma.user.findFirstOrThrow({
			where: {
				email,
			},
		})

		const isMatch = await bcrypt.compare(password, user.password)

		if (isMatch) {
			return res.status(200).json({ message: 'Login successful' })
		} else {
			return res.status(400).json({ message: 'Invalid credentials' })
		}
	} catch (err) {
		return res.status(400).json({ message: 'Invalid credentials' })
	}
})

router.post('/register', async (req, res) => {
	try {
		const { email, password, name } = req.body
		if (isValidEmail(email) && isValidPassword(password) && name !== '') {
			const hashedPassword = await bcrypt.hash(password, 10)

			await prisma.user.create({
				data: { email, password: hashedPassword, name },
			})
			return res.status(201).json({ message: 'User registered successfully' })
		} else {
			return res.status(400).json({
				error:
					'Invalid credentials: Password or email does not meet requirements.',
			})
		}
	} catch (error) {
		return res
			.status(500)
			.json({ error: 'Something went wrong when creating a user' })
	}
})

export default router
