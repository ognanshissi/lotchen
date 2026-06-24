export enum DispatchRuleStatus {
  Draft = 'draft',
  Active = 'active',
  Inactive = 'inactive',
}

export enum DispatchObjectType {
  Lead = 'lead',
  Case = 'case',
  Ticket = 'ticket',
  ServiceRequest = 'service_request',
}

export enum RoutingMethod {
  RoundRobin = 'round_robin',
  LeastLoaded = 'least_loaded',
  SkillBased = 'skill_based',
  TerritoryBased = 'territory_based',
  FirstAvailable = 'first_available',
  CustomScore = 'custom_score',
}

export enum AssignmentTargetType {
  Agent = 'agent',
  Team = 'team',
  Queue = 'queue',
  Department = 'department',
}

export enum ConditionOperator {
  Eq = 'eq',
  Neq = 'neq',
  Gt = 'gt',
  Lt = 'lt',
  Contains = 'contains',
  NotContains = 'not_contains',
}

export enum LogicalOperator {
  And = 'AND',
  Or = 'OR',
}
