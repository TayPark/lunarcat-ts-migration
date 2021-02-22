import HttpException from './httpException';

// 400
export class BadRequestException extends HttpException {
  /**
   * @example
   * `throw new BadRequestException()`
   *
   * @description
   * The server could not understand the request due to invalid syntax.
   */
  constructor(message: string = 'BadRequest', statusCode: number = 401) {
    super(message, statusCode);
  }
}

// 401
export class UnauthorizedException extends HttpException {
  /**
   * @example
   * `throw new UnauthorizedException()`
   *
   * @description
   * Although the HTTP standard specifies "unauthorized", semantically this response means
   * "unauthenticated". That is, the client must authenticate itself to get the requested response.
   */
  constructor(message: string = 'Unauthorized', statusCode: number = 401) {
    super(message, statusCode);
  }
}

// 403
export class ForbiddenException extends HttpException {
  /**
   * @example
   * `throw new ForbiddenException()`
   *
   * @description
   * The client does not have access rights to the content;
   * that is, it is unauthorized, so the server is refusing to give the requested resource.
   * Unlike 401, the client's identity is known to the server.
   */
  constructor(message: string = 'Forbidden', statusCode: number = 403) {
    super(message, statusCode);
  }
}

// 404
export class NotFoundException extends HttpException {
  /**
   * @example
   * `throw new NotFoundException()`
   *
   * @description
   * In an API, this can also mean that the endpoint is valid but the resource itself
   * does not exist. Servers may also send this response instead of 403
   * to hide the existence of a resource from an unauthorized client.
   */
  constructor(message: string = 'Forbidden', statusCode: number = 404) {
    super(message, statusCode);
  }
}

// 405
export class MethodNotAllowedException extends HttpException {
  /**
   * @example
   * `throw new MethodNotAllowedException()`
   *
   * @description
   * The request method is known by the server but has been disabled and cannot be used.
   */
  constructor(message: string = 'MethodNotAllowed', statusCode: number = 405) {
    super(message, statusCode);
  }
}
