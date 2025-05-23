import { comparePassword } from '@helpers/loginFunctions'
import bcrypt from 'bcryptjs'
import * as tokenFuncs from '@helpers/token'
import { prismaMock } from '@/singleton'

jest.mock('bcryptjs', () => ({
	compare: jest.fn(),
}))

describe('loginFunctions', () => {
	describe('comparePassword', () => {
		const user = {
			email: 'test@example.com',
			password: 'password123',
			id: '123123123213',
			name: 'name',
			refresh_token: '',
		}

		beforeAll(() => {
			process.env.ACCESS_TOKEN_SECRET = 'mocked-access-secret'
			process.env.REFRESH_TOKEN_SECRET = 'mocked-refresh-secret'
		})

		afterAll(() => {
			delete process.env.ACCESS_TOKEN_SECRET
			delete process.env.REFRESH_TOKEN_SECRET
		})

		it('should return 200 status a message and set cookies and header when password matches', async () => {
			const compareMock = bcrypt.compare as jest.Mock
			compareMock.mockReturnValue(true)

			const generateTokensMock = jest.spyOn(tokenFuncs, 'generateTokens')
			generateTokensMock.mockReturnValue(['access', 'refresh'])

			const reqTMock = req.t as unknown as jest.Mock
			reqTMock.mockReturnValue('loginSuccessful')

			prismaMock.user.update.mockResolvedValue({
				email: 'test@example.com',
				password: 'password123',
				id: '123123123213',
				name: 'name',
				refresh_token: 'refresh',
			})

			await comparePassword(req, res, user, 'password123')

			expect(res.setHeader).toHaveBeenCalledWith(
				'Authorization',
				`Bearer access`
			)
			expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh', {
				httpOnly: true,
				secure: true,
				sameSite: 'none',
				path: '/',
				maxAge: 30 * 24 * 60 * 60 * 1000,
			})

			expect(res.status).toHaveBeenCalledWith(200)
			expect(res.json).toHaveBeenCalledWith({ message: 'loginSuccessful' })
		})

		it("should return 400 status plus error message when password doesn't matches", async () => {
			const compareMock = bcrypt.compare as jest.Mock
			compareMock.mockReturnValue(false)

			const reqTMock = req.t as unknown as jest.Mock
			reqTMock.mockReturnValue('invalidCredentials')

			await comparePassword(req, res, user, 'password123')

			expect(res.status).toHaveBeenCalledWith(401)
			expect(res.json).toHaveBeenCalledWith({
				error: 'invalidCredentials',
			})
		})
	})
})
