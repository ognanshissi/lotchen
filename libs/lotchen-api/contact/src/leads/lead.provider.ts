import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  CurrentUserProvider,
  RequestExtendedWithUser,
} from '@lotchen/api/core';
import { REQUEST } from '@nestjs/core';
import { ContactDocument } from '../contacts/contact.schema';
import { CONTACT_MODEL, USER_MODEL } from '../contacts/contact.provider';
import { UserDocument } from '@lotchen/lotchen-api/identity-provider';
import { CaptureConfigDocument } from './capture-config/capture-config.schema';
import { CAPTURE_CONFIG_MODEL } from './capture-config/capture-config.model-token';

@Injectable()
export class LeadProvider extends CurrentUserProvider {
  constructor(
    @Inject(CONTACT_MODEL)
    public readonly ContactModel: Model<ContactDocument>,
    @Inject(USER_MODEL) public readonly UserModel: Model<UserDocument>,
    @Inject(CAPTURE_CONFIG_MODEL)
    public readonly CaptureConfigModel: Model<CaptureConfigDocument>,
    @Inject(REQUEST) public override readonly request: RequestExtendedWithUser
  ) {
    super(request);
  }
}
