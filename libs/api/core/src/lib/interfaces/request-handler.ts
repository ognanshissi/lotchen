import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

export abstract class RequestHandler<RequestType, ResponseType> {
  public abstract handlerAsync(
    request?: RequestType,
    req?: Request
  ): Promise<ResponseType> | Observable<ResponseType> | ResponseType;
}

export abstract class CommandHandler<CommandType, ResponseType> {
  public abstract handlerAsync(
    command: CommandType,
    req?: Request
  ): Promise<ResponseType> | Observable<ResponseType> | ResponseType;
}

export abstract class QueryHandler<QueryType, ResponseType> {
  public abstract handlerAsync(
    query?: QueryType,
    req?: Request
  ): Promise<ResponseType> | Observable<ResponseType> | ResponseType;
}

// Default Union Types for Handlers
export type UnauthorizedExceptionOrAny<T> = T | UnauthorizedException;
export type NotFoundExceptionOrAny<T> = T | NotFoundException;
export type BadRequestExceptionOrAny<T> = T | BadRequestException;
