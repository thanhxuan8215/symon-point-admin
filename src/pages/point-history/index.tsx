import {
  Button,
  DatePicker,
  Form,
  Input,
  notification,
  Pagination,
  Select,
  Spin,
  Table,
} from "antd";
import moment from "moment";
import { Fragment, useEffect } from "react";
import React, { useState } from "react";
import api from "../../api";
import "./style.scss";
import { useTranslation } from "react-i18next";
import { DownloadOutlined } from "@ant-design/icons";
import { CSVLink } from "react-csv";

const { RangePicker } = DatePicker;

export default function PointHistoryPage() {
  const { t } = useTranslation();
  const POINT_HISTORY_API = `points/logs`;
  const DOWNLOAD_POINT_HISTORY_API = `points/logs/all`;
  const [form] = Form.useForm();
  const [pointLogs, setPointLogs] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<any>({
    offset: 0,
    limit: 10,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  const [csvData, setCsvData] = useState<any>([]);
  const [csvLinkEl] = useState<any>(React.createRef());

  const getPointLogs = async () => {
    try {
      const response = await api.get(`${POINT_HISTORY_API}`, {
        params: filter,
      });
      const { pointLogs, count } = response.data;
      setPointLogs(pointLogs);
      setPagination({ ...pagination, total: count });
      setLoading(false);
    } catch (err) {
      notification.error({
        message: t("error.message"),
        description: t("error.description"),
      });
      setPointLogs([]);
    }
  };

  useEffect(() => {
    setLoading(true);
    getPointLogs();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (form: any) => {
    setLoading(true);
    setFilter({
      ...filter,
      appId: +form.appId || undefined,
      deviceId: form.deviceId || undefined,
      type: form.type || undefined,
      customerId: form.customerId || undefined,
      startTime: form.dates && form.dates[0]["$d"],
      endTime: form.dates && form.dates[1]["$d"],
    });
  };

  const formatType = (value: string) => {
    return t(`pointHistory.table.content.type.${value}`);
  };

  const formatApp = (value: number) => {
    return value === 2
      ? t("pointHistory.table.content.system.kaiin")
      : t("pointHistory.table.content.system.kameiten");
  };

  const renderSearch = () => {
    return (
      <Form
        form={form}
        className="search"
        onFinish={handleSearch}
        disabled={loading}
      >
        <div style={{ display: "grid" }}>
          <div style={{ display: "inline-flex" }}>
            <Form.Item name="appId" className="search__select">
              <Select
                placeholder={t("pointHistory.fromConnection.placeholder")}
                showSearch
              >
                <Select.Option value="2">
                  {t("pointHistory.fromConnection.kaiin")}
                </Select.Option>
                <Select.Option value="999">
                  {t("pointHistory.fromConnection.kameiten")}
                </Select.Option>
                <Select.Option value="">
                  {t("pointHistory.fromConnection.all")}
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="deviceId" className="search__input">
              <Input
                placeholder={t("pointHistory.deviceId.placeholder") || ""}
              />
            </Form.Item>
            <Form.Item name="customerId" className="search__input">
              <Input
                placeholder={t("pointHistory.customerId.placeholder") || ""}
              />
            </Form.Item>
            <Form.Item name="type" className="search__select">
              <Select
                placeholder={t("pointHistory.type.placeholder")}
                showSearch
              >
                <Select.Option value="init">
                  {t("pointHistory.type.init")}
                </Select.Option>
                <Select.Option value="grant">
                  {t("pointHistory.type.grant")}
                </Select.Option>
                <Select.Option value="attach">
                  {t("pointHistory.type.attach")}
                </Select.Option>
                <Select.Option value="exchange">
                  {t("pointHistory.type.exchange")}
                </Select.Option>
                <Select.Option value="detach">
                  {t("pointHistory.type.detach")}
                </Select.Option>
                <Select.Option value="cansel">
                  {t("pointHistory.type.cansel")}
                </Select.Option>
                <Select.Option value="expired">
                  {t("pointHistory.type.expired")}
                </Select.Option>
                <Select.Option value="">
                  {t("pointHistory.type.all")}
                </Select.Option>
              </Select>
            </Form.Item>
          </div>
          <div style={{ display: "inline-flex" }}>
            <Form.Item name="dates">
              <RangePicker
                showTime={{ format: "HH:mm" }}
                format="YYYY-MM-DD HH:mm"
                placeholder={[
                  t("pointHistory.startTime.placeholder"),
                  t("pointHistory.endTime.placeholder"),
                ]}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                className="search__button search__input"
                htmlType="submit"
              >
                {t("search")}
              </Button>
            </Form.Item>
            <Button
              type="primary"
              className="search__button"
              htmlType="submit"
              icon={<DownloadOutlined />}
              onClick={downloadPointLogs}
              disabled={loading}
            >
              {t("downloadCSV")}
            </Button>
            <CSVLink
              headers={headers}
              filename={fileNameCSV}
              className="hidden search__input"
              data={csvData}
              ref={csvLinkEl}
              target="_blank"
            />
          </div>
        </div>
      </Form>
    );
  };

  const formatDate = (value: string) => {
    const data = moment(value).format("YYYY/MM/DD HH:mm:ss");
    return (
      <Fragment>
        {data.split(" ").map((line, index) => (
          <Fragment key={index}>
            {line}
            <br />
          </Fragment>
        ))}
      </Fragment>
    );
  };

  const columns = [
    {
      title: t("pointHistory.table.header.time"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: formatDate,
    },
    {
      title: t("pointHistory.table.header.system"),
      dataIndex: "appId",
      key: "appId",
      render: formatApp,
    },
    {
      title: t("pointHistory.table.header.deviceId"),
      dataIndex: "deviceId",
      key: "deviceId",
    },
    {
      title: t("pointHistory.table.header.customerId"),
      dataIndex: ["point", "customerId"],
      key: "customerId",
    },
    {
      title: t("pointHistory.table.header.type"),
      dataIndex: "type",
      key: "type",
      render: formatType,
    },
    {
      title: t("pointHistory.table.header.amount"),
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: t("pointHistory.table.header.balance"),
      dataIndex: "balance",
      key: "balance",
    },
    {
      title: t("pointHistory.table.header.expiration"),
      dataIndex: ["point", "expireAt"],
      key: "expireAt",
      render: formatDate,
    },
  ];

  const onChange = (page: number, pageSize: number) => {
    setPagination({ ...pagination, page });
    setFilter({
      ...filter,
      offset: (page - 1) * pagination.pageSize,
      limit: pagination.pageSize,
    });
  };

  const headers = [
    { label: t("pointHistory.table.header.time"), key: "createdAt" },
    { label: t("pointHistory.table.header.system"), key: "system" },
    { label: t("pointHistory.table.header.deviceId"), key: "deviceId" },
    { label: t("pointHistory.table.header.customerId"), key: "customerId" },
    { label: t("pointHistory.table.header.type"), key: "type" },
    { label: t("pointHistory.table.header.amount"), key: "amount" },
    { label: t("pointHistory.table.header.balance"), key: "balance" },
    { label: t("pointHistory.table.header.expiration"), key: "expireAt" },
  ];

  const downloadPointLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get(`${DOWNLOAD_POINT_HISTORY_API}`);
      let pointLogs = response.data;
      pointLogs = pointLogs.map((log: any) => {
        return {
          createdAt: moment(log.createdAt).format("YYYY/MM/DD HH:MM:SS"),
          system: formatApp(log.appId),
          deviceId: log.deviceId,
          customerId: log.point.customerId,
          type: formatType(log.type),
          amount: log.amount,
          balance: log.point.balance,
          expireAt: moment(log.point.expireAt).format("YYYY/MM/DD HH:MM:SS"),
        };
      });
      setCsvData(pointLogs);
      setTimeout(() => {
        setLoading(false);
        csvLinkEl.current.link.click();
      });
    } catch (err) {
      notification.error({
        message: t("error.message"),
        description: t("error.description"),
      });
      setCsvData([]);
    }
  };
  const fileNameCSV = `${t("pointHistory.title")}.csv`;

  return (
    <div className="point-history">
      <div className="point-history__title">{t("pointHistory.title")}</div>
      {renderSearch()}
      <Table
        columns={columns}
        className="table-striped-rows"
        dataSource={pointLogs}
        pagination={false}
        rowKey="id"
        scroll={{ y: `calc(100vh - 430px)` }}
        loading={{ indicator: <Spin size="large" />, spinning: loading }}
      />
      <Pagination
        current={pagination.page}
        onChange={onChange}
        total={pagination.total}
        disabled={loading}
        showSizeChanger={false}
      />
    </div>
  );
}
