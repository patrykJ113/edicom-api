import app from '@src/app'
import https from 'https'
import fs from 'fs'
import path from 'path'

const key = fs.readFileSync(path.resolve(__dirname, '../key.pem'))
const cert = fs.readFileSync(path.resolve(__dirname, '../cert.pem'))

const httpsOptions = { key, cert }

https.createServer(httpsOptions, app).listen(4000, () => {
	console.log('Dev server running at https://localhost')
})
