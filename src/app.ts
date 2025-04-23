import express from 'express'
import cors from 'cors'
import authRouter from '@routes/auth'
import i18next from '@src/i18n'
import httpMiddleware from 'i18next-http-middleware'
import cookieParser from 'cookie-parser'
import { accessTokenMiddleware } from '@middleware/accessTokenMiddleware'
import { refreshTokenMiddleware } from '@middleware/refreshTokenMiddleware'

const app = express()

app.use(express.json())
app.use(
	cors({
		origin: 'https://localhost:3000',
		exposedHeaders: ['Authorization'],
		credentials: true,
	})
)
app.use(cookieParser())
app.use(httpMiddleware.handle(i18next))

app.get('/', accessTokenMiddleware, refreshTokenMiddleware, (req, res) => {
	res.send('Test: IT works !!!')
})

app.use('/auth', authRouter)

app.use((req, res) => {
	res.status(404).json({ message: 'Not Found' })
})

export default app
