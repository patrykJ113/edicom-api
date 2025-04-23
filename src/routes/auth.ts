import express, { Router, Request, Response } from 'express'
import prisma from '@/client'
import bcrypt from 'bcryptjs'
import { comparePassword } from '@helpers/loginFunctions'
import jwt from 'jsonwebtoken'

import {
	isDataValid,
	isEmailTaken,
	handleRegisterErrors,
} from '@helpers/registerFunctions'
import { handleRefreshErrors } from '@helpers/refreshFunctions'
import { Payload, setTokens } from '@helpers/token'
import { PrismaError } from '@/src/types/prismaError'

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

router.post('/verify', async (req, res) => {
	try {
		const bearerToken = req.headers.authorization
		const accessToken = bearerToken?.slice(7)

		const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string

		try {
			if (accessToken) {
				jwt.verify(accessToken, ACCESS_TOKEN_SECRET)

				return res
					.status(200)
					.json({ message: 'Authorized request successful' })
			} else {
				throw new Error()
			}
		} catch {
			const refreshToken = req.cookies['refreshToken']
			const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string
			const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET)

			const user = await prisma.user.findFirstOrThrow({
				where: {
					id: (decoded as Payload).sub,
					refresh_token: refreshToken,
				},
			})

			const payload: Payload = {
				sub: user.id,
				email: user.email,
				name: user.name,
			}

			const newAccessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET)
			const newRefreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET)

			await prisma.user.update({
				where: {
					id: user.id,
					refresh_token: refreshToken,
				},
				data: {
					refresh_token: newRefreshToken,
				},
			})

			res.setHeader('Authorization', `Bearer ${newAccessToken}`)

			res.cookie('refreshToken', newRefreshToken, {
				httpOnly: true,
				secure: true,
				sameSite: 'none',
				path: '/',
				maxAge: 30 * 24 * 60 * 60 * 1000,
			})
			return res.status(200).json({ message: 'Authorized request successful' })
		}
	} catch (err) {
		return res.status(401).json({ error: 'Unauthorized' })
	}
})

export default router
