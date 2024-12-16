import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import httpMiddleware from 'i18next-http-middleware'
import path from 'path'

i18next
	.use(Backend)
	.use(httpMiddleware.LanguageDetector)
	.init({
		fallbackLng: 'en',
		supportedLngs: ['en', 'pl'],
		ns: ['errors'],
		defaultNS: 'errors',
		backend: {
			loadPath: path.join(__dirname, '/locales/{{lng}}/{{ns}}.json'),
		},
		detection: {
			order: ['querystring', 'header', 'cookie', 'session'],
			lookupQuerystring: 'lang',
		},
		debug: true,
	})

export default i18next
