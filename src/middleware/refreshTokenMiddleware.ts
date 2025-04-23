import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '@/client'
import { Payload, setTokens } from '@helpers/token'

export const refreshTokenMiddleware = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		if (req.hasValidAccessToken) {
			return next()
		}

		const refreshToken = req.cookies['refreshToken']
		const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string
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

		const newAccessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
			expiresIn: '5m',
		})
		const newRefreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
			expiresIn: '30d',
		})

		await prisma.user.update({
			where: {
				id: user.id,
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

		next()
	} catch (error) {
		return res.status(401).send('Unauthorized')
	}
}
