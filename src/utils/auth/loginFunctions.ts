import { Response, Request } from 'express'
import { User } from '@prisma/client'
import bcrypt from 'bcrypt'

export const comparePassword = async (req: Request, res: Response, user: User, password: string) => {
	const isMatch = await bcrypt.compare(password, user.password)

	if (isMatch) {
		return res.status(200).json({ message: req.t('loginSuccessful') })
	} else {
		return res.status(400).json({ error: req.t('invalidCredentials') })
	}
}
