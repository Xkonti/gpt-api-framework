import type { Context } from "@hono/hono";
import type { z } from "zod";

import { Hono } from "@hono/hono";

import type { ApiInfo } from "./api-info.ts";
import type {
    EndpointDefinition,
    InEndpointDefinition,
    OutEndpointDefinition,
    InOutEndpointDefinition,
} from "./endpoint-definitions.ts";

import { getOpenApiSpec } from "./schema-builder.ts";
import { StatusCode } from "jsr:@hono/hono@^4.4.0/utils/http-status";

export class GptApi {
    private app = new Hono();
    private info: ApiInfo;
    private endpoints: EndpointDefinition[] = [];

    /**
     * Creates a new GptApi instance.
     * @param info Configuration for the API.
     */
    constructor(info: ApiInfo) {
        this.info = info;
        this.app.get("/gpt/schema", (ctx) => {
            const spec = getOpenApiSpec(
                this.info.url,
                this.info.title,
                this.info.description,
                this.info.version,
                this.endpoints,
            );
            return ctx.text(JSON.stringify(spec, null, 2));
        });

        if (info.policyGetter != null) {
            const policyGetter = info.policyGetter;
            this.app.get("/privacypolicy", async (ctx) => {
                let content = await policyGetter();
                content = content.trim();
                if (content.endsWith("</html>")) {
                    return ctx.html(content);
                }
                else {
                    return ctx.text(content);
                }
            });
        }
    }

    /**
     * Register endpoint that accepts json input and returns only a status code.
     * @param endpointDef Definition of the endpoint.
     * @param handler Function that handles the request.
     */
    jsonToNothing<TRequestSchema extends z.Schema>(
        endpointDef: InEndpointDefinition<TRequestSchema>,
        handler: (ctx: Context, reqBody: z.infer<TRequestSchema>, apiKey: string | null) => Promise<number>,
    ) {
        const handlerWrapper = async (ctx: Context) => {
            const requestBody = await ctx.req.json();

            // Validate request data
            const parsedRequestData = endpointDef.requestSchema.parse(requestBody) as z.infer<TRequestSchema>;
            // TODO: Handle invalid data format

            const apiKey = this.extractApiKey(ctx);
            const statusCode = await handler(ctx, parsedRequestData, apiKey);
            return ctx.body(null, statusCode as StatusCode);
        };

        // Transform to EndpointDefinition
        const eDef = endpointDef as unknown as EndpointDefinition;
        eDef.requestDesc = endpointDef.requestSchema.description ?? "Request body";
        eDef.responseSchema = null;
        eDef.responseDesc = null;

        // TODO: Verify request schema is in place
        this.registerHandler(eDef, handlerWrapper);
    }

    /**
     * Register endpoint that ignores all inputs and returns a specific JSON response.
     */
    nothingToJson<TResponseSchema extends z.Schema>(
        endpointDef: OutEndpointDefinition<TResponseSchema>,
        handler: (ctx: Context, apiKey: string | null) => Promise<z.infer<TResponseSchema>>,
    ) {
        const handlerWrapper = async (ctx: Context) => {
            const apiKey = this.extractApiKey(ctx);
            const response = await handler(ctx, apiKey);

            // Validate response data
            const parsedResponseData = endpointDef.responseSchema.parse(response) as z.infer<TResponseSchema>;

            return ctx.json(parsedResponseData);
        };

        // Transform to EndpointDefinition
        const eDef = endpointDef as unknown as EndpointDefinition;
        eDef.requestSchema = null;
        eDef.requestDesc = null;
        eDef.responseDesc = endpointDef.responseSchema.description ?? "Response body";

        // TODO: Verify response stuff is in place
        this.registerHandler(eDef, handlerWrapper);
    }

    /**
     * Register endpoint that accepts a JSON DTO and returns a specific JSON response.
     */
    jsonToJson<TRequestSchema extends z.Schema, TResponseSchema extends z.Schema>(
        endpointDef: InOutEndpointDefinition<TRequestSchema, TResponseSchema>,
        handler: (
            ctx: Context,
            reqBody: z.infer<TRequestSchema>,
            apiKey: string | null,
        ) => Promise<z.infer<TResponseSchema>>,
    ) {
        // TODO: Verify request and response is in place
        const handlerWrapper = async (ctx: Context) => {
            const requestBody = await ctx.req.json();

            // Validate request data
            const parsedRequestData = endpointDef.requestSchema.parse(requestBody) as z.infer<TRequestSchema>;
            // TODO: Handle invalid data format

            const apiKey = this.extractApiKey(ctx);
            const response = await handler(ctx, parsedRequestData, apiKey);

            // Validate response data
            const parsedResponseData = endpointDef.responseSchema.parse(response) as z.infer<TResponseSchema>;
            return ctx.json(parsedResponseData);
        };

        // Transform to EndpointDefinition
        const eDef = endpointDef as unknown as EndpointDefinition;
        eDef.requestDesc = endpointDef.requestSchema.description ?? "Request body";
        eDef.responseDesc = endpointDef.responseSchema.description ?? "Response body";
        this.registerHandler(eDef, handlerWrapper);
    }

    // Registers a handler for a verb + path combo.
    private registerHandler(
        endpointDef: EndpointDefinition,
        handler: (ctx: Context) => Response | Promise<Response>,
    ) {
        this.endpoints.push(endpointDef);

        const verb = endpointDef.verb;
        const path = endpointDef.path;
        switch (verb) {
            case "get":
                this.app.get(path, handler);
                break;
            case "post":
                this.app.post(path, handler);
                break;
            case "put":
                this.app.put(path, handler);
                break;
            case "delete":
                this.app.delete(path, handler);
                break;
            case "patch":
                this.app.patch(path, handler);
                break;
            default:
                throw new Error(`HTTP verb ${verb} not supported`);
        }
    }

    /**
     * Usage: `export default gptApi.serve();`
     */
    serve(): typeof Hono.prototype.fetch {
        return this.app.fetch;
    }

    /**
     * Extract API key from Bearer Auth header.
     */
    private extractApiKey(ctx: Context): string | null {
        const authHeader = ctx.req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        const apiKey = authHeader.split(" ")[1];
        return apiKey;
    }
}