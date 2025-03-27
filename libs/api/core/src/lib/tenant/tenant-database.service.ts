import { Injectable, Logger } from '@nestjs/common';
import { Connection, createConnection } from 'mongoose';
import { tenantConnectionString } from '../utils';

@Injectable()
export class TenantDatabaseService {
  private connections = new Map<string, Connection>();
  private readonly _logger = new Logger(TenantDatabaseService.name);

  public async getTenantDatabase(tenantId: string): Promise<Connection> {
    // ✅ Check if the connection already exists
    const hasPrevConnection = this.connections.get(tenantId);
    if (hasPrevConnection) {
      return hasPrevConnection;
    }

    // ✅ Create a new database connection for the tenant
    const connection = await createConnection(`${process.env['MONGO_URL']}`, {
      dbName: tenantConnectionString(tenantId),
    }).asPromise();

    this._logger.log(`Database connection created for tenant: ${tenantId}`);

    this.connections.set(tenantId, connection);
    return connection;
  }
}
