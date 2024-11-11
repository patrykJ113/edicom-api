import request from 'supertest'
import app from '@/app'
import bcrypt from 'bcrypt'
import { prismaMock } from '@root/singleton'

describe('Auth Endpoints', () => {
	describe.only('POST /auth/login', () => {
		const email = 'test@example.com'
		const password = 'password123'
		const id = '123123123213'
		const name = 'name'

		it('should return 200 for a successful login', async () => {
			const hashedPassword = await bcrypt.hash(password, 10)

			prismaMock.user.findFirst.mockResolvedValue({
				id,
				email,
				name,
				password: hashedPassword,
			})

			const response = await request(app)
				.post('/auth/login')
				.send({ email, password })

			expect(response.status).toBe(200)
			expect(response.body).toEqual({ message: 'Login successful' })
		})
	})
})
