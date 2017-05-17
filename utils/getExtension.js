module.exports = function getExtension(type) {
    switch(type) {
    	case 'image/jpeg':
    	return '.jpg'
    	case 'image/png':
    	return '.png'
    	default:
    	return '.jpg'
    }
}