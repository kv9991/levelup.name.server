module.exports = {
	signup: function(data) {
		var errors = [];

		// Правила регистрации пользователя
		if (!data.login) { errors.push('Не заполнено поле "Логин"') }
		if (!data.fullName) { errors.push('Не заполнено поле "Полное имя"') }
		if (!data.email) { errors.push('Не заполнено поле "E-mail"') }
		if (!data.password) { errors.push('Не заполнено поле "Пароль"') }
		if (data.password != data.passwordRepeat) { errors.push('Не совпадают пароли') }

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
