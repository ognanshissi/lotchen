export enum ProductType {
  Loan = 'loan',
  Savings = 'savings',
  Insurance = 'insurance',
}

export enum ProductStatus {
  Draft = 'draft',
  Active = 'active',
  Deprecated = 'deprecated',
}

export enum InsuranceType {
  Life = 'life',
  Health = 'health',
  Property = 'property',
}

export enum PolicyStatus {
  Quote = 'quote',
  Application = 'application',
  Underwriting = 'underwriting',
  Active = 'active',
  Renewal = 'renewal',
  Lapsed = 'lapsed',
}

export enum ClaimStatus {
  Open = 'open',
  InReview = 'in_review',
  Approved = 'approved',
  Denied = 'denied',
}

export enum Environment {
  Sandbox = 'sandbox',
  Production = 'production',
}

export enum PaymentFrequency {
  Monthly = 'monthly',
  Quarterly = 'quarterly',
  SemiAnnual = 'semi_annual',
  Annual = 'annual',
}
