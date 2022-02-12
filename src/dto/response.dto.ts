export class ResponseDto {
	status: number;
	message: string;
	data: object;
	error: boolean;
	code: string;

	constructor(status: number, message: string, data: object) {
		this.status = status;
		this.message = message;
		this.data = data;
	}

	setStatus(status: number): void {
		this.status = status;
	}

	setMessage(message: string): void {
		this.message = message;
	}

	setData(data: object): void {
		this.data = data;
	}

	setCode(code: string): void {
		this.code = code;
	}

	setError(error: boolean): void {
		this.error = error;
	}
}
