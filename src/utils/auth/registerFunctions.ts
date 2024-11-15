import { isValidEmail, isValidPassword } from '@utils/auth/validate'
import { Response, Request } from 'express'
import prisma from '@root/client'
import { generateTokens } from '@utils/auth/token'
import { User } from '@prisma/client'

export const isDataValid = (
	req: Request,
	res: Response,
	email: string,
	password: string,
	name: string
) => {
	if (!isValidEmail(email) || !isValidPassword(password) || !name) {
		return res.status(400).json({
			error: req.t('inputsInvalid'),
		})
	}
}

export const isEmailTaken = async (req: Request, res: Response, email: string) => {
	const isEmailTaken = await prisma.user.findFirst({ where: { email } })

	if (isEmailTaken) {
		return res.status(409).json({
			error: req.t('emailIsTaken'),
		})
	}
}

export const addTokensToResponse = (res: Response, user: User) => {
	const [accessToken, refreshToken] = generateTokens(user)

	res.setHeader('Authorization', `Bearer ${accessToken}`)

	res.cookie('refreshToken', refreshToken, {
		httpOnly: true,
		secure: true,
		sameSite: true,
	})
}
