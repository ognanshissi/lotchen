export const tenantConnectionString = (tenantFqdn: string): string => {
  return `lotchen_${tenantFqdn}`;
};
