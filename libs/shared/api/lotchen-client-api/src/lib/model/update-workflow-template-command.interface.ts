import { WorkflowTriggerDto } from './workflow-trigger-dto.interface';
import { WorkflowNodeDto } from './workflow-node-dto.interface';
import { WorkflowEdgeDto } from './workflow-edge-dto.interface';

export interface UpdateWorkflowTemplateCommand {
  name?: string;
  description?: string;
  trigger?: WorkflowTriggerDto;
  nodes?: WorkflowNodeDto[];
  edges?: WorkflowEdgeDto[];
  assignedToEntityType?: string;
  assignedToEntityId?: string;
}
