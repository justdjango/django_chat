import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";
import InfiniteScroll from "react-infinite-scroll-component";
import { useHotkeys } from "react-hotkeys-hook";
import { AuthContext } from "../contexts/AuthContext";
import { MessageModel } from "../models/Message";
import { Message } from "./Message";
import { ChatLoader } from "./ChatLoader";
import { ConversationModel } from "../models/Conversation";

export function Chat() {
  const { conversationName } = useParams();
  const { user } = useContext(AuthContext);
  const [participants, setParticipants] = useState<string[]>([]);
  const [conversation, setConversation] = useState<ConversationModel | null>(
    null
  );
  const [messageHistory, setMessageHistory] = useState<MessageModel[]>([]);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(2);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [meTyping, setMeTyping] = useState(false);
  const [typing, setTyping] = useState(false);

  function updateTyping(event: { user: string; typing: boolean }) {
    if (event.user !== user!.username) {
      setTyping(event.typing);
    }
  }

  const { readyState, sendJsonMessage } = useWebSocket(
    user ? `ws://127.0.0.1:8000/${conversationName}/` : null,
    {
      queryParams: {
        token: user ? user.token : "",
      },
      onOpen: () => {
        console.log("Connected!");
      },
      onClose: () => {
        console.log("Disconnected!");
      },
      // onMessage handler
      onMessage: (e) => {
        const data = JSON.parse(e.data);
        switch (data.type) {
          case "chat_message_echo":
            setMessageHistory((prev: any) => [data.message, ...prev]);
            break;
          case "last_50_messages":
            setMessageHistory(data.messages);
            setHasMoreMessages(data.has_more);
            break;
          case "user_join":
            setParticipants((pcpts: string[]) => {
              if (!pcpts.includes(data.user)) {
                return [...pcpts, data.user];
              }
              return pcpts;
            });
            break;
          case "user_leave":
            setParticipants((pcpts: string[]) => {
              const newPcpts = pcpts.filter((x) => x !== data.user);
              return newPcpts;
            });
            break;
          case "online_user_list":
            setParticipants(data.users);
            break;
          case "typing":
            updateTyping(data);
            break;
          default:
            console.error("Unknown message type!");
            break;
        }
      },
    }
  );

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  async function fetchMessages() {
    const apiRes = await fetch(
      `http://127.0.0.1:8000/api/messages/?conversation=${conversationName}&page=${page}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Token ${user?.token}`,
        },
      }
    );
    if (apiRes.status === 200) {
      const data: {
        count: number;
        next: string | null; // URL
        previous: string | null; // URL
        results: MessageModel[];
      } = await apiRes.json();
      setHasMoreMessages(data.next !== null);
      setPage(page + 1);
      setMessageHistory((prev: MessageModel[]) => prev.concat(data.results));
    }
  }

  const timeout = useRef<any>();

  function timeoutFunction() {
    setMeTyping(false);
    sendJsonMessage({ type: "typing", typing: false });
  }

  function onType() {
    if (meTyping === false) {
      setMeTyping(true);
      sendJsonMessage({ type: "typing", typing: true });
      timeout.current = setTimeout(timeoutFunction, 5000);
    } else {
      clearTimeout(timeout.current);
      timeout.current = setTimeout(timeoutFunction, 5000);
    }
  }

  function handleChangeMessage(e: any) {
    setMessage(e.target.value);
    onType();
  }

  useEffect(() => () => clearTimeout(timeout.current), []);

  const handleSubmit = () => {
    if (message.length === 0) return;
    if (message.length > 512) return;
    sendJsonMessage({
      type: "chat_message",
      message,
    });
    setMessage("");
  };

  const inputReference: any = useHotkeys(
    "enter",
    () => {
      clearTimeout(timeout.current);
      timeoutFunction();
      handleSubmit();
    },
    {
      enableOnTags: ["INPUT"],
    }
  );

  useEffect(() => {
    (inputReference.current as HTMLElement).focus();
  }, [inputReference]);

  useEffect(() => {
    async function fetchConversation() {
      const apiRes = await fetch(
        `http://127.0.0.1:8000/api/conversations/${conversationName}/`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Token ${user?.token}`,
          },
        }
      );
      if (apiRes.status === 200) {
        const data: ConversationModel = await apiRes.json();
        setConversation(data);
      }
    }
    fetchConversation();
  }, [conversationName, user]);

  return (
    <div>
      <span>The WebSocket is currently {connectionStatus}</span>
      {conversation && (
        <div className="py-6">
          <h3 className="text-3xl font-semibold text-gray-900">
            Chat with user: {conversation.other_user.username}
          </h3>
          <span className="text-sm">
            {conversation.other_user.username} is currently
            {participants.includes(conversation.other_user.username)
              ? " online"
              : " offline"}
          </span>
          {typing && (
            <p className="truncate text-sm text-gray-500">typing...</p>
          )}
        </div>
      )}

      <div className="flex w-full items-center justify-between border border-gray-200 p-3">
        <input
          type="text"
          placeholder="Message"
          className="block w-full rounded-full bg-gray-100 py-2 outline-none focus:text-gray-700"
          name="message"
          value={message}
          onChange={handleChangeMessage}
          required
          ref={inputReference}
          maxLength={511}
        />
        <button className="ml-3 bg-gray-300 px-3 py-1" onClick={handleSubmit}>
          Submit
        </button>
      </div>

      <div
        id="scrollableDiv"
        className={
          "h-[20rem] mt-3 flex flex-col-reverse relative w-full border border-gray-200 overflow-y-auto p-6"
        }
      >
        <div>
          {/* Put the scroll bar always on the bottom */}
          <InfiniteScroll
            dataLength={messageHistory.length}
            next={fetchMessages}
            className="flex flex-col-reverse" // To put endMessage and loader to the top
            inverse={true}
            hasMore={hasMoreMessages}
            loader={<ChatLoader />}
            scrollableTarget="scrollableDiv"
          >
            {messageHistory.map((message: MessageModel) => (
              <Message key={message.id} message={message} />
            ))}
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
}
