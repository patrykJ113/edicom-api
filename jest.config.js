/** @type {import('jest').Config} */

const config = {
	clearMocks: true,
	testEnvironment: 'node',
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['**/__tests__/**/*.test.ts'],
	setupFilesAfterEnv: [
		'<rootDir>/singleton.ts',
		'<rootDir>/setup/jest.setup.ts',
	],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/$1',
		'^@src/(.*)$': '<rootDir>/src/$1',
		'^@utils/(.*)$': '<rootDir>/src/utils/$1',
		'^@routes/(.*)$': '<rootDir>/src/routes/$1',
		'^@errors/(.*)$': '<rootDir>/src/errors/$1',
		'^@app-types$': '<rootDir>/src/app-types.ts',
		'^@middleware/(.*)$': ['<rootDir>/src/middleware/$1'],
	},
}

module.exports = config
