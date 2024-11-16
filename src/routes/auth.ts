import express, { Router, Request, Response } from 'express'
import prisma from '@root/client'
import bcrypt from 'bcrypt'
import {
	isDataValid,
	isEmailTaken,
	addTokensToResponse,
} from '@utils/auth/registerFunctions'
import { comparePassword } from '@utils/auth/loginFunctions'

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

		await comparePassword(req, res, user, password)
		
	} catch (err) {
		return res.status(500).json({ error: req.t('loginError') })
	}
})

router.post('/register', async (req: Request, res: Response) => {
	try {
		const { email, password, name } = req.body

		isDataValid(req, res, email, password, name)

		await isEmailTaken(req, res, email)

		const hashedPassword = await bcrypt.hash(password, 10)

		const user = await prisma.user.create({
			data: { email, password: hashedPassword, name },
		})

		addTokensToResponse(res, user)

		return res.status(201).json({ message: req.t('registeredSuccessfully') })
	} catch (error) {
		console.error(error)
		return res.status(500).json({ error: req.t('registerError') })
	}
})

export default router
