// 400
export class BadRequestException extends Error {
  /**
   * @example
   * `throw new BadRequestException()`
   *
   * @description
   * The server could not understand the request due to invalid syntax.
   */
  message: string;
  status: number = 400;
  constructor(message: string = 'BadRequest') {
    super(message);
    this.message = message;
  }
}

// 401
export class UnauthorizedException extends Error {
  /**
   * @example
   * `throw new UnauthorizedException()`
   *
   * @description
   * Although the HTTP standard specifies "unauthorized", semantically this response means
   * "unauthenticated". That is, the client must authenticate itself to get the requested response.
   */
  message: string;
  status: number = 401;
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.message = message;
  }
}

// 403
export class ForbiddenException extends Error {
  /**
   * @example
   * `throw new ForbiddenException()`
   *
   * @description
   * The client does not have access rights to the content;
   * that is, it is unauthorized, so the server is refusing to give the requested resource.
   * Unlike 401, the client's identity is known to the server.
   */
  message: string;
  status: number = 403;
  constructor(message: string = 'Forbidden') {
    super(message);
    this.message = message;
  }
}

// 404
export class NotFoundException extends Error {
  /**
   * @example
   * `throw new NotFoundException()`
   *
   * @description
   * In an API, this can also mean that the endpoint is valid but the resource itself
   * does not exist. Servers may also send this response instead of 403
   * to hide the existence of a resource from an unauthorized client.
   */
  message: string;
  status: number = 404;
  constructor(message: string = 'NotFound') {
    super(message);
    this.message = message;
  }
}

// 405
// export class MethodNotAllowedException extends Error {
//   /**
//    * @example
//    * `throw new MethodNotAllowedException()`
//    *
//    * @description
//    * The request method is known by the server but has been disabled and cannot be used.
//    */
//   constructor(message: string = 'MethodNotAllowed', status: number = 405) {
//     super(message);
//     this.status = status;
//   }
// }
