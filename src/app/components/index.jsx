"use client";

import Form from "next/form";
import { useActionState } from "react";
import { sendDiscordMessage } from "../actions";
import { useEffect } from "react";
import { toast } from "sonner";

const MessageForm = () => {
  const [formState, formAction, isPending] = useActionState(
    sendDiscordMessage,
    null
  );

  useEffect(() => {
    if (formState?.success) {
      toast.success(formState?.message);
    } else if (formState?.success === false) {
      toast.error(formState?.message);
    }
  }, [formState?.success]);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-black">
        Send a message to the Discord channel
      </h2>
      <p className="text-gray-600 mb-4">
        Enter your message below and click the button to send it to the Discord
        channel.
      </p>

      <Form className="flex flex-col gap-2" action={formAction}>
        <input
          type="text"
          placeholder="Your name"
          name="username"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          required
        />

        <input
          type="email"
          placeholder="Your e-mail"
          name="email"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          required
        />

        <input
          type="url"
          placeholder="Your Image URL (optional)"
          name="dp"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
        <p className="text-xs text-gray-500 -mt-1">
          Supported formats: JPG, PNG, GIF, WebP, SVG
        </p>
        <p className="text-xs text-blue-500 -mt-1">
          Examples: https://picsum.photos/400/300,
          https://via.placeholder.com/400x300
        </p>

        <select
          name="type"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          required
        >
          <option value="">Message Type</option>
          <option value="thanks">Say, Thanks!</option>
          <option value="qa">QA</option>
          <option value="general">General</option>
        </select>

        <textarea
          placeholder="What do you want to say?"
          name="message"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-black"
          rows="4"
          required
        />

        <div className="flex justify-center items-center">
          <button
            type="submit"
            className="flex justify-center items-center mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isPending ? "Sending..." : "Send"}
          </button>
        </div>
      </Form>
    </div>
  );
};

export default MessageForm;
