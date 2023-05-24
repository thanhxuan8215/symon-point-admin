import { Layout } from "antd";
import {} from "antd/es/layout/layout";
import { ReactNode } from "react";
import { MainHeader } from "./header";

import "./style.scss";

const { Content } = Layout;

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <Layout>
      <MainHeader></MainHeader>
      <Content className="content">{children}</Content>
    </Layout>
  );
}
