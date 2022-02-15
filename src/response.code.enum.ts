export enum ResponseCode {
	SUCCESS = 'SUCCESS',
	DATA_NOT_FOUND = 'DATA_NOT_FOUND',
	ETC = 'ETC',
	INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',

	ALREADY_REGISTERED_USER = 'ALREADY_REGISTERED_USER',
	NOT_REGISTERED_USER = 'NOT_REGISTERED_USER',

	ALREADY_VERIFIED_USER = 'ALREADY_VERIFIED_ACCOUNT',
	WRONG_EMAIL_OR_PASSWORD = 'WRONG_EMAIL_OR_PASSWORD',

	NOT_VERIFIED_EMAIL = 'NOT_VERIFIED_EMAIL',

	MAILER_ERROR = 'MAILER_ERROR',
}
