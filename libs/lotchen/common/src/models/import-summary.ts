export interface ImportSummary {
  createdCount: number;
  skippedCount: number;
  errorCount: number;
  errors: { row: number; reason: string }[];
}
