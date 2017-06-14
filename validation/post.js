module.exports = {
	add: function(inputs) {
		var errors = []
		if(inputs.postType == 'post') {
			if (!inputs.slug) {
				errors.push('Не заполнено поле "Системное имя"')
			}

			if (!inputs.postTitle) {
				errors.push('Не заполнено поле "Заголовок"')
			}

			/* if (!inputs.postDescription) {
				errors.push('Не заполнено поле "Превью-контент"')
			}

			if (!inputs.postContent) {
				errors.push('Не заполнено поле "Контент"')
			}

			if (!inputs.postContent) {
				errors.push('Не заполнено поле "Теги"')
			} */
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