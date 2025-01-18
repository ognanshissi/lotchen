import { ApplicationError } from './error';

export class Result<T> {
  private constructor(isSuccess: boolean, error: ApplicationError) {
    if (
      (isSuccess && error != ApplicationError.none()) ||
      (!isSuccess && error === ApplicationError.none())
    ) {
      throw new Error('Argument exception');
    }

    this.isSuccess = isSuccess;
    this.error = error;
  }

  public isSuccess!: boolean;

  public isFailure = !this.isSuccess;

  public error!: ApplicationError;

  public static success<T>(): Result<T> {
    return new Result<T>(true, ApplicationError.none());
  }

  public static failure<T>(error: ApplicationError): Result<T> {
    return new Result<T>(false, error);
  }
}
