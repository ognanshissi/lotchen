import { Inject, Injectable, Provider } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import {
  CurrentUserProvider,
  RequestExtendedWithUser,
} from '@lotchen/api/core';
import { REQUEST } from '@nestjs/core';
import {
  DispatchRule,
  DispatchRuleDocument,
  DispatchRuleSchema,
} from './dispatch-rule.schema';
import {
  DispatchAuditLog,
  DispatchAuditLogDocument,
  DispatchAuditLogSchema,
} from './audit/dispatch-audit.schema';

export const DISPATCH_RULE_MODEL = 'DISPATCH_RULE_MODEL';
export const DISPATCH_AUDIT_LOG_MODEL = 'DISPATCH_AUDIT_LOG_MODEL';

@Injectable()
export class DispatchingProvider extends CurrentUserProvider {
  constructor(
    @Inject(DISPATCH_RULE_MODEL)
    public readonly DispatchRuleModel: Model<DispatchRuleDocument>,
    @Inject(DISPATCH_AUDIT_LOG_MODEL)
    public readonly DispatchAuditLogModel: Model<DispatchAuditLogDocument>,
    @Inject(REQUEST) public override readonly request: RequestExtendedWithUser
  ) {
    super(request);
  }
}

export const dispatchingProviders: Provider[] = [
  {
    provide: DISPATCH_RULE_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(DispatchRule.name, DispatchRuleSchema);
    },
    inject: ['TENANT_CONNECTION'],
  },
  {
    provide: DISPATCH_AUDIT_LOG_MODEL,
    useFactory: async (tenantConnection: Connection) => {
      return tenantConnection.model(
        DispatchAuditLog.name,
        DispatchAuditLogSchema
      );
    },
    inject: ['TENANT_CONNECTION'],
  },
  DispatchingProvider,
];
