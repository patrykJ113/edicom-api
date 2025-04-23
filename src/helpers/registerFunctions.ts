import { isValidEmail, isValidPassword } from '@/src/utils/validate'
import { Response, Request } from 'express'
import prisma from '@/client'
import InvalidInputsError from '@errors/InvalidInputsError'
import EmailIsTakenError from '@errors/EmailIsTakenError'

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
	} else {
		return res.status(500).json({ error: req.t('registerError') })
	}
}
