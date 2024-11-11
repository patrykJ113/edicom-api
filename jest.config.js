/** @type {import('jest').Config} */

const config = {
	clearMocks: true,
	testEnvironment: 'node',
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['**/__tests__/**/*.test.ts'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
		'^@utils/(.*)$': '<rootDir>/src/utils/$1',
		'^@routes/(.*)$': '<rootDir>/src/routes/$1',
	},
}

module.exports = config
