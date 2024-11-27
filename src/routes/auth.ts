import express, { Router, Request, Response } from 'express'
import prisma from '@root/client'
import bcrypt from 'bcrypt'
import { comparePassword } from '@utils/auth/loginFunctions'
import jwt from 'jsonwebtoken'

import {
	isDataValid,
	isEmailTaken,
	handleRegisterErrors,
} from '@utils/auth/registerFunctions'
import { Payload, setTokens } from '@utils/auth/token'

const router: Router = express.Router()
router.post('/login', async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body
		const user = await prisma.user.findFirstOrThrow({
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

		isDataValid(req, email, password, name)

		await isEmailTaken(req, email)

		const hashedPassword = await bcrypt.hash(password, 10)

		const user = await prisma.user.create({
			data: { email, password: hashedPassword, name },
		})

		await setTokens(res, user)

		return res.status(201).json({ message: req.t('registeredSuccessfully') })
	} catch (error) {
		console.error(error)
		handleRegisterErrors(req, res, error as Error)
	}
})

router.post('/refresh', async (req, res) => {
	try {
		const token = req.cookies['refreshToken']
		const secret = process.env.REFRESH_TOKEN_SECRET || ''
		const decoded = jwt.verify(token, secret)

		const user = await prisma.user.findFirstOrThrow({
			where: {
				id: (decoded as Payload).sub,
			},
		})

		await setTokens(res, user)

		return res.status(200).send()
	} catch (err) {
		return res.redirect(302, '')
	}
})

export default router
