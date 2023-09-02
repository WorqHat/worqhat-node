# Worqhat Node SDK

[![Better Stack Badge](https://uptime.betterstack.com/status-badges/v1/monitor/trle.svg)](https://uptime.betterstack.com/?utm_source=status_badge)
[![NPM version](https://img.shields.io/npm/v/worqhat.svg)](https://npmjs.org/package/worqhat)

The WorqHat Node SDK is a comprehensive library that allows developers to interact with the 
WorqHat API. It provides a simple and intuitive interface to access various AI services such as 
content generation, image generation, text extraction, image analysis, and more.

This library provides convenient access to the WorqHat REST API from TypeScript or JavaScript.

To learn how to use the WorqHat APIs, check out our [API Reference](https://docs.worqhat.com/api-reference/authentication) and [Documentation](https://docs.worqhat.com/introduction).

## Table of Contents

- [WorqHat Node SDK](#worqhat-node-sdk)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Content Generation](#content-generation)
    - [Image Generation](#image-generation)
    - [Text Extraction](#text-extraction)
    - [Image Analysis](#image-analysis)
  - [License](#license)
  - [Contributing](#contributing)
  - [Support](#support)
  - [Documentation](#documentation)

## Installation

You can install the WorqHat Node SDK via npm or yarn:

```bash
npm install worqhat
```

```bash
yarn add worqhat
```

## Usage

First, you need to import the Worqhat SDK and initialize it with your API key:

```JavaScript
const worqhat = require('worqhat');

var config = new worqhat.Configuration({
  apiKey: "your-api-key",
  debug: true,
  
});

worqhat.initializeApp(config);
```

> [!IMPORTANT]
> Previous versions of this SDK used a `Configuration` class. See the [v3 to v4 migration guide](https://github.com/openai/openai-node/discussions/217).


### Content Generation

You can generate content using the `contentGeneration` method:

```JavaScript
async function contentV2() {
  try {
    var content = await worqhat.contentGeneration.v2({
      "question": "What is the capital of France?",
    });
    console.log(content);
  } catch (error) {
    console.error(error);
  }
}
```

### Image Generation

You can generate images using the `imageGeneration` method:

```JavaScript
async function imageV2() {
  try {
    var image = await worqhat.imageGeneration.v2({
      orientation: "Square",
      image_style: "Photograph",
      output_type: "blob",
      prompt: [
        "A cat walking in a field of cherry blossoms",
      ]
    });
    console.log(image);
  } catch (error) {
    console.error(error);
  }
}
```

### Text Extraction

You can extract text from images or speech using the `textExtraction` method:

```JavaScript
async function imageExtraction() {
  try {
    var image = await worqhat.textExtraction.image({
      image: "./Custom AI Studio Cover.png"
    })
    console.log(image);
  } catch (error) {
    console.error(error);
  }
}
```

### Image Analysis

You can analyze images using the `analyseImages` method:

```JavaScript
async function analyseImage() {
  try {
    var image = await worqhat.analyseImages.analyse({
      image: "./Custom AI Studio Cover.png"
    })
    console.log(image);
  } catch (error) {
    console.error(error);
  }
}
```

## License

This project is licensed under the MIT License. For more details, please refer to the [LICENSE](LICENSE) file.

## Contributing

We welcome contributions from the community. Please read our [contributing guidelines](CONTRIBUTING.md) for more information.

## Support

If you encounter any issues or have any questions, please file an issue on our [GitHub issues page](https://github.com/WorqHat/worqhat-node/issues).

## Documentation

For more detailed documentation, please visit our [official documentation](https://docs.worqhat.com).
