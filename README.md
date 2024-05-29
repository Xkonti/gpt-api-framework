# GPT API Framework

Allows for automatic generation of Hono API compatible with GPTs. Endpoints' inputs and outputs need to be specified via types from which the Open API spec is generated automatically.

## Features

- Automatic OpenAPI spec generation. The spec is fully compatible with GPTs and served at `/gpt/schema` for easy schema import.
- Privacy Policy can be provided to simplify sharing GPTs. It's served at `/privacypolicy`
- Supports defining endpoints with input/output types using Zod schemas and full descriptions to improve GPT understanding of the API.
    - `jsonToNothing` - endpoint that takes JSON input and returns a status code
    - `nothingToJson` - endpoint that takes no input and returns JSON
    - `jsonToJson` - endpoint that takes JSON input and returns JSON output

You can follow the tutorial at
[xkonti.tech](https://xkonti.tech/blog/gpt-actions-with-val-town/) to
learn how to use this module on ValTown. There is also a
[ValTown version](https://www.val.town/v/xkonti/gptApiFramework) of this
module while ValTown is working on supporting type definitions from
JSR packages.

## Usage example

```ts
import { GptApi } from "jsr:@xkonti/gpt-api-framework@0.0.1";
import { z } from "npm:zod";

const api = new GptApi({
  url: "https://theapi.web.val.run",
  title: "The API",
  description: "The API for a GPT to use",
  version: "1.0.0",
  policyGetter: async () => {
    return "This is a privacy policy";
  },
});

const RequestSchema = z.object({
  message: z.string().describe("A message to pass"),
}).describe("Data required by the action");

const ResponseSchema = z.object({
    message: z.string().describe("A response to the request message"),
}).describe("A result of the action");

api.jsonToJson({
  verb: "post",
  path: "/sendmessage",
  operationId: "sendmessage",
  desc: "Endpoint for submitting messages",
  requestSchema: RequestSchema,
  responseSchema: ResponseSchema,
}, async (ctx, input) => {
  const { message } = input;
  return {
    message: `You sent: ${message}`,
  };
});

export default api.serve();
```