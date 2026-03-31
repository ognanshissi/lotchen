import { FindAllFormsQueryHandler } from './find-all/find-all-forms.query';
import { FindFormByIdQueryHandler } from './find-by-id/find-form-by-id.query';
import { CreateFormCommandHandler } from './create/create-form.command';
import { UpdateFormCommandHandler } from './update/update-form.command';
import { AddFieldCommandHandler } from './add-field/add-field.command';
import { UpdateFieldCommandHandler } from './update-field/update-field.command';
import { RemoveFieldCommandHandler } from './remove-field/remove-field.command';
import { ReorderFieldsCommandHandler } from './reorder-fields/reorder-fields.command';
import { FindByClassNameQueryHandler } from './find-by-class-name/find-by-class-name.query';

export const formHandlers = [
  FindAllFormsQueryHandler,
  FindFormByIdQueryHandler,
  CreateFormCommandHandler,
  UpdateFormCommandHandler,
  AddFieldCommandHandler,
  UpdateFieldCommandHandler,
  RemoveFieldCommandHandler,
  ReorderFieldsCommandHandler,
  FindByClassNameQueryHandler,
];

export { FormController } from './form.controller';
