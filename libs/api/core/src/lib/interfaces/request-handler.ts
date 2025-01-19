import { Request } from 'express';

export abstract class RequestHandler<RequestType, ResponseType> {
  public abstract handlerAsync(
    request?: RequestType,
    req?: Request
  ): Promise<ResponseType>;
}

export abstract class CommandHandler<CommandType, ResponseType> {
  public abstract handlerAsync(
    command: CommandType,
    req?: Request
  ): Promise<ResponseType>;
}

export abstract class QueryHandler<QueryType, ResponseType> {
  public abstract handlerAsync(
    query?: QueryType,
    req?: Request
  ): Promise<ResponseType>;
}
