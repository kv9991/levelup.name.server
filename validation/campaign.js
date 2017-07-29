module.exports = {
	create: function(data) {
		var errors = [];

		// Правила регистрации пользователя
		if (!data.title) { errors.push('Не заполнено поле "Название"') }

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
