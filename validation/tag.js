module.exports = {
	add: function(inputs) {
		var errors = []
		if (!inputs.slug) {
			errors.push('Не заполнено поле "Системное имя"')
		}

		if (!inputs.tagTitle) {
			errors.push('Не заполнено поле "Заголовок"')
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
}