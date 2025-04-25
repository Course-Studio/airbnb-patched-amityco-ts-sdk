# [PATCHED] Amity Social Cloud TypeScript SDK

A patched version of the [Amity Social Cloud TypeScript SDK](https://www.npmjs.com/package/@amityco/ts-sdk) that enables connecting to the SocialPlus API using an existing access token.

## Why This Fork?

The original SDK only supports authentication using an API key, which creates a new access token. This fork adds support for using an existing access token, which is required for the [airbnb-onecommunity-conversation-box](https://github.com/Course-Studio/airbnb-onecommunity-conversation-box) project.

## What's Changed?

This fork adds one new method to the SDK:

- `Client.useAccessToken(token: string)`: Allows connecting to the SocialPlus API using an existing access token

The change is contained in the `src/client/api/useAccessToken.ts` file.

## Original Package

This is a fork of the [@amityco/ts-sdk](https://www.npmjs.com/package/@amityco/ts-sdk) package. For the full SDK documentation and features, please refer to the original package.

## License

The original code is licensed under the [CC BY-ND 4.0](https://creativecommons.org/licenses/by-nd/4.0/) license.
