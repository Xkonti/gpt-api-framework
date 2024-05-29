/**
 * @module
 * 
 * A module for simplifying the creation of APIs that are intended
 * to be used by custom GPTs.
 * 
 * You can follow the tutorial at
 * [xkonti.tech](https://xkonti.tech/blog/gpt-actions-with-val-town/) to
 * learn how to use this module on ValTown. There is also a
 * [ValTown version](https://www.val.town/v/xkonti/gptApiFramework) of this
 * module while ValTown is working on supporting type definitions from
 * JSR packages.
 * 
 * @example Basic usage example:
 * ```ts
 * import { GptApi } from "jsr:@xkonti/gpt-api-framework@0.0.1";
 * import { z } from "npm:zod";
 * 
 * const api = new GptApi({
 *   url: "https://theapi.web.val.run",
 *   title: "The API",
 *   description: "The API for a GPT to use",
 *   version: "1.0.0",
 *   policyGetter: async () => {
 *     return "This is a privacy policy";
 *   },
 * });
 * 
 * const RequestSchema = z.object({
 *   message: z.string().describe("A message to pass"),
 * }).describe("Data required by the action");
 * 
 * const ResponseSchema = z.object({
 *     message: z.string().describe("A response to the request message"),
 * }).describe("A result of the action");
 * 
 * api.jsonToJson({
 *   verb: "post",
 *   path: "/sendmessage",
 *   operationId: "sendmessage",
 *   desc: "Endpoint for submitting messages",
 *   requestSchema: RequestSchema,
 *   responseSchema: ResponseSchema,
 * }, async (ctx, input) => {
 *   const { message } = input;
 *   return {
 *     message: `You sent: ${message}`,
 *   };
 * });
 * 
 * export default api.serve();
 * ```
 */

import type { ApiInfo } from "./api-info.ts";
import type {
    EndpointDefBase,
    EndpointDefinition,
    InEndpointDefinition,
    OutEndpointDefinition,
    InOutEndpointDefinition
} from "./endpoint-definitions.ts";
import type { HttpVerb } from "./http-verb.ts";

import { GptApi } from "./gpt-api.ts";

export type { ApiInfo };
export type { HttpVerb };
export type {
    EndpointDefBase,
    EndpointDefinition,
    InEndpointDefinition,
    OutEndpointDefinition,
    InOutEndpointDefinition
};

export { GptApi };
