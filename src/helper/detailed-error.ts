export class DetailedError extends Error {
  constructor(
    message: string,
    public issue?: any,
  ) {
    super(message);
  }
}
