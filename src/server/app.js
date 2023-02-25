require('dotenv').config();
const openai = require('openai');
const apiKey = process.env.OPENAI_API_KEY;

openai.apiKey = apiKey;

openai.complete({
  engine: 'curie',
  prompt: 'What is the capital of France?',
  maxTokens: 10
}).then(response => {
  console.log(response.choices[0].text);
}).catch(error => {
  console.error(error);
});
