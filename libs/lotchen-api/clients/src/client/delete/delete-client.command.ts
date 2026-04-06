import { Injectable, NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@lotchen/api/core';
import { ClientsProvider } from '../../clients.provider';

export class DeleteClientCommand {
  id!: string;
}

@Injectable()
export class DeleteClientCommandHandler
  implements CommandHandler<DeleteClientCommand, void>
{
  constructor(private readonly clientsProvider: ClientsProvider) {}

  async handlerAsync(command: DeleteClientCommand): Promise<void> {
    const client = await this.clientsProvider.ClientModel.findOne({
      _id: command.id,
      deletedAt: null,
    });
    if (!client) throw new NotFoundException('Client introuvable');

    client.deletedAt = new Date();
    await client.save();
  }
}
