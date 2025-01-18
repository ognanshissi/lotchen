export abstract class RequestHandler<RequestType, ResponseType> {
  public abstract handlerAsync(request?: RequestType): Promise<ResponseType>;
}
