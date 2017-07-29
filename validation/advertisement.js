module.exports = {
	create: function(data) {
		var errors = [];

		// Правила регистрации пользователя
		if (!data.title) { errors.push('Не заполнено поле "Заголовок"') }
		if (!data.description) { errors.push('Не заполнено поле "Текст"') }
		if (!data.link) { errors.push('Не заполнено поле "Ссылка"') }
		if (!data.displayLink) { errors.push('Не заполнено поле "Отображаемая ссылка"') }

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
