export class InvalidEmailError extends Error {
  constructor(message = 'Invalid email format') {
    super(message);
    this.name = 'InvalidEmailError';
  }
}