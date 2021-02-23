class HttpException extends Error {
  public message: string;
  public status: number = 500;

  constructor(message: string = 'Internal Server Error') {
    super(message);
    this.message = message;
  }
}

export default HttpException;
