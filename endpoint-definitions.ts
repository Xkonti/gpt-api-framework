import type {HttpVerb} from "./http-verb.ts";
import type { z } from "zod";

/**
 * Base interface for defining an endpoint.
 * This does not include request or response schemas.
 */
export interface EndpointDefBase {
    verb: HttpVerb;
    path: string;
    desc: string;
    operationId: string;
}

/**
 * Used o define an endpoint with request and response schemas
 * along with descriptions for each.
 */
export interface EndpointDefinition extends EndpointDefBase {
    requestSchema: z.Schema | null;
    requestDesc: string | null;
    responseSchema: z.Schema | null;
    responseDesc: string | null;
}

/**
 * Used to define an input-only endpoint with a request schema,
 * but no response schema.
 */
export interface InEndpointDefinition<TRequestSchema extends z.Schema> extends EndpointDefBase {
    requestSchema: TRequestSchema;
}

/**
 * Used to define an output-only endpoint with a response schema,
 * but no request schema.
 */
export interface OutEndpointDefinition<TResponseSchema extends z.Schema> extends EndpointDefBase {
    responseSchema: TResponseSchema;
}

/**
 * Used to define an input/output endpoint with both a request and
 * response schema.
 */
export interface InOutEndpointDefinition<TRequestSchema extends z.Schema, TResponseSchema extends z.Schema>
    extends EndpointDefBase {
    requestSchema: TRequestSchema;
    responseSchema: TResponseSchema;
}