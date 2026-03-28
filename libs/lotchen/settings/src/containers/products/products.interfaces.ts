export interface ProductResponse {
  id: string;
  name: string;
  type: string;
  status: string;
  environment: string;
  description?: string;
  interestRate?: number;
  duration?: number;
  insuranceType?: string;
  coverage?: string;
  deductible?: number;
  testRunCount: number;
  promotedAt?: string;
  promotedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyResponse {
  id: string;
  policyNumber: string;
  productId: string;
  contactId: string;
  status: string;
  startDate?: string;
  endDate?: string;
  premiumAmount?: number;
  paymentFrequency?: string;
  renewalDate?: string;
  createdAt: string;
  updatedAt: string;
}
