export class AppError extends Error {
  //   statusCode: number;
  errors?: object;

  constructor(message = "An Unexpected Error Occurred", errors?: object) {
    super(message);
    this.errors = errors;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const wrap =
  <F extends (...args: never[]) => Promise<never>>(fn: F) =>
  (...args: Parameters<F>) =>
    fn(...args).catch(globalErrorHandler);

function globalErrorHandler(error: unknown) {
  if (error instanceof AppError) {
    throw error;
  }
  console.error("Unhandled Error:", error);
  throw new AppError("An Unexpected Error Occurred");
}
