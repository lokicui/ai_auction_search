import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";
import { MessageOutlined, SettingOutlined } from "@ant-design/icons";
import ChatPage from "./pages/ChatPage";
import AdminPage from "./pages/AdminPage";

const { Header, Content } = Layout;

function Nav() {
  const location = useLocation();
  const selected = location.pathname === "/admin" ? "admin" : "chat";

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        background: "#001529",
        padding: "0 24px",
      }}
    >
      <div
        style={{
          color: "#fff",
          fontSize: 18,
          fontWeight: 700,
          marginRight: 32,
          whiteSpace: "nowrap",
        }}
      >
        🔍 AI拍卖搜索
      </div>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[selected]}
        items={[
          {
            key: "chat",
            icon: <MessageOutlined />,
            label: <Link to="/">智能搜索</Link>,
          },
          {
            key: "admin",
            icon: <SettingOutlined />,
            label: <Link to="/admin">资产管理</Link>,
          },
        ]}
        style={{ flex: 1, minWidth: 0 }}
      />
    </Header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout style={{ minHeight: "100vh" }}>
        <Nav />
        <Content>
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Content>
      </Layout>
    </BrowserRouter>
  );
}
