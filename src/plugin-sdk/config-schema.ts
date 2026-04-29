/** Root TheClaw configuration Zod schema — the full `theclaw.json` shape. */
export { TheClawSchema } from "../config/zod-schema.js";
export { validateJsonSchemaValue } from "../plugins/schema-validator.js";
export type { JsonSchemaObject } from "../shared/json-schema.types.js";
