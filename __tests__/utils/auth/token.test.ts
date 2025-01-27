import * as tokenFuncs from '@utils/auth/token'
import jwt from 'jsonwebtoken'
import { prismaMock } from '@/singleton'

jest.mock('jsonwebtoken', () => ({
	sign: jest.fn(() => 'mocked.jwt.token'),
}))

describe('Tokens', () => {
	beforeAll(() => {
		process.env.ACCESS_TOKEN_SECRET = 'mocked-access-secret'
		process.env.REFRESH_TOKEN_SECRET = 'mocked-refresh-secret'
	})

	afterAll(() => {
		delete process.env.ACCESS_TOKEN_SECRET
		delete process.env.REFRESH_TOKEN_SECRET
	})

	describe('generateTokens', () => {
		const user = {
			id: '123',
			name: 'John Doe',
			email: 'john.doe@example.com',
			password: '',
			refresh_token: '',
		}

		it('should return in a array a access and refresh token for a valid user', () => {
			const tokenArray = tokenFuncs.generateTokens(user)
			expect(tokenArray).toHaveLength(2)

			const [access_token, refresh_token] = tokenArray

			expect(access_token).toBe('mocked.jwt.token')
			expect(refresh_token).toBe('mocked.jwt.token')

			expect(jwt.sign).toHaveBeenNthCalledWith(
				1,
				{
					sub: user.id,
					name: user.name,
					email: user.email,
				},
				process.env.ACCESS_TOKEN_SECRET,
				{ expiresIn: '5m' }
			)

			expect(jwt.sign).toHaveBeenNthCalledWith(
				2,
				{
					sub: user.id,
					name: user.name,
					email: user.email,
				},
				process.env.REFRESH_TOKEN_SECRET,
				{ expiresIn: '30d' }
			)
		})

		it('should throw an error if ACCESS_TOKEN_SECRET is not defined', () => {
			delete process.env.ACCESS_TOKEN_SECRET

			try {
				expect(() => tokenFuncs.generateTokens(user)).toThrow(
					'ACCESS_TOKEN_SECRET is not defined in environment variables'
				)
			} catch (error) {}
		})

		it('should throw an error if REFRESH_TOKEN_SECRET is not defined', () => {
			delete process.env.REFRESH_TOKEN_SECRET

			try {
				expect(() => tokenFuncs.generateTokens(user)).toThrow(
					'REFRESH_TOKEN_SECRET is not defined in environment variables'
				)
			} catch (error) {}
		})
	})

	describe('setTokens', () => {
		const user = {
			email: 'test@example.com',
			password: 'password123',
			id: '123123123213',
			name: 'name',
			refresh_token: '',
		}

		it('Sets the Authorization header and a http only cookie', async () => {
			const generateTokensMock = jest.spyOn(tokenFuncs, 'generateTokens')
			generateTokensMock.mockReturnValue(['access', 'refresh'])

			prismaMock.user.update.mockResolvedValue({
				email: 'test@example.com',
				password: 'password123',
				id: '123123123213',
				name: 'name',
				refresh_token: 'refresh',
			})

			await tokenFuncs.setTokens(res, user)

			expect(generateTokensMock).toHaveBeenCalled()
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
		})
	})
})
