'use client'; 

import '@ant-design/v5-patch-for-react-19';

import { AntdProvider } from "@/lib/antd";
import { Layout, Typography } from "antd";
import React from "react";

const { Header, Content } = Layout;
const { Title } = Typography;

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AntdProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center', backgroundColor: '#001529' }}>
          <Title level={3} style={{ color: 'white', margin: 0 }}>Studio MIA - A Recreativa</Title>
        </Header>
        <Content style={{ padding: '24px 48px' }}>
          {children}
        </Content>
      </Layout>
    </AntdProvider>
  );
}