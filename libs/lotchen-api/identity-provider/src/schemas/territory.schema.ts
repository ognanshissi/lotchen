import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AuditableSchema, LanguageEnum } from '@lotchen/api/core';

@Schema({ collection: 'identity_territories', timestamps: true })
export class Territory extends AuditableSchema {
  @Prop({ type: String })
  name!: string;

  @Prop({
    type: String,
    default: LanguageEnum.FR,
    enum: LanguageEnum,
  })
  defaultLanguage!: LanguageEnum;
}

export const TerritorySchema = SchemaFactory.createForClass(Territory);
