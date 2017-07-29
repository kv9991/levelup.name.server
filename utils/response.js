export function error(errors, message) {
	return {
		success: false,
		message: message,
		errors: errors
	}
}

export function success(message, data) {
	return {
		success: true,
		message: message,
		...data
	}
}
