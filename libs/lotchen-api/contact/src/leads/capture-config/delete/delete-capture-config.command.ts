import { CommandHandler } from '@lotchen/api/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CaptureConfigProvider } from '../capture-config.provider';

export class DeleteCaptureConfigCommand {
  id!: string;
}

@Injectable()
export class DeleteCaptureConfigCommandHandler
  implements CommandHandler<DeleteCaptureConfigCommand, void>
{
  constructor(private readonly provider: CaptureConfigProvider) {}

  async handlerAsync(command: DeleteCaptureConfigCommand): Promise<void> {
    const config = await this.provider.CaptureConfigModel.findOne({
      _id: command.id,
      deletedAt: null,
    }).exec();

    if (!config) {
      throw new NotFoundException('Configuration de capture introuvable');
    }

    await this.provider.CaptureConfigModel.updateOne(
      { _id: command.id },
      { $set: { deletedAt: new Date() } }
    );
  }
}
