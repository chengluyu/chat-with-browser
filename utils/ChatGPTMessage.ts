export type ChatGPTMessage = AssistantMessage | UserMessage | SystemMessage;

export type AssistantModel = "gpt-4" | "gpt-3.5-turbo" | "fabricated";

export type AssistantMessage = {
  role: "assistant";
  model: AssistantModel;
  content: string;
};

export type UserMessage = {
  role: "user";
  content: string;
};

export type SystemMessage = {
  role: "system";
  content: string;
};

const roleName: Record<ChatGPTMessage["role"], string> = {
  assistant: "AI",
  user: "You",
  system: "System",
};
