export default class InvalidInputsError extends Error {
	statusCode: number

	constructor(message: string) {
		super(message)
		this.statusCode = 400
	}
}
