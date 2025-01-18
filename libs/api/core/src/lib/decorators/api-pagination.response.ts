import { applyDecorators, Type } from '@nestjs/common';
import { Pagination } from '../dto';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export const ApiPaginationResponse = <TModel extends Type<unknown>>(
  model: TModel
) => {
  return applyDecorators(
    ApiExtraModels(Pagination, model),
    ApiOkResponse({
      schema: {
        allOf: [
          {
            title: `PaginationResponseOf${model.name}`,
            $ref: getSchemaPath(Pagination),
          },
          {
            properties: {
              results: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    })
  );
};
