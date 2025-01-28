import { isValidEmail, isValidPassword } from '@utils/auth/validate'
import { Response, Request } from 'express'
import prisma from '@/client'
import { generateTokens } from '@utils/auth/token'
import { User } from '@prisma/client'
import InvalidInputsError from '@errors/InvalidInputsError'
import EmailIsTakenError from '@src/errors/EmailIsTakenError'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { PrismaError } from '@app-types'

export const isDataValid = (
	req: Request,
	email: string,
	password: string,
	name: string
) => {
	if (!isValidEmail(email) || !isValidPassword(password) || !name) {
		throw new InvalidInputsError(req.t('inputsInvalid'))
	}
}

export const isEmailTaken = async (req: Request, email: string) => {
	const isEmailTaken = await prisma.user.findFirst({ where: { email } })

	if (isEmailTaken) {
		throw new EmailIsTakenError(req.t('emailIsTaken'))
	}
}

export const addTokensToResponse = (
	req: Request,
	res: Response,
	user: User
) => {
	const [accessToken, refreshToken] = generateTokens(user)

	res.setHeader('Authorization', `Bearer ${accessToken}`)

	res.cookie('refreshToken', refreshToken, {
		httpOnly: true,
		secure: true,
		sameSite: true,
	})

	return res.status(201).json({ message: req.t('registeredSuccessfully') })
}

export const handleRegisterErrors = (
	req: Request,
	res: Response,
	error: Error
) => {
	if (error instanceof InvalidInputsError) {
		return res.status(error.statusCode).json({
			error: error.message,
		})
	} else if (error instanceof EmailIsTakenError) {
		return res.status(error.statusCode).json({
			error: error.message,
		})
	} else if (
		error instanceof JsonWebTokenError ||
		error instanceof TokenExpiredError
	) {
		return res.status(401).json({ error: 'Invalid or expired token' })
	} else if ((error as PrismaError).code === 'P2025') {
		return res.status(401).json({ error: 'User not found or token mismatch' })
	} else {
		return res.status(500).json({ error: req.t('registerError') })
	}
}
