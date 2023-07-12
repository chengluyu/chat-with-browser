export type ChatGPTMessage = AssistantMessage | UserMessage | SystemMessage;

export type AssistantMessage = {
  role: "assistant";
  content: string;
};

export type AssistantFunctionCall = {
  role: "assistant";
  content: null;
  function: string;
  arguments: Record<string, unknown>;
};

export type UserMessage = {
  role: "user";
  content: string;
};

export type SystemMessage = {
  role: "system";
  content: string;
};
