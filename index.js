const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const { env } = require("./config");

const app = express();
const port = 3000;

app.use(express.json());

const configuration = new Configuration({
  apiKey: env.OPEN_AI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// Function to generate suggested quiz questions with options using OpenAI API
async function generateQuizQuestions(content) {
  const prompt = `Suggest quiz questions and options related to: ${content}`;
  const maxTokens = 200; // Adjust the value based on the desired length of generated questions
  const temperature = 1.0; // Adjust the value to control the randomness of generated questions

  try {
    const response = await openai.createCompletion({
      model: "gpt-3.5-turbo",
      prompt,
      max_tokens: maxTokens,
      temperature,
      n: 1, // Number of suggested questions to generate
      stop: "\n", // Stop generating when a newline character is encountered
    });

    console.log(response.data);

    const suggestions = response.data.choices.map((choice) => choice.text.trim());

    console.log({suggestions});

    return suggestions.slice(0, 15); // Limit the number of questions to a maximum of 15
  } catch (error) {
    console.error("Error generating suggested questions:", error);
    return [];
  }
}

app.post("/generate-quiz", async (req, res) => {
  try {
    const content = req.body.content;

    if (!content) {
      return res.status(400).json({ error: "Missing content" });
    }

    // Generate suggested quiz questions with options
    const quizQuestions = await generateQuizQuestions(content);

    // Return the quiz questions in the response
    res.json({ quizQuestions });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
