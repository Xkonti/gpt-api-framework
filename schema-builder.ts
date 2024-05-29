import type { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import type { EndpointDefinition } from "./endpoint-definitions.ts";
import type { HttpVerb } from "./mod.ts";

/**
 * Returns the JSON schema for a Zod schema.
 * @param schema The Zod schema to convert.
 * @returns The generated JSON schema.
 */
export function getSchemaDesc(schema: z.Schema | null){
    if (!schema) return null;
    return zodToJsonSchema(schema, {
        name: "schema",
        target: "openApi3",
    }).definitions?.schema ?? null;
}

/**
 * Describes the schema of an endpoint.
 */
export interface EndpointSchema {
    description: string;
    operationId: string;
    requestBody?: {
        description: string;
        required: boolean;
        content: {
            [key: string]: {
                schema: ReturnType<typeof getSchemaDesc>;
            };
        };
    } | null;
    responses: {
        [key: string]: {
            description: string;
            content: {
                [key: string]: {
                    schema: ReturnType<typeof getSchemaDesc>;
                };
            };
        };
    };

}

/**
 * Describes the paths of an OpenAPI spec.
 */
export type Paths = {
    [key: string]: Partial<{
        [key in HttpVerb]: EndpointSchema
    }>
};

/**
 * Assembles the paths of an OpenAPI spec from endpoint definitions.
 * @param endpoints The endpoint definitions to use.
 * @returns The paths of the OpenAPI spec.
 */
export function getPathsDesc(endpoints: EndpointDefinition[]): Paths {
    const paths: Paths = {};
    for (const endpoint of endpoints) {
        // This is to allow multiple endpoints with the same path but different verbs
        if (!paths[endpoint.path]) {
            paths[endpoint.path] = {};
        }
        paths[endpoint.path][endpoint.verb] = {
            description: endpoint.desc,
            operationId: endpoint.operationId,
            requestBody: endpoint.requestSchema
                ? {
                    description: endpoint.requestDesc ?? "Request body",
                    required: true,
                    content: {
                        "application/json": {
                            schema: getSchemaDesc(endpoint.requestSchema),
                        },
                    },
                }
                : undefined,
            responses: {
                "200": {
                    description: endpoint.responseDesc ?? "Success",
                    content: {
                        "application/json": {
                            schema: getSchemaDesc(endpoint.responseSchema),
                        },
                    },
                },
            },
        };
    }

    return paths;
}

/**
 * Generates an OpenAPI spec for the defined API.
 * @param url The URL of the API.
 * @param title The title of the API.
 * @param description The description of the API.
 * @param version The version of the API.
 * @param endpoints The endpoint definitions to use.
 * @returns The OpenAPI spec.
 */
export function getOpenApiSpec(
    url: string,
    title: string,
    description: string,
    version: string,
    endpoints: EndpointDefinition[],
) {
    return {
        openapi: "3.1.0",
        info: {
            title,
            description,
            version,
        },
        servers: [
            {
                url,
            },
        ],
        paths: getPathsDesc(endpoints),
    };
}