import mongoose from 'mongoose';
const mongooseEncryption = require('mongoose-encryption');

export const AddEncryptionPlugin = function (
  schema: mongoose.Schema,
  encryptedFields: string[]
) {
  return schema.plugin(mongooseEncryption, {
    secret: process.env['ENCRYPTION_KEY'],
    signinKey: process.env['ENCRYPTION_KEY'],
    encryptedFields,
  });
};
