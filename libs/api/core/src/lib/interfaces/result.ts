import { ApplicationError } from './error';

export class Result {
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

  public static success(): Result {
    return new Result(true, ApplicationError.none());
  }

  public static failure(error: ApplicationError): Result {
    return new Result(false, error);
  }
}
