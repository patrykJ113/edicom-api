import express, { Router, Request, Response } from 'express'
import { isValidPassword, isValidEmail } from '@utils/auth/validate'
import prisma from '@root/client'
import bcrypt from 'bcrypt'

const router: Router = express.Router()
router.post('/login', async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body
		const user = await prisma.user.findFirst({
			where: {
				email,
			},
		})

		if (!user) {
			return res.status(404).json({ error: req.t('invalidCredentials') })
		}

		const isMatch = await bcrypt.compare(password, user.password)

		if (isMatch) {
			return res.status(200).json({ message: req.t('loginSuccessful') })
		} else {
			return res.status(400).json({ error: req.t('invalidCredentials') })
		}
	} catch (err) {
		return res.status(400).json({ error: req.t('loginError') })
	}
})

router.post('/register', async (req: Request, res: Response) => {
	try {
		const { email, password, name } = req.body

		if (!isValidEmail(email) || !isValidPassword(password) || !name) {
			return res.status(400).json({
				error: req.t('inputsInvalid'),
			})
		}

		const isEmailTaken = await prisma.user.findFirst({ where: { email } })
		if (isEmailTaken) {
			return res.status(409).json({
				error: req.t('emailIsTaken'),
			})
		}

		const hashedPassword = await bcrypt.hash(password, 10)

		await prisma.user.create({
			data: { email, password: hashedPassword, name },
		})

		return res.status(201).json({ message: req.t('registeredSuccessfully') })
	} catch (error) {
		console.error(error)
		return res.status(500).json({ error: req.t('registerError') })
	}
})

export default router
