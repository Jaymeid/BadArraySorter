import axios from "axios";
import * as readline from "readline";

const OPEN_API_KEY = "INSERT KEY HERE";
const array = [1, 2, 33, 45, 3, 32, 54, 12, 32];

let previousDifference: number;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

const messages = [
  {
    role: "user",
    content:
      "Be prepared to sum the following numbers that will be sent one by one. Reply back each time with ONLY the current running total. The first number is coming next.",
  },
];

const callChatGpt = async (message: string) => {
  try {
    messages.push({ role: "user", content: message });

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPEN_API_KEY}`,
        },
      }
    );

    const gptMessage = response.data.choices[0].message.content;
    console.log("ChatGPTs running total:", gptMessage);

    messages.push({ role: "assistant", content: gptMessage });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const promptUser = async (index: number): Promise<void> => {
  let numberOfTries = 0;
  let isCorrectNumber = false;

  while (!isCorrectNumber) {
    const userInput = await askQuestion(
      "Please enter the next number to be summed: "
    );
    const newNumber = Number(userInput);

    if (newNumber === array[index]) {
      console.log("Correct!");
      await callChatGpt(newNumber.toString());
      isCorrectNumber = true;
    } else {
      if (numberOfTries === 0) {
        console.log("Incorrect :( Try again!");
        previousDifference = Math.abs(array[index] - newNumber);
      } else {
        const newDiff = Math.abs(array[index] - newNumber);
        console.log(newDiff > previousDifference ? "Colder..." : "Warmer...");
        previousDifference = newDiff;
      }
      numberOfTries++;
    }
  }

  if (index < array.length - 1) {
    await promptUser(index + 1);
  } else {
    rl.close();
    console.log("You've completed the array!");
  }
};

(async () => {
  await callChatGpt(
    "Be prepared to sum the following numbers that will be sent one by one. Reply back each time with ONLY the current running total. The first number is coming next."
  );

  console.log("Welcome to the bad array sorter!");
  await promptUser(0);
})();
