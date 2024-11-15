import { isValidEmail, isValidPassword } from '@utils/auth/validate'
import { prismaMock } from '@root/singleton'
import { generateTokens } from '@utils/auth/token'
import {
	isDataValid,
	isEmailTaken,
	addTokensToResponse,
} from '@utils/auth/registerFunctions'
import { Request, Response } from 'express'

jest.mock('@utils/auth/validate', () => ({
	isValidEmail: jest.fn(),
	isValidPassword: jest.fn(),
}))

jest.mock('@utils/auth/token', () => ({
	generateTokens: jest.fn(() => ['access', 'refresh']),
}))

const req = {
	t: jest.fn(),
} as unknown as Request

const res = {
	status: jest.fn(() => res),
	json: jest.fn(),
	setHeader: jest.fn(),
	cookie: jest.fn(),
} as unknown as Response

const testInvalidInput = (email: boolean, password: boolean, name: string) => {
	const isValidEmailMock = isValidEmail as jest.Mock
	const isValidPasswordMock = isValidPassword as jest.Mock
	const reqTMock = req.t as unknown as jest.Mock

	reqTMock.mockReturnValue('inputsInvalid')
	isValidEmailMock.mockReturnValue(false)
	isValidPasswordMock.mockReturnValue(true)

	isDataValid(req, res, 'email', 'password', 'name')

	expect(res.status).toHaveBeenCalledWith(400)
	expect(res.json).toHaveBeenCalledWith({ error: 'inputsInvalid' })
}

describe('registerFunctions', () => {
	describe('isDataValid', () => {
		it('should return 400 and error message if email is invalid', () => {
			testInvalidInput(false, true, 'name')
		})

		it('should return 400 and error message if password is invalid', () => {
			testInvalidInput(true, false, 'name')
		})

		it('should return 400 and error message if name is empty', () => {
			testInvalidInput(true, true, '')
		})

		it('should do nothing when inputs are correct', () => {
			const isValidEmailMock = isValidEmail as jest.Mock
			const isValidPasswordMock = isValidPassword as jest.Mock
			const reqTMock = req.t as unknown as jest.Mock

			reqTMock.mockReturnValue('inputsInvalid')
			isValidEmailMock.mockReturnValue(true)
			isValidPasswordMock.mockReturnValue(true)

			isDataValid(req, res, 'email', 'password', 'name')

			expect(res.status).not.toHaveBeenCalled()
			expect(res.json).not.toHaveBeenCalled()
		})
	})

	describe('isEmailTaken', () => {
		it('should return 409 status and a error message when email is taken', async () => {
			const reqTMock = req.t as unknown as jest.Mock
			reqTMock.mockReturnValue('emailIsTaken')

			prismaMock.user.findFirst.mockResolvedValue({
				email: 'test@example.com',
				password: 'password123',
				id: '123123123213',
				name: 'name',
			})

			await isEmailTaken(req, res, 'test@example.com')

			expect(res.status).toHaveBeenCalledWith(409)
			expect(res.json).toHaveBeenCalledWith({ error: 'emailIsTaken' })
		})

		it('should do nothing when email is unique', async () => {
			const reqTMock = req.t as unknown as jest.Mock
			reqTMock.mockReturnValue('emailIsTaken')

			prismaMock.user.findFirst.mockResolvedValue(null)

			await isEmailTaken(req, res, 'test@example.com')

			expect(res.status).not.toHaveBeenCalled()
			expect(res.json).not.toHaveBeenCalled()
		})
	})

	describe('addTokensToResponse', () => {
		it('Access and refresh tokens are added', () => {
			const user = {
				id: '123',
				name: 'name',
				email: 'email',
				password: 'password',
			}

			addTokensToResponse(res, user)

			expect(generateTokens).toHaveBeenCalledWith(user)
			expect(res.setHeader).toHaveBeenCalledWith(
				'Authorization',
				'Bearer access'
			)
			expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh', {
				httpOnly: true,
				secure: true,
				sameSite: true,
			})
		})
	})
})
