module.exports = {
	add: function(inputs) {
		var errors = []
		if (!inputs.slug) {
			errors.push('Не заполнено поле "Системное имя"')
		}

		if (!inputs.postTitle.value) {
			errors.push('Не заполнено поле "Заголовок"')
		}

		if (!inputs.postDescription.value) {
			errors.push('Не заполнено поле "Превью-контент"')
		}

		if (!inputs.postContent.value) {
			errors.push('Не заполнено поле "Контент"')
		}

		if (!inputs.postContent.value) {
			errors.push('Не заполнено поле "Теги"')
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