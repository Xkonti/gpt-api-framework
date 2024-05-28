/**
 * The API info object that is used to describe the API to the GPT.
 */
export interface ApiInfo {
    /**
     * The URL of the API. This should match the URL of your Val.
     */
    url: string;

    /**
     * The name of the API. It gives the GPT an idea about the purpose of the API.
     */
    title: string;

    /**
     * A short description of the API. It gives the GPT an idea about the purpose of the API.
     */
    description: string;

    /**
     * The version of the API. Required by the OpenAPI spec.
     */
    version: string;

    /**
     * An optional function that returns the policy to be used available at `/privacypolicy`.
     */
    policyGetter?: (() => string) | (() => Promise<string>);
}