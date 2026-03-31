import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  CurrentUserProvider,
  RequestExtendedWithUser,
} from '@lotchen/api/core';
import { REQUEST } from '@nestjs/core';
import { CaptureConfigDocument } from './capture-config.schema';
import { CAPTURE_CONFIG_MODEL } from './capture-config.model-token';
import { ContactDocument } from '../../contacts/contact.schema';
import { CONTACT_MODEL, USER_MODEL } from '../../contacts/contact.provider';
import { UserDocument } from '@lotchen/lotchen-api/identity-provider';

@Injectable()
export class CaptureConfigProvider extends CurrentUserProvider {
  constructor(
    @Inject(CAPTURE_CONFIG_MODEL)
    public readonly CaptureConfigModel: Model<CaptureConfigDocument>,
    @Inject(CONTACT_MODEL)
    public readonly ContactModel: Model<ContactDocument>,
    @Inject(USER_MODEL)
    public readonly UserModel: Model<UserDocument>,
    @Inject(REQUEST)
    public override readonly request: RequestExtendedWithUser
  ) {
    super(request);
  }
}
