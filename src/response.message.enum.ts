export enum ResponseMessage {
	SUCCESS = '성공',
	BAD_REQUEST = '잘못된 요청입니다.',
	DATA_NOT_FOUND = '데이터가 존재하지 않습니다.',
	ETC = '기타 에러 발생',
	INTERNAL_SERVER_ERROR = '내부 서버 오류. 관리자에게 문의하세요',

	// Auth
	ALREADY_REGISTERED_USER = '이미 가입된 유저입니다.',
	NOT_REGISTERED_USER = '존재하지 않는 계정입니다.',
	UNAUTHORIZED_USER = '권한이 없습니다.',

	EXPIRED_VERIFICATION_CODE = '만료된 인증코드입니다.',
	ALREADY_VERIFIED_EMAIL = '이미 인증된 이메일입니다.',
	NOT_VERIFIED_EMAIL = '인증되지 않은 이메일입니다.',
	MAILER_ERROR = '메일 발송에 실패했습니다.',

	WRONG_EMAIL_OR_PASSWORD = '잘못된 이메일 또는 비밀번호 입니다.',

	// Profile
	PROFILE_NOT_EXIST = '프로필이 존재하지 않습니다.',
	ALREADY_EXIST_NICKNAME = '이미 존재하는 닉네임입니다.',
	ALREADY_USER_PROFILE_EXIST = '이미 유저의 프로필이 존재합니다.',

	//Commons
	UPLOAD_FILE_LIST_IS_EMPTY = '업로드 하려는 파일이 없습니다.',
	NOT_UPLOADED_FILE = '업로드 된 파일이 아닙니다.',
	IS_NOT_IMAGE_FILE = '이미지 파일이 아닙니다.',
	ALREADY_EXIST_GENRE = '이미 존재하는 장르입니다.',
	NOT_REGISTERED_GENRE = '존재하지 않는 장르입니다.',
}
