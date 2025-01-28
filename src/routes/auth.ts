import express, { Router, Request, Response } from 'express'
import prisma from '@/client'
import bcrypt from 'bcryptjs'
import { comparePassword } from '@utils/auth/loginFunctions'
import jwt from 'jsonwebtoken'

import {
	isDataValid,
	isEmailTaken,
	handleRegisterErrors,
} from '@utils/auth/registerFunctions'
import { handleRefreshErrors } from '@utils/auth/refreshFunctions'
import { Payload, setTokens } from '@utils/auth/token'
import { PrismaError } from '@app-types'

const router: Router = express.Router()
router.post('/login', async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body
		const user = await prisma.user.findFirstOrThrow({
			where: {
				email,
			},
		})

		await comparePassword(req, res, user, password)
	} catch (err) {
		if ((err as PrismaError).code === 'P2025') {
			return res.status(401).json({ error: req.t('invalidCredentials') })
		} else {
			return res.status(500).json({ error: req.t('loginError') })
		}
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
				refresh_token: token,
			},
		})

		await setTokens(res, user)

		return res.status(200).send()
	} catch (error) {
		handleRefreshErrors(res, error as Error)
	}
})

export default router
