import jwt from 'jsonwebtoken'
import { User } from '@prisma/client'
import prisma from '@/client'
import { Response } from 'express'

export type Payload = {
	sub: string
	name: string
	email: string,
	iat?: number,
	exp?: number
}

export function generateTokens(user: User): string[] {
	const payload: Payload = {
		sub: user.id,
		name: user.name,
		email: user.email,
	}

	const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
	const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET

	if (!ACCESS_TOKEN_SECRET) {
		throw new Error(
			'ACCESS_TOKEN_SECRET is not defined in environment variables'
		)
	}

	if (!REFRESH_TOKEN_SECRET) {
		throw new Error(
			'REFRESH_TOKEN_SECRET is not defined in environment variables'
		)
	}

	return [
		jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '5m' }),
		jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: '30d' }),
	]
}

export const setTokens = async (res: Response, user: User) => {
	const [accessToken, refreshToken] = exports.generateTokens(user)

	await prisma.user.update({
		where: {
			id: user.id,
		},
		data: {
			refresh_token: refreshToken,
		},
	})

	res.setHeader('Authorization', `Bearer ${accessToken}`)

	res.cookie('refreshToken', refreshToken, {
		httpOnly: true,
		secure: true,
		sameSite: 'none',
		path: '/',
		maxAge: 30 * 24 * 60 * 60 * 1000,
	})
}
