import { GlobalOutlined } from "@ant-design/icons";
import { Button, Layout, Menu, MenuProps } from "antd";
import Cookies from "js-cookie";
import { useState } from "react";
import { Link } from "react-router-dom";
import "./style.scss";
import { useTranslation } from "react-i18next";
import i18n from "../../pages/translation/i18n";

const { Header } = Layout;

export function MainHeader() {
  const [current, setCurrent] = useState(Cookies.get("i18next") || "jp");

  const { t } = useTranslation();
  const languageItems: MenuProps["items"] = [
    {
      label: "",
      key: "SubMenu",
      icon: <GlobalOutlined className="icon" />,
      children: [
        {
          label: t("header.language.jp"),
          key: "jp",
        },
        {
          label: t("header.language.en"),
          key: "en",
        },
      ],
    },
  ];

  const menuItems = () => {
    return [
      {
        label: t("header.pointHistory"),
        to: "/points-history",
        key: "/points-history",
      },
      {
        label: t("header.transactionHistory"),
        to: "/transaction-history",
        key: "/transaction-history",
      },
      {
        label: t("header.statistical"),
        to: "/statistical",
        key: "/statistical",
      },
    ];
  };

  const setCookie = (username: string, value: string, expires: number) => {
    const date = new Date();
    date.setTime(date.getTime() + expires);
    Cookies.set(username, value, { expires: date, path: "/" });
  };

  const onClick: MenuProps["onClick"] = (e) => {
    i18n.changeLanguage(e.key);
    setCurrent(e.key);
    setCookie("i18next", e.key, 31536000000);
  };

  const logOut = () => {
    Cookies.remove("token");
    Cookies.remove("i18next");
    window.location.href = "/login";
  };

  const items = menuItems().map((item, index) => ({
    key: item.key,
    label: (
      <Link to={item.to} className="text">
        {item.label}
      </Link>
    ),
  }));

  return (
    <Header className="header">
      <Menu
        mode="horizontal"
        defaultSelectedKeys={[
          !window.location.pathname || window.location.pathname === "/"
            ? "/points-history"
            : window.location.pathname,
        ]}
        className="menu"
        items={items}
      ></Menu>
      <div className="menu__left-menu">
        <Menu
          onClick={onClick}
          selectedKeys={[current]}
          mode="horizontal"
          items={languageItems}
          className="menu__left-menu__dropmenu"
        />
        <Button className="button" onClick={logOut}>
          <span className="text">{t("header.logout")}</span>
        </Button>
      </div>
    </Header>
  );
}
