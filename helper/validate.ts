import Joi from "joi";

export const validate =
  <T = any>(schema: Joi.PartialSchemaMap<T>, options?: Joi.ValidationOptions) =>
  (data: T) =>
    Joi.object(schema).validate(data, options).error;
