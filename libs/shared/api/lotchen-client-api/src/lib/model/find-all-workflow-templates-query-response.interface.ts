import { WorkflowTriggerDto } from './workflow-trigger-dto.interface';
import { WorkflowNodeDto } from './workflow-node-dto.interface';
import { WorkflowEdgeDto } from './workflow-edge-dto.interface';

export interface FindAllWorkflowTemplatesQueryResponse {
  _id: string;
  name: string;
  description: string;
  status: string;
  version: number;
  trigger: WorkflowTriggerDto;
  nodes: WorkflowNodeDto[];
  edges: WorkflowEdgeDto[];
  assignedToEntityType?: string;
  assignedToEntityId?: string;
  createdAt: string;
  updatedAt: string;
}
