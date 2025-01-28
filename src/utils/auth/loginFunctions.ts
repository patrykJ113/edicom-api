import { Response, Request } from 'express'
import { User } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { setTokens } from '@utils/auth/token'

export const comparePassword = async (req: Request, res: Response, user: User, password: string) => {
	const isMatch = await bcrypt.compare(password, user.password)

	if (isMatch) {
		await setTokens(res, user)
		return res.status(200).json({ message: req.t('loginSuccessful') })
	} else {
		return res.status(401).json({ error: req.t('invalidCredentials') })
	}
}
