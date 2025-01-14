export * from './health.service';
import { HealthApiService } from './health.service';
export * from './identity.service';
import { IdentityApiService } from './identity.service';
export * from './leads.service';
import { LeadsApiService } from './leads.service';
export * from './territories.service';
import { TerritoriesApiService } from './territories.service';
export const APIS = [HealthApiService, IdentityApiService, LeadsApiService, TerritoriesApiService];
