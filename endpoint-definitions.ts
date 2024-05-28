import type {HttpVerb} from "./http-verb.ts";
import type { z } from "zod";

export interface EndpointDefBase {
    verb: HttpVerb;
    path: string;
    desc: string;
    operationId: string;
}

export interface EndpointDefinition extends EndpointDefBase {
    requestSchema: z.Schema | null;
    requestDesc: string | null;
    responseSchema: z.Schema | null;
    responseDesc: string | null;
}

export interface InEndpointDefinition<TRequestSchema extends z.Schema> extends EndpointDefBase {
    requestSchema: TRequestSchema;
}

export interface OutEndpointDefinition<TResponseSchema extends z.Schema> extends EndpointDefBase {
    responseSchema: TResponseSchema;
}

export interface InOutEndpointDefinition<TRequestSchema extends z.Schema, TResponseSchema extends z.Schema>
    extends EndpointDefBase {
    requestSchema: TRequestSchema;
    responseSchema: TResponseSchema;
}