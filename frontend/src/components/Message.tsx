import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { MessageModel } from "../models/Message";

export function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export function Message({ message }: { message: MessageModel }) {
  const { user } = useContext(AuthContext);

  function formatMessageTimestamp(timestamp: string) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString().slice(0, 5);
  }

  return (
    <li
      className={classNames(
        "mt-1 mb-1 flex",
        user!.username === message.to_user.username
          ? "justify-start"
          : "justify-end"
      )}
    >
      <div
        className={classNames(
          "relative max-w-xl rounded-lg px-2 py-1 text-gray-700 shadow",
          user!.username === message.to_user.username ? "" : "bg-gray-100"
        )}
      >
        <div className="flex items-end">
          <span className="block">{message.content}</span>
          <span
            className="ml-2"
            style={{
              fontSize: "0.6rem",
              lineHeight: "1rem",
            }}
          >
            {formatMessageTimestamp(message.timestamp)}
          </span>
        </div>
      </div>
    </li>
  );
}
