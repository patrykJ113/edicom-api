import { isValidEmail, isValidPassword } from '@/src/utils/validate'
import { prismaMock } from '@/singleton'
import {
	isDataValid,
	isEmailTaken,
	handleRegisterErrors,
} from '@helpers/registerFunctions'
import InvalidInputsError from '@errors/InvalidInputsError'
import EmailIsTakenError from '@src/errors/EmailIsTakenError'
import { User } from '@prisma/client'

jest.mock('@utils/auth/validate', () => ({
	isValidEmail: jest.fn(),
	isValidPassword: jest.fn(),
}))

jest.mock('@utils/auth/token', () => ({
	generateTokens: jest.fn(() => ['access', 'refresh']),
}))

const testInvalidInput = (email: boolean, password: boolean, name: string) => {
	const isValidEmailMock = isValidEmail as jest.Mock
	const isValidPasswordMock = isValidPassword as jest.Mock
	const reqTMock = req.t as unknown as jest.Mock

	reqTMock.mockReturnValue('inputsInvalid')
	isValidEmailMock.mockReturnValue(email)
	isValidPasswordMock.mockReturnValue(password)

	expect(() => isDataValid(req, 'email', 'password', name)).toThrow(
		InvalidInputsError
	)
}

const testIfEmailIsTaken = async (user: User | null) => {
	const reqTMock = req.t as unknown as jest.Mock
	reqTMock.mockReturnValue('emailIsTaken')

	prismaMock.user.findFirst.mockResolvedValue(user)

	if (user) {
		await expect(isEmailTaken(req, 'test@example.com')).rejects.toThrow(
			EmailIsTakenError
		)
	} else {
		await expect(isEmailTaken(req, 'test@example.com')).resolves.not.toThrow()
	}
}

describe.only('registerFunctions', () => {
	describe('isDataValid', () => {
		it('Should throw a InvalidInputsError if email is invalid', () => {
			testInvalidInput(false, true, 'name')
		})

		it('Should throw a InvalidInputsError if password is invalid', () => {
			testInvalidInput(true, false, 'name')
		})

		it('Should throw a InvalidInputsError if name is empty', () => {
			testInvalidInput(true, true, '')
		})

		it('Should not throw Error when inputs are correct', () => {
			const isValidEmailMock = isValidEmail as jest.Mock
			const isValidPasswordMock = isValidPassword as jest.Mock
			const reqTMock = req.t as unknown as jest.Mock

			reqTMock.mockReturnValue('inputsInvalid')
			isValidEmailMock.mockReturnValue(true)
			isValidPasswordMock.mockReturnValue(true)

			expect(() => isDataValid(req, 'email', 'password', 'name')).not.toThrow(
				InvalidInputsError
			)
		})
	})

	describe('isEmailTaken', () => {
		it('Should throw EmailIsTakenError when email is taken', async () => {
			await testIfEmailIsTaken({
				email: 'test@example.com',
				password: 'password123',
				id: '123123123213',
				name: 'name',
				refresh_token: '',
			})
		})

		it('Should not throw Error when email is unique', async () => {
			await testIfEmailIsTaken(null)
		})
	})

	describe('handleRegisterErrors', () => {
		it('Returns 400 status and a error message when the InvalidInputsError is thrown', () => {
			const error = new InvalidInputsError('InvalidInputsError')
			handleRegisterErrors(req, res, error)

			expect(res.status).toHaveBeenCalledWith(400)
			expect(res.json).toHaveBeenCalledWith({ error: 'InvalidInputsError' })
		})

		it('Returns 409 status and a error message when the EmailIsTakenError is thrown', () => {
			const error = new EmailIsTakenError('EmailIsTakenError')
			handleRegisterErrors(req, res, error)

			expect(res.status).toHaveBeenCalledWith(409)
			expect(res.json).toHaveBeenCalledWith({ error: 'EmailIsTakenError' })
		})

		it('Returns 500 status and a error message when a normal Error is thrown', () => {
			const reqTMock = req.t as unknown as jest.Mock
			reqTMock.mockReturnValue('ServerError')

			const error = new Error('ServerError')
			handleRegisterErrors(req, res, error)

			expect(res.status).toHaveBeenCalledWith(500)
			expect(res.json).toHaveBeenCalledWith({ error: 'ServerError' })
		})
	})
})
