export class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.name = code;
    this.message = message;
  }
}
