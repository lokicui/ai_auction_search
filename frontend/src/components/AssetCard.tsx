import { Card, Tag, Typography, Space, Progress } from "antd";
import {
  EnvironmentOutlined,
  DollarOutlined,
  TagOutlined,
} from "@ant-design/icons";
import type { AssetMatch } from "../types";

const { Text, Paragraph } = Typography;

const CATEGORY_COLORS: Record<string, string> = {
  住宅: "blue",
  商铺: "orange",
  写字楼: "purple",
  车辆: "green",
  土地: "brown",
  设备: "cyan",
  知识产权: "magenta",
};

function formatPrice(price: number): string {
  if (price >= 100000000) return `¥${(price / 100000000).toFixed(2)}亿`;
  if (price >= 10000) return `¥${(price / 10000).toFixed(1)}万`;
  return `¥${price.toFixed(0)}`;
}

interface Props {
  match: AssetMatch;
}

export default function AssetCard({ match }: Props) {
  const { asset, score } = match;
  const color = CATEGORY_COLORS[asset.category] || "default";

  return (
    <Card
      size="small"
      hoverable
      style={{ marginBottom: 8 }}
      styles={{ body: { padding: "12px 16px" } }}
    >
      <Space direction="vertical" size={4} style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text strong style={{ fontSize: 15 }}>
            {asset.title}
          </Text>
          <Progress
            type="circle"
            percent={Math.round(score * 100)}
            size={36}
            strokeColor={score > 0.7 ? "#52c41a" : score > 0.4 ? "#faad14" : "#ff4d4f"}
          />
        </div>
        {asset.description && (
          <Paragraph
            type="secondary"
            ellipsis={{ rows: 2 }}
            style={{ margin: 0, fontSize: 13 }}
          >
            {asset.description}
          </Paragraph>
        )}
        <Space size={12} wrap>
          {asset.category && (
            <Tag color={color} icon={<TagOutlined />}>
              {asset.category}
            </Tag>
          )}
          {asset.location && (
            <Text type="secondary" style={{ fontSize: 13 }}>
              <EnvironmentOutlined /> {asset.location}
            </Text>
          )}
          {asset.starting_price > 0 && (
            <Text type="danger" style={{ fontSize: 13, fontWeight: 600 }}>
              <DollarOutlined /> 起拍价 {formatPrice(asset.starting_price)}
            </Text>
          )}
          {asset.status && (
            <Tag color={asset.status === "正在拍卖" ? "red" : "blue"}>
              {asset.status}
            </Tag>
          )}
        </Space>
      </Space>
    </Card>
  );
}
