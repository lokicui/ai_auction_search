import { Avatar, Spin, Typography } from "antd";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";
import type { Message } from "../types";
import ThinkingChain from "./ThinkingChain";
import AssetCard from "./AssetCard";

const { Text } = Typography;

interface Props {
  message: Message;
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isUser ? "row-reverse" : "row",
        gap: 12,
        marginBottom: 16,
        alignItems: "flex-start",
      }}
    >
      <Avatar
        size={36}
        icon={isUser ? <UserOutlined /> : <RobotOutlined />}
        style={{
          backgroundColor: isUser ? "#1677ff" : "#87d068",
          flexShrink: 0,
        }}
      />
      <div
        style={{
          maxWidth: "80%",
          padding: "12px 16px",
          borderRadius: 12,
          backgroundColor: isUser ? "#1677ff" : "#f5f5f5",
          color: isUser ? "#fff" : "inherit",
          borderTopRightRadius: isUser ? 2 : 12,
          borderTopLeftRadius: isUser ? 12 : 2,
        }}
      >
        {message.loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Spin size="small" />
            <Text type="secondary">AI 正在分析您的需求...</Text>
          </div>
        ) : (
          <>
            {message.content && (
              <div style={{ marginBottom: message.thinking ? 8 : 0 }}>
                {message.content}
              </div>
            )}
            {message.thinking && message.thinking.length > 0 && (
              <ThinkingChain steps={message.thinking} />
            )}
            {message.matches && message.matches.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <Text
                  strong
                  style={{ display: "block", marginBottom: 8, fontSize: 14 }}
                >
                  为您推荐以下标的：
                </Text>
                {message.matches.map((m, i) => (
                  <AssetCard key={i} match={m} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
