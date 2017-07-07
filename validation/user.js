module.exports = {
	signup: function(data) {
		var errors = [];

		// Правила регистрации пользователя
		if (!data.userLogin) { errors.push('Не заполнено поле "Логин"') }
		if (!data.userName) { errors.push('Не заполнено поле "Полное имя"') }
		if (!data.userEmail) { errors.push('Не заполнено поле "E-mail"') }
		if (!data.userPassword) { errors.push('Не заполнено поле "Пароль"') }
		if (data.userPassword != data.userPasswordRepeat) { errors.push('Не совпадают пароли') }

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
