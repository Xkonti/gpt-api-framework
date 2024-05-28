import type { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import type { EndpointDefinition } from "./endpoint-definitions.ts";
import type { HttpVerb } from "./mod.ts";

export function getSchemaDesc(schema: z.Schema | null){
    if (!schema) return null;
    return zodToJsonSchema(schema, {
        name: "schema",
        target: "openApi3",
    }).definitions?.schema ?? null;
}

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

export type Paths = {
    [key: string]: Partial<{
        [key in HttpVerb]: EndpointSchema
    }>
};

export function getPathsDesc(endpoints: EndpointDefinition[]) {
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