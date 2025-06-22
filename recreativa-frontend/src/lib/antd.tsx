'use client';

import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, App as AntdApp } from 'antd';
import ptBR from 'antd/locale/pt_BR';

export const AntdProvider = ({ children }: { children: React.ReactNode }) => (
  <AntdRegistry>
    <ConfigProvider locale={ptBR}>
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  </AntdRegistry>
);