module.exports = {
	add: function(inputs) {
		var errors = [];

		console.log(inputs)

		if (!inputs.slug) {
			errors.push('Не заполнено поле "Логин"')
		}

		if (!inputs.userName) {
			errors.push('Не заполнено поле "Полное имя"')
		}

		if (!inputs.userEmail) {
			errors.push('Не заполнено поле "E-mail"')
		}

		if (!inputs.userGender) {
			errors.push('Не заполнено поле "Пол"')
		}

		if (!inputs.userRole) {
			errors.push('Не заполнено поле "Роль"')
		}

		if (!inputs.userPassword) {
			errors.push('Не заполнено поле "Пароль"')
		}

		if (!inputs.userPasswordSecond) {
			errors.push('Не заполнено поле "Повторите пароль"')
		}

		if (inputs.userPasswordSecond != inputs.userPassword) {
			errors.push('Пароли не совпадают')
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
