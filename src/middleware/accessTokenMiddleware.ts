import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export const accessTokenMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const bearerToken = req.headers.authorization
		const accessToken = bearerToken?.slice(7)

		if (accessToken) {
			const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || ''
			jwt.verify(accessToken, accessTokenSecret)
			req.hasValidAccessToken = true
			return next()
		} else {
			return next()
		}
	} catch (error) {
		next()
	}
}
