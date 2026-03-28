import { CreatePolicyCommandHandler } from './create/create-policy.command';
import { FindAllPoliciesQueryHandler } from './find-all/find-all-policies.query';
import { FindPolicyByIdQueryHandler } from './find-by-id/find-policy-by-id.query';
import { UpdatePolicyCommandHandler } from './update/update-policy.command';
import { AddClaimCommandHandler } from './add-claim/add-claim.command';
import { UpdateClaimCommandHandler } from './update-claim/update-claim.command';

export const policyHandlers = [
  CreatePolicyCommandHandler,
  FindAllPoliciesQueryHandler,
  FindPolicyByIdQueryHandler,
  UpdatePolicyCommandHandler,
  AddClaimCommandHandler,
  UpdateClaimCommandHandler,
];

export { PolicyController } from './policy.controller';
