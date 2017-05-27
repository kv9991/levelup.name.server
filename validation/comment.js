module.exports = function(inputs) {
	var errors = []
	console.log(inputs)
	if (!inputs.commentContent) {
		errors.push('Не заполнено поле "Комментарий"')
	}

	if (errors.length > 0) {
		return {
			success: false,
			errors: errors
		}
	} else {
		return {
			success: true
		}
	}

}
