import { comparePassword } from '@utils/auth/loginFunctions'
import { Request, Response } from 'express'
import bcrypt from 'bcrypt'

jest.mock('bcrypt', () => ({
	compare: jest.fn(),
}))

const req = {
	t: jest.fn(),
} as unknown as Request

const res = {
	status: jest.fn(() => res),
	json: jest.fn(),
} as unknown as Response

describe('loginFunctions', () => {
	describe('comparePassword', () => {
		const user = {
			email: 'test@example.com',
			password: 'password123',
			id: '123123123213',
			name: 'name',
			refresh_token: '',
		}

		it('should return 200 status plus message when password matches', async () => {
			const compareMock = bcrypt.compare as jest.Mock
			compareMock.mockReturnValue(true)

			const reqTMock = req.t as unknown as jest.Mock
			reqTMock.mockReturnValue('loginSuccessful')

			await comparePassword(req, res, user, 'password123')

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({ message: 'loginSuccessful' })
		})

		it("should return 400 status plus error message when password doesn't matches", async () => {
			const compareMock = bcrypt.compare as jest.Mock
			compareMock.mockReturnValue(false)

			const reqTMock = req.t as unknown as jest.Mock
			reqTMock.mockReturnValue('invalidCredentials')

			await comparePassword(req, res, user, 'password123')

			expect(res.status).toHaveBeenCalledWith(400)
			expect(res.json).toHaveBeenCalledWith({
				error: 'invalidCredentials',
			})
		})
	})
})
