export const isValidPassword = (password: string) => {
	if (!password) return false

	const passwordRegex =
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{}\\|'"`;:,./<>?])[A-Za-z\d!@#$%^&*()_\-+=\[\]{}\\|'"`;:,./<>?]{8,16}$/

	return passwordRegex.test(password)
}

export const isValidEmail = (email: string) => {
	if (!email) return false

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

	return emailRegex.test(email)
}
