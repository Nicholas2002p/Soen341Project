export class InvalidEmailError extends Error {
  constructor(message = 'The email address is not valid.') {
    super(message);
    this.name = 'InvalidEmailError';
  }
}