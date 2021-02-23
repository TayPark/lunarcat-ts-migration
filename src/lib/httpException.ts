class HttpException extends Error {
  public statusCode: number;
  public message: string;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
  }

  getStatusCode() {
    return this.statusCode;
  }

  getMessage() {
    return this.message;
  }
}

export default HttpException;
