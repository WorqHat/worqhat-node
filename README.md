# Worqhat Node SDK

[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v1/monitor/trle.svg)](https://uptime.betterstack.com/?utm_source=status_badge)
[![NPM version](https://img.shields.io/npm/v/worqhat.svg)](https://npmjs.org/package/worqhat)
![GitHub CI](https://github.com/worqhat/worqhat-node/actions/workflows/release.yml/badge.svg)
[![Known Vulnerabilities](https://snyk.io/test/github/worqhat/worqhat-node/badge.svg)](https://snyk.io/test/github/worqhat/worqhat-node)

The WorqHat Node SDK is a comprehensive library that allows developers to interact with the
WorqHat API. It provides a simple and intuitive interface to access various AI services such as
content generation, image generation, text extraction, image analysis, and more.

This library provides convenient access to the WorqHat REST API from TypeScript or JavaScript.

To learn how to use the WorqHat APIs, check out our [API Reference](https://docs.worqhat.com/api-reference/authentication) and [Documentation](https://docs.worqhat.com/introduction).

### Table of Contents

- [Worqhat Node SDK](#worqhat-node-sdk)
    - [Table of Contents](#table-of-contents)
    - [Installation](#installation)
    - [Usage](#usage)
    - [TypeScript support](#typescript-support)
      - [Verify User Profile](#verify-user-profile)
    - [Sample Functions](#sample-functions)
        - [AiCon V2](#aicon-v2)
        - [AiCon V3](#aicon-v3)
  - [Documentations](#documentations)
  - [License](#license)
  - [Contributing](#contributing)
  - [Support](#support)

### Installation

You can install the WorqHat Node SDK via npm or yarn:

```bash
# using npm
npm install worqhat
```

```bash
# using yarn
yarn add worqhat
```

### Usage

First, you need to import the Worqhat SDK and initialize it with your API key:

```JavaScript
const worqhat = require('worqhat');

var config = new worqhat.Configuration({
  apiKey: "your-api-key",
  debug: true,
  max_retries: 3,
});

worqhat.initializeApp(config);
```

Here are the configuration options you can set when initializing the Worqhat SDK:

Option | Description | Required
--- | --- | ---
`apiKey` | The API key used for authentication. This key is required to access the API services. | Yes
`debug` | If set to `true`, the SDK will log debug information to the console. Default value is `false`.| No
`max_retries` | The maximum number of retries to attempt for a request. The default value is `2`. Max limit is `5`. | No

### TypeScript support

Import the package as a class and run the Typescript compiler. You can then use the SDK as follows:

```ts
import * as worqhat from 'worqhat';

const config = new worqhat.Configuration({
  apiKey: "your-api-key",
  debug: false,
});

worqhat.initializeApp(config);

```

#### Verify User Profile

The easiest way to verify whether the package is working or not is by sending a request to the Authenticate endpoint. This can be done by calling the `checkAuthentication` method provided by the SDK. Here is an example of how to do this:

 ```javascript
 const worqhat = require('worqhat');

 const config = new worqhat.Configuration({
   apiKey: "your-api-key",
   debug: true,
 });

 worqhat.initializeApp(config);

 async function checkAuth() {
   try {
     const result = await worqhat.checkAuthentication();
     console.log(result);
   } catch (error) {
     console.error(error);
   }
 }

 checkAuth();

```
### Sample Functions

You can generate content using the `contentGeneration` method:

##### AiCon V2

  Version 2 Content Generation AI focused only on Business Content Generation Purpose. It can be used to generate content for a variety of business use cases where the content is not too creative or complex. Read more at https://docs.worqhat.com/ai-models/text-generation-ai/aicon-v2-textgen


```JavaScript
   async function generateContent() {
     try {
       var result = await worqhat.contentGeneration.v2({
         history_object: { "previous question": "answer to your previous question" },
         preserve_history: true,
         question: "Your question here",
         training_data: "your-training-data-id",
         randomness: 0.3,
       })
       console.log(result);

     } catch (error) {
       console.error(error);
     }
   }

   generateContent();
```

Here are the parameters that can be passed to the `contentGeneration` method:

Parameter | Description | Required
--- | --- | ---
`history_object` | An object representing the history of the conversation. | No
`preserve_history` | A boolean indicating whether to preserve the conversation history. | No
`question` | A string representing the question to generate content for. | Yes
`training_data` | A string representing the training data to use for generating content. | No
`randomness` | A float representing the randomness or hallucinating factor for content generation. | No

Note: If `history_object` is not provided, the default value is `undefined`. If `preserve_history` is not provided, the default value is `false`. If `training_data` is not provided, the default value is `undefined`. If `randomness` is not provided, the default value is `0.2`.


---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

##### AiCon V3

  Version 3 Advanced Generation AI focused for more creative and understanding capabilities. It can be used to generate content for a variety of use cases where the content is more creative or complex. It can run complex situational analysis and understand the context of the commands. Read more at https://docs.worqhat.com/ai-models/text-generation-ai/aicon-v3-textgen

```JavaScript
   const worqhat = require('worqhat');

   var config = new worqhat.Configuration({
     apiKey: "your-api-key",
     debug: true,
   });

   worqhat.initializeApp(config);

   async function generateContent() {
     try {
       var result = await worqhat.contentGeneration.v3({
         history_object: { "previous question": "answer to your previous question" },
         preserve_history: true,
         question: "Your question here",
         training_data: "your-training-data-id",
         randomness: 0.3,
       })
       console.log(result);

     } catch (error) {
       console.error(error);
     }
   }

   generateContent();
```

Here are the parameters that can be passed to the `contentGeneration` method:

Parameter | Description | Required
--- | --- | ---
`history_object` | An object representing the history of the conversation. | No
`preserve_history` | A boolean indicating whether to preserve the conversation history. | No
`question` | A string representing the question to generate content for. | Yes
`training_data` | A string representing the training data to use for generating content. | No
`randomness` | A float representing the randomness or hallucinating factor for content generation. | No

Note: If `history_object` is not provided, the default value is `undefined`. If `preserve_history` is not provided, the default value is `false`. If `training_data` is not provided, the default value is `undefined`. If `randomness` is not provided, the default value is `0.2`.


## Documentations

For more detailed documentation, please visit our [official documentation](https://docs.worqhat.com).

## License

This project is licensed under the MIT License. For more details, please refer to the [LICENSE](LICENSE) file.

## Contributing

We welcome contributions from the community. Please read our [contributing guidelines](CONTRIBUTING.md) for more information.

## Support

If you encounter any issues or have any questions, please file an issue on our [GitHub issues page](https://github.com/WorqHat/worqhat-node/issues).