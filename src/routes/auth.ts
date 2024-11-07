import express, { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { isValidPassword, isValidEmail } from '../utils/auth/validate'
import bcrypt from 'bcrypt'

const router: Router = express.Router()
const prisma = new PrismaClient()

router.post('/login', async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body

		const user = await prisma.user.findFirst({
			where: {
				email,
			},
		})

		if (!user) {
			return res
				.status(404)
				.json({ error: 'No account found with the provided email address' })
		}

		const isMatch = await bcrypt.compare(password, user.password)

		if (isMatch) {
			return res.status(200).json({ message: 'Login successful' })
		} else {
			return res.status(400).json({ error: 'Invalid credentials' })
		}
	} catch (err) {
		return res
			.status(400)
			.json({ error: 'Something went wrong when Login in on our side' })
	}
})

router.post('/register', async (req: Request, res: Response) => {
	try {
		const { email, password, name } = req.body

		if (!isValidEmail(email) || !isValidPassword(password) || !name) {
			return res.status(400).json({
				error:
					'Invalid credentials: Password, email, or name does not meet requirements.',
			})
		}

		const isEmailTaken = await prisma.user.findFirst({ where: { email } })
		if (isEmailTaken) {
			return res.status(409).json({
				error:
					"The email you've entered is already taken. Please enter a new email address or try logging in.",
			})
		}

		const hashedPassword = await bcrypt.hash(password, 10)

		await prisma.user.create({
			data: { email, password: hashedPassword, name },
		})

		return res.status(201).json({ message: 'User registered successfully' })
	} catch (error) {
		console.error(error)
		return res
			.status(500)
			.json({ error: 'Something went wrong when creating a user on our side' })
	}
})

export default router
