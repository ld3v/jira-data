import Joi from "joi";

export const validate =
  <T = any>(schema: Joi.PartialSchemaMap<T>, options?: Joi.ValidationOptions) =>
  (data: T) =>
    Joi.object(schema).validate(data, options).error;

// function isNumber(value) {
//   if (_.isString(value)) {
//     return !isNaN(Number(value));
//   }
//   return _.isNumber(value);
// }
