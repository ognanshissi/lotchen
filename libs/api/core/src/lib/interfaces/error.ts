export class ApplicationError {
  constructor(public code: string, public description: string) {}

  public static none(): ApplicationError {
    return new ApplicationError('', '');
  }
}
