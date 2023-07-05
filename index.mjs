import { Configuration, OpenAIApi } from "openai";
import i from "inquirer";
import dotenv from "dotenv";
import chalk from "chalk";
import functions, {
  search,
  navigate,
  read,
  close,
  loadMore,
} from "./functions.mjs";

dotenv.config();

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_API_ORG,
});
const client = new OpenAIApi(config);

const { prompt } = await i.prompt([
  {
    type: "input",
    name: "prompt",
    message: "Please enter your prompt.",
  },
]);

const messages = [
  {
    role: "system",
    content: [
      "You are a helpful assistant with the Internet access.",
      "You can search with Google and navigate to any URL.",
      "If you do not know the answer, you can use the search function.",
      "If you want to read a webpage, you can use the navigate function.",
    ].join("\n"),
  },
  { role: "user", content: prompt },
];

let shouldStop = false;
while (!shouldStop) {
  console.log(`--------------------------------------------------`);
  console.log(`${chalk.green("!")} ${chalk.bold("Waiting for the assistant")}`);
  const response = await client.createChatCompletion({
    model: "gpt-4-0613",
    messages,
    functions,
  });
  if ("error" in response.data) {
    // Fields: message type param code
    console.log(
      `${chalk.red("!")} ${chalk.bold("Error")} ${response.data.error.message}`
    );
    shouldStop = true;
  } else {
    const choice = response.data.choices[0];
    messages.push(choice.message);
    if (choice.finish_reason === "function_call") {
      const props = JSON.parse(choice.message.function_call.arguments);
      console.log(
        `${chalk.blue("$")} ${chalk.bold("Assistant called function")}: ${
          choice.message.function_call.name
        } with ${JSON.stringify(props)}`
      );
      switch (choice.message.function_call.name) {
        case "search": {
          const results = await search(props);
          console.log(
            `Top 3 search results for "${chalk.italic(props.query)}"`
          );
          for (const result of results.slice(0, 3)) {
            console.log(`${chalk.gray("•")} ${result.title} (${result.link})`);
          }
          messages.push({
            role: "function",
            name: "search",
            content: JSON.stringify(results),
          });
          shouldStop = false;
          break;
        }
        case "navigate": {
          const result = await navigate(props);
          messages.push({
            role: "function",
            name: "navigate",
            content: JSON.stringify(result),
          });
          break;
        }
        case "read": {
          const result = await read(props);
          messages.push({
            role: "function",
            name: "read",
            content: JSON.stringify(result),
          });
          break;
        }
        case "scrollDown": {
          const result = await loadMore(props);
          messages.push({
            role: "function",
            name: "scrollDown",
            content: JSON.stringify(result),
          });
          break;
        }
        case "close": {
          const result = await close(props);
          messages.push({
            role: "function",
            name: "close",
            content: JSON.stringify(result),
          });
          break;
        }
        default:
          console.log(`Unknown function: ${choice.message.function_call.name}`);
          console.log(choice.message.function_call.arguments);
          shouldStop = true;
          break;
      }
    } else {
      console.log(
        `${chalk.green(">")} ${chalk.bold("Assistant responded")}: ${
          choice.message.content
        }`
      );
      const { prompt } = await i.prompt([
        {
          type: "input",
          name: "prompt",
          message: "Please enter your response.",
        },
      ]);
      if (prompt == false) {
        shouldStop = true;
      } else {
        messages.push({ role: "user", content: prompt });
      }
    }
    // Display the usage information.
    const usage = response.data.usage;
    if (usage) {
      console.log(
        `${chalk.green("i")} ${chalk.bold("Usage")}: ${
          usage.prompt_tokens
        } send, ${usage.completion_tokens} recv, ${usage.total_tokens} total`
      );
    }
  }
}
