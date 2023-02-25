const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();
// { path: "../.env" }
const configuration = new Configuration({
    apiKey: process.env.OpenAI_API_KEY
  });
const openai = new OpenAIApi(configuration);

const models = {
    "davinci": {
        "name": "text-davinci-003",
        "description": "Most capable GPT-3 model. Can do any task the other models can do, often with higher quality, longer output and better instruction-following. Also supports inserting completions within text.",
        "tokens": 4000
    },
    "curie": {
        "name": "text-curie-001",
        "description": "Very capable, but faster and lower cost than Davinci.",
        "tokens": 2048
    },
    "babbage": {
        "name": "text-babbage-001",
        "description": "Capable of straightforward tasks, very fast, and lower cost.",
        "tokens": 2048
    },
    "ada": {
        "name": "text-ada-001",
        "description": "Capable of very simple tasks, usually the fastest model in the GPT-3 series, and lowest cost.",
        "tokens": 2048
    },
}

async function getCompletion(prompt, modelName="davinci", temperature=0.6, max_tokens=256) {
    // Check API key Validity
    if (!configuration.apiKey) {
        console.log("Invalid KEY!");
        return;
      }

    // Check for valid model name
    if (!models[modelName]) {
        throw new Error("Invalid Model Name!");
    }

    // Create completion request
    const completionRequest = {
        model: models[modelName].name,
        prompt: prompt,
        temperature: temperature,
        max_tokens: max_tokens,
    };

    // Send completion request to OpenAI API
    return openai.createCompletion(completionRequest)
        .then((completion) => {
            return completion.data.choices[0].text.slice(1).trim()})
        .catch((err) => {
            console.error(err);
            return `An error has occurred: ${err.message}`;
        });
}

module.exports = getCompletion;
