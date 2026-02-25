import { useState, useRef, useEffect } from "react";
import { Input, Button, Typography, Space } from "antd";
import { SendOutlined } from "@ant-design/icons";
import type { Message } from "../types";
import { sendChatMessage } from "../api";
import ChatMessage from "../components/ChatMessage";

const { Title, Text } = Typography;

let msgId = 0;
const nextId = () => `msg-${++msgId}`;

const WELCOME: Message = {
  id: nextId(),
  role: "assistant",
  content:
    "您好！我是AI拍卖搜索助手 🤖\n\n请描述您的购买需求，我会为您智能匹配合适的拍卖资产。\n\n例如：「我想买杭州的住宅」「需要一辆二手豪华轿车」「找工业用地」",
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: nextId(), role: "user", content: text };
    const loadingMsg: Message = {
      id: nextId(),
      role: "assistant",
      content: "",
      loading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendChatMessage(text);
      const assistantMsg: Message = {
        id: loadingMsg.id,
        role: "assistant",
        content: res.summary,
        thinking: res.thinking,
        matches: res.matches,
      };
      setMessages((prev) =>
        prev.map((m) => (m.id === loadingMsg.id ? assistantMsg : m))
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingMsg.id
            ? {
                ...m,
                loading: false,
                content: "抱歉，服务暂时不可用，请稍后重试。",
              }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)",
      }}
    >
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #f0f0f0",
          background: "#fff",
        }}
      >
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            💬 我要买
          </Title>
          <Text type="secondary">描述您的需求，AI为您匹配拍卖资产</Text>
        </Space>
      </div>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "24px",
          background: "#fafafa",
        }}
      >
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      <div
        style={{
          padding: "16px 24px",
          borderTop: "1px solid #f0f0f0",
          background: "#fff",
        }}
      >
        <div style={{ display: "flex", gap: 12, maxWidth: 800, margin: "0 auto" }}>
          <Input
            size="large"
            placeholder="请描述您的购买需求，如：我想买杭州的三居室住宅..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={handleSend}
            disabled={loading}
          />
          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={loading}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
}
