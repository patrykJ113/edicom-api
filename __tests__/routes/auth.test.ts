import request from 'supertest'
import app from '@/app'
import bcrypt from 'bcryptjs'
import { prismaMock } from '@root/singleton'
import { Response } from 'supertest'

jest.mock('@utils/auth/token', () => ({
	setTokens: jest.fn(),
}))

const isInputInvalid = (response: Response) => {
	expect(response.status).toBe(400)
	expect(response.body).toEqual({
		error: 'Password, email, or name does not meet requirements',
	})
}

describe('Auth Endpoints', () => {
	describe('POST /auth/login', () => {
		const data = {
			email: 'test@example.com',
			password: 'password123',
			id: '123123123213',
			name: 'name',
			refresh_token: '',
		}

		it('should return 200 with a message for a successful login', async () => {
			const hashedPassword = await bcrypt.hash(data.password, 10)

			prismaMock.user.findFirstOrThrow.mockResolvedValue({
				...data,
				password: hashedPassword,
			})

			const response = await request(app)
				.post('/auth/login')
				.send({ email: data.email, password: data.password })

			expect(response.status).toBe(200)
			expect(response.body).toEqual({ message: 'Login successful' })
		})

		it("should return 404 with an error message for when the user doesn't exist", async () => {
			prismaMock.user.findFirst.mockResolvedValue(null)

			const response = await request(app)
				.post('/auth/login')
				.send({ email: data.email, password: data.password })

			expect(response.status).toBe(404)
			expect(response.body).toEqual({ error: 'Invalid credentials' })
		})

		it('should return 400 with an error message for when the password is incorrect', async () => {
			const hashedPassword = await bcrypt.hash('other password', 10)

			prismaMock.user.findFirstOrThrow.mockResolvedValue({
				...data,
				password: hashedPassword,
			})

			const response = await request(app)
				.post('/auth/login')
				.send({ email: data.email, password: data.password })

			expect(response.status).toBe(400)
			expect(response.body).toEqual({ error: 'Invalid credentials' })
		})

		it('should execute the catch block and return status 500 with an error message', async () => {
			prismaMock.user.findFirstOrThrow.mockImplementation(() => {
				throw new Error('Database error')
			})

			const response = await request(app)
				.post('/auth/login')
				.send({ email: data.email, password: data.password })

			expect(response.status).toBe(500)
			expect(response.body).toEqual({
				error: 'Something went wrong when Login in on our side',
			})
		})
	})

	describe('Post auth/register', () => {
		const data = {
			email: 'test@example.com',
			password: 'password123W@',
			name: 'name',
			id: 'as123asd123123',
			refresh_token: '',
		}

		it('should return 201 with a message for a successful registration', async () => {
			process.env.ACCESS_TOKEN_SECRET = 'mocked-secret'
			const hashedPassword = await bcrypt.hash(data.password, 10)

			prismaMock.user.findFirst.mockResolvedValue(null)
			prismaMock.user.create.mockResolvedValue({
				...data,
				password: hashedPassword,
				refresh_token: '',
			})

			prismaMock.user.update.mockResolvedValue({
				...data,
				password: hashedPassword,
			})

			const response = await request(app).post('/auth/register').send(data)

			expect(response.status).toBe(201)
			expect(response.body).toEqual({
				message: 'User registered successfully',
			})
		})

		it('should return 400 with error message when name is empty', async () => {
			const response = await request(app)
				.post('/auth/register')
				.send({
					...data,
					name: '',
				})

			isInputInvalid(response)
		})

		it('should return 400 with error message when password is empty', async () => {
			const response = await request(app)
				.post('/auth/register')
				.send({
					...data,
					password: '',
				})

			isInputInvalid(response)
		})

		it('should return 400 with error message when email is empty', async () => {
			const response = await request(app)
				.post('/auth/register')
				.send({
					...data,
					email: '',
				})

			isInputInvalid(response)
		})

		it('should return 400 with error message when password is invalid', async () => {
			const response = await request(app)
				.post('/auth/register')
				.send({
					...data,
					password: 'password',
				})

			isInputInvalid(response)
		})

		it('should return 409 with error message when email is invalid', async () => {
			const response = await request(app)
				.post('/auth/register')
				.send({
					...data,
					email: 'email',
				})
			isInputInvalid(response)
		})

		it('should return 409 with error message when email is taken', async () => {
			prismaMock.user.findFirst.mockResolvedValue({
				...data,
				id: 'asd!23asd123',
			})

			const response = await request(app)
				.post('/auth/register')
				.send({
					...data,
				})

			expect(response.status).toBe(409)
			expect(response.body).toEqual({
				error:
					"The email you've entered is already taken. Please enter a new email address or try logging in",
			})
		})

		it('should execute the catch block and return status 500 with an error message', async () => {
			const consoleErrorSpy = jest
				.spyOn(console, 'error')
				.mockImplementation(() => {})

			prismaMock.user.findFirst.mockImplementation(() => {
				throw new Error('Database error')
			})

			const response = await request(app).post('/auth/register').send(data)

			expect(response.status).toBe(500)
			expect(response.body).toEqual({
				error: 'Something went wrong when creating a user on our side',
			})

			consoleErrorSpy.mockRestore()
		})
	})
})
