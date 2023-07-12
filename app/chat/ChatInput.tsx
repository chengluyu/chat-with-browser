"use client";

import { useForm } from "react-hook-form";
import { PaperAirplaneIcon } from "@heroicons/react/20/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCallback } from "react";

export type ChatInputProps = {
  onSubmit: (data: ChatInputFormData) => void;
};

export const chatInputFormDataSchema = z.object({
  content: z.string().nonempty(),
});

export type ChatInputFormData = z.output<typeof chatInputFormDataSchema>;

export default function ChatInput({ onSubmit }: ChatInputProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<ChatInputFormData>({
    resolver: zodResolver(chatInputFormDataSchema),
  });
  const onSubmitHandler = useCallback(
    handleSubmit((data) => {
      onSubmit(data);
      reset();
    }),
    [handleSubmit, onSubmit, reset]
  );
  return (
    <form className="flex flex-col gap-2" onSubmit={onSubmitHandler}>
      <textarea
        className="w-full resize-none"
        cols={30}
        rows={5}
        {...register("content")}
      />
      <div className="flex flex-row items-center justify-end">
        <button
          className="flex-shrink-0 flex items-center px-2 py-1 bg-blue-600 text-white disabled:bg-stone-400"
          type="submit"
          disabled={!isValid}
        >
          <span className="font-medium">Send</span>
          <PaperAirplaneIcon className="ml-1 w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
