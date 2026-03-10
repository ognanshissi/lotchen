import { CommandHandler } from '@lotchen/api/core';
import { Injectable, Logger } from '@nestjs/common';
import { ActivitiesProvider } from '../../activities.provider';

const SYSTEM_EVENT_TYPES = [
  {
    name: 'Réunion',
    icon: 'feather:users',
    color: '#6366f1',
    defaultDurationMinutes: 60,
  },
  {
    name: 'Appel',
    icon: 'feather:phone',
    color: '#10b981',
    defaultDurationMinutes: 15,
  },
  {
    name: 'Démo',
    icon: 'feather:monitor',
    color: '#f59e0b',
    defaultDurationMinutes: 45,
  },
  {
    name: 'Suivi',
    icon: 'feather:refresh-cw',
    color: '#8b5cf6',
    defaultDurationMinutes: 30,
  },
  {
    name: 'Visite',
    icon: 'feather:map-pin',
    color: '#ef4444',
    defaultDurationMinutes: 60,
  },
];

@Injectable()
export class SeedEventTypesCommandHandler
  implements CommandHandler<void, void>
{
  private readonly _logger = new Logger(SeedEventTypesCommandHandler.name);

  constructor(private readonly _activitiesProvider: ActivitiesProvider) {}

  public async handlerAsync(): Promise<void> {
    for (const defaults of SYSTEM_EVENT_TYPES) {
      const existing = await this._activitiesProvider.EventTypeModel.findOne({
        name: defaults.name,
        isSystem: true,
        deletedAt: null,
      }).exec();

      if (!existing) {
        const eventType = new this._activitiesProvider.EventTypeModel({
          ...defaults,
          isSystem: true,
          isActive: true,
          requiredFields: [],
          createdBy: this._activitiesProvider.user()?.userId,
          createdByInfo: this._activitiesProvider.user(),
        });
        await eventType.save();
        this._logger.log(`Seeded event type: ${defaults.name}`);
      }
    }
  }
}
