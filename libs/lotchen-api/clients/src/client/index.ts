import { CreateClientCommandHandler } from './create/create-client.command';
import { FindAllClientsQueryHandler } from './find-all/find-all-clients.query';
import { FindClientByIdQueryHandler } from './find-by-id/find-client-by-id.query';
import { UpdateClientCommandHandler } from './update/update-client.command';
import { DeleteClientCommandHandler } from './delete/delete-client.command';
import { ClientConversionListener } from './listeners/client-conversion.listener';

export const clientHandlers = [
  CreateClientCommandHandler,
  FindAllClientsQueryHandler,
  FindClientByIdQueryHandler,
  UpdateClientCommandHandler,
  DeleteClientCommandHandler,
  ClientConversionListener,
];

export { ClientController } from './client.controller';
