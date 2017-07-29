export function create(values) {
	var errors = []
	if (!values.slug) {
		errors.push('Не заполнено поле "Системное имя"')
	}
	if (!values.title) {
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