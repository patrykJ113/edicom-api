import express from 'express'
import cors from 'cors'
import authRouter from '@routes/auth'
import i18next from '@/i18n'
import httpMiddleware from 'i18next-http-middleware' 

const app = express()

app.use(express.json())
app.use(
	cors({
		origin: 'http://localhost:3000',
	})
)
app.use(httpMiddleware.handle(i18next))

app.get('/', (req, res) => {
	res.send('hello')
})

app.use('/auth', authRouter)

app.use((req, res) => {
	res.status(404).json({ message: 'Not Found' })
})

app.listen(4000)
