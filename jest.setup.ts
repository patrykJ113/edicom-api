import { Response, Request } from 'express'

jest.spyOn(console, 'log').mockImplementation(() => {})
jest.spyOn(console, 'error').mockImplementation(() => {})

global.res = {
	status: jest.fn(() => res),
	json: jest.fn(),
	setHeader: jest.fn(),
	cookie: jest.fn(),
} as unknown as Response

global.req = {
	t: jest.fn(),
} as unknown as Request