import { Response } from 'express'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { PrismaError } from '@/src/types/prismaError'

export const handleRefreshErrors = (res: Response, error: Error) => {
	if (
		error instanceof JsonWebTokenError ||
		error instanceof TokenExpiredError
	) {
		return res.status(401).json({ error: 'Invalid or expired token' })
	} else if ((error as PrismaError).code === 'P2025') {
		return res.status(401).json({ error: 'User not found or token mismatch' })
	} else {
		return res.status(500).json({ error: 'Error when refreshing the token' })
	}
}
