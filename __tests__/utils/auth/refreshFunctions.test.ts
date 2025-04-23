import { handleRefreshErrors } from '@helpers/refreshFunctions'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

describe('refreshFunctions', () => {
	describe('handleRefreshErrors', () => {
		it('returns 401 and a error message when the token has a invalid format', () => {
			const jwtError = new JsonWebTokenError('')
			handleRefreshErrors(res, jwtError)

			expect(res.status).toHaveBeenCalledWith(401)
			expect(res.json).toHaveBeenCalledWith({
				error: 'Invalid or expired token',
			})
		})

		it('returns 401 and a error message when the token is expired', () => {
			const tokenExpiredError = new TokenExpiredError('', new Date())
			handleRefreshErrors(res, tokenExpiredError)

			expect(res.status).toHaveBeenCalledWith(401)
			expect(res.json).toHaveBeenCalledWith({
				error: 'Invalid or expired token',
			})
		})

		it('returns 401 and a error message when the user is id or refresh token is not found in the db', () => {
			const notFoundError = new PrismaClientKnownRequestError('', {
				code: 'P2025',
				clientVersion: '',
			})

			handleRefreshErrors(res, notFoundError)
			expect(res.status).toHaveBeenCalledWith(401)
			expect(res.json).toHaveBeenCalledWith({
				error: 'User not found or token mismatch',
			})
		})
	})
})
