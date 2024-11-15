import { generateTokens } from '@utils/auth/token'
import jwt from 'jsonwebtoken'

jest.mock('jsonwebtoken', () => ({
	sign: jest.fn(() => 'mocked.jwt.token'),
}))

describe('generateToken', () => {
	beforeAll(() => {
		process.env.ACCESS_TOKEN_SECRET = 'mocked-access-secret'
		process.env.REFRESH_TOKEN_SECRET = 'mocked-refresh-secret'
	})

	afterAll(() => {
		delete process.env.ACCESS_TOKEN_SECRET
	})

	const user = {
		id: '123',
		name: 'John Doe',
		email: 'john.doe@example.com',
		password: '',
	}

	it('should return in a array a access and refresh token for a valid user', () => {
		const tokenArray = generateTokens(user)
		expect(tokenArray).toHaveLength(2)

		const [access_token, refresh_token] = tokenArray

		expect(access_token).toBe('mocked.jwt.token')
		expect(refresh_token).toBe('mocked.jwt.token')

		expect(jwt.sign).toHaveBeenCalledWith(
			{
				sub: user.id,
				name: user.name,
				email: user.email,
			},
			process.env.ACCESS_TOKEN_SECRET,
			{}
		)
	})

	it('should throw an error if ACCESS_TOKEN_SECRET is not defined', () => {
		delete process.env.ACCESS_TOKEN_SECRET

		try {
			expect(() => generateTokens(user)).toThrow(
				'ACCESS_TOKEN_SECRET is not defined in environment variables'
			)
		} catch (error) {}
	})

	it('should throw an error if REFRESH_TOKEN_SECRET is not defined', () => {
		delete process.env.REFRESH_TOKEN_SECRET

		try {
			expect(() => generateTokens(user)).toThrow(
				'REFRESH_TOKEN_SECRET is not defined in environment variables'
			)
		} catch (error) {}
	})
})
