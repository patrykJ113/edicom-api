import jwt from 'jsonwebtoken'
import { User } from '@prisma/client'

export function generateTokens(user: User): string[] {
	const payload = {
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
		jwt.sign(payload, ACCESS_TOKEN_SECRET, {}),
		jwt.sign(payload, REFRESH_TOKEN_SECRET, {}),
	]
}
