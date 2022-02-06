export class ResponseDto {
  status: number;
  message: string;
  data: object;

  constructor(status: number, message:string, data: object) {
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
}