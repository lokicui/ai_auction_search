import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Upload,
  Space,
  Typography,
  message,
  Popconfirm,
  Card,
  Statistic,
  Tag,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  ReloadOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd";
import type { Asset } from "../types";
import { uploadAssets, getAssets, deleteAsset, getStats } from "../api";

const { Title } = Typography;

export default function AdminPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [totalAssets, setTotalAssets] = useState(0);

  const loadAssets = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await getAssets(p, 10);
      setAssets(res.assets);
      setTotal(res.total);
      setPage(p);
    } catch {
      message.error("加载资产列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const res = await getStats();
      setTotalAssets(res.total_assets);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadAssets();
    loadStats();
  }, [loadAssets, loadStats]);

  const handleUpload = async (file: UploadFile) => {
    if (!file || !(file as unknown as { originFileObj: File }).originFileObj) return;
    setUploading(true);
    try {
      const res = await uploadAssets(
        (file as unknown as { originFileObj: File }).originFileObj
      );
      message.success(res.message);
      loadAssets(1);
      loadStats();
    } catch (err: unknown) {
      const errMsg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "上传失败";
      message.error(errMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAsset(id);
      message.success("删除成功");
      loadAssets(page);
      loadStats();
    } catch {
      message.error("删除失败");
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000) return `¥${(price / 10000).toFixed(1)}万`;
    return `¥${price.toFixed(0)}`;
  };

  const columns = [
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      width: 250,
      ellipsis: true,
    },
    {
      title: "类别",
      dataIndex: "category",
      key: "category",
      width: 100,
      render: (v: string) => v ? <Tag>{v}</Tag> : "-",
    },
    {
      title: "所在地",
      dataIndex: "location",
      key: "location",
      width: 150,
      ellipsis: true,
    },
    {
      title: "起拍价",
      dataIndex: "starting_price",
      key: "starting_price",
      width: 120,
      render: (v: number) => (v > 0 ? formatPrice(v) : "-"),
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (v: string) => (
        <Tag color={v === "正在拍卖" ? "red" : "blue"}>{v}</Tag>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 80,
      render: (_: unknown, record: Asset) => (
        <Popconfirm title="确定删除此资产？" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" danger icon={<DeleteOutlined />} size="small">
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={4}>📦 资产管理</Title>

      <Card style={{ marginBottom: 16 }}>
        <Space size="large">
          <Statistic
            title="资产总数"
            value={totalAssets}
            prefix={<DatabaseOutlined />}
          />
          <Upload
            accept=".xlsx,.xls"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={(info) => {
              if (info.file) handleUpload(info.file);
            }}
          >
            <Button type="primary" icon={<UploadOutlined />} loading={uploading}>
              导入Excel
            </Button>
          </Upload>
          <Button icon={<ReloadOutlined />} onClick={() => loadAssets(page)}>
            刷新
          </Button>
        </Space>
      </Card>

      <Table
        dataSource={assets}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (p) => loadAssets(p),
        }}
      />
    </div>
  );
}
