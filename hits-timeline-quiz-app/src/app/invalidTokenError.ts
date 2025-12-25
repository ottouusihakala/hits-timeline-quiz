export class InvalidTokenError implements Error {
  static errorType = 'InvalidTokenError';
  name = 'InvalidTokenError';
  message: string;

  constructor(message: string) {
    this.message = message;
  }

  static isInvalidTokenError(error: unknown): error is InvalidTokenError {
    return (error as Error).name === InvalidTokenError.errorType;
  }
}