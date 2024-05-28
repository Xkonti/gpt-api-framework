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
