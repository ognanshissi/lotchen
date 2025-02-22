import mongoose from 'mongoose';

export const WithSchemaMiddleware = (schema: mongoose.Schema) => {
  schema.pre('find', function () {
    this.where({ deletedAt: null });
  });

  schema.pre('findOne', function () {
    this.where({ deleteAt: null });
  });

  return schema;
};
