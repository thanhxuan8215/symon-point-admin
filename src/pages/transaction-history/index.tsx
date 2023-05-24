import { CopyOutlined } from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Form,
  Input,
  notification,
  Pagination,
  Popover,
  Select,
  Spin,
  Table,
} from "antd";
import moment from "moment";
import React, { Fragment, useEffect, useState } from "react";
import api from "../../api";
import "./style.scss";
import { useTranslation } from "react-i18next";
import { DownloadOutlined } from "@ant-design/icons";
import { CSVLink } from "react-csv";

const { RangePicker } = DatePicker;

export default function TranisactionHistoyPage() {
  const TRANSACTION_HISTORY_API = `points/transactions`;
  const DOWNLOAD_TRANSACTION_HISTORY_API = `points/transactions/all`;
  const [form] = Form.useForm();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { t } = useTranslation();
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

  const getTransactions = async () => {
    try {
      const response = await api.get(`${TRANSACTION_HISTORY_API}`, {
        params: filter,
      });
      const { transactions, count } = response.data;
      setTransactions(transactions);
      setPagination({ ...pagination, total: count });
      setLoading(false);
    } catch (err) {
      notification.error({
        message: t("error.message"),
        description: t("error.description"),
      });
      setTransactions([]);
    }
  };

  useEffect(() => {
    setLoading(true);
    getTransactions();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (form: any) => {
    setLoading(true);
    setFilter({
      ...filter,
      txHash: form.txHash || undefined,
      type: form.type || undefined,
      status: form.status || undefined,
      startTime: form.dates && form.dates[0]["$d"],
      endTime: form.dates && form.dates[1]["$d"],
    });
  };

  const formatType = (value: string) => {
    return t(`transactionsHistory.table.content.type.${value}`);
  };

  const formatStatus = (value: string) => {
    return t(`transactionsHistory.table.content.status.${value}`);
  };

  const renderSearch = () => {
    return (
      <Form
        onFinish={handleSearch}
        form={form}
        className="search"
        disabled={loading}
      >
        <div style={{ display: "grid" }}>
          <div style={{ display: "inline-flex" }}>
            <Form.Item name="txHash" style={{ marginRight: "10px" }}>
              <Input
                placeholder={t("transactionsHistory.txHash.placeholder") || ""}
              />
            </Form.Item>
            <Form.Item name="type" className="search__select search__input">
              <Select
                placeholder={t("transactionsHistory.type.placeholder")}
                showSearch
              >
                <Select.Option value="mint">
                  {t("transactionsHistory.type.mint")}
                </Select.Option>
                <Select.Option value="burn">
                  {t("transactionsHistory.type.burn")}
                </Select.Option>
                <Select.Option value="">
                  {t("transactionsHistory.type.all")}
                </Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="status" className="search__select search__input">
              <Select
                placeholder={t("transactionsHistory.status.placeholder")}
                showSearch
              >
                <Select.Option value="submitted">
                  {t("transactionsHistory.status.submitted")}
                </Select.Option>
                <Select.Option value="confirmed">
                  {t("transactionsHistory.status.confirmed")}
                </Select.Option>
                <Select.Option value="failed">
                  {t("transactionsHistory.status.failed")}
                </Select.Option>
                <Select.Option value="">
                  {t("transactionsHistory.status.all")}
                </Select.Option>
              </Select>
            </Form.Item>
          </div>
          <div style={{ display: "inline-flex" }}>
            <Form.Item name="dates" className="search__rangerpicker">
              <RangePicker
                showTime={{ format: "HH:mm" }}
                format="YYYY-MM-DD HH:mm"
                placeholder={[
                  t("transactionsHistory.startTime.placeholder"),
                  t("transactionsHistory.endTime.placeholder"),
                ]}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                className="search__button"
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
              onClick={downloadTxs}
              disabled={loading}
            >
              {t("downloadCSV")}
            </Button>
            <CSVLink
              headers={headers}
              filename={fileNameCSV}
              className="hidden"
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
    if (!value) {
      return "";
    }
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

  const copyToClipboard = async (value: string) => {
    navigator.clipboard.writeText(value);
  };

  const copyClick = (value: string) => {
    return (
      <div>
        {value}
        <Button
          style={{ margin: "0px 10px" }}
          onClick={() => copyToClipboard(value)}
        >
          <CopyOutlined />
        </Button>
      </div>
    );
  };

  const formatShortText = (value: string) => {
    return (
      <Popover content={copyClick(value)} placement="bottom" trigger="hover">
        <div className="text">{value}</div>
      </Popover>
    );
  };

  const columns = [
    {
      title: t("transactionsHistory.table.header.time"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: formatDate,
    },
    {
      title: t("transactionsHistory.table.header.blockNumber"),
      dataIndex: "blockNumber",
      key: "blockNumber",
    },
    {
      title: t("transactionsHistory.table.header.blockHash"),
      dataIndex: "blockHash",
      key: "blockHash",
      render: formatShortText,
    },
    {
      title: t("transactionsHistory.table.header.txHash"),
      dataIndex: "txid",
      key: "txid",
      render: formatShortText,
    },
    {
      title: t("transactionsHistory.table.header.toAddress"),
      dataIndex: "toAddress",
      key: "toAddress",
      render: formatShortText,
    },
    {
      title: t("transactionsHistory.table.header.amount"),
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: t("transactionsHistory.table.header.fee"),
      dataIndex: "fee",
      key: "fee",
    },
    {
      title: t("transactionsHistory.table.header.type"),
      dataIndex: "type",
      key: "type",
      render: (value: string) => (
        <div style={{ textTransform: "capitalize" }}>{formatType(value)}</div>
      ),
    },
    {
      title: t("transactionsHistory.table.header.status"),
      dataIndex: "status",
      key: "status",
      render: (value: string) => (
        <div style={{ textTransform: "capitalize" }}>{formatStatus(value)}</div>
      ),
    },
    {
      title: t("transactionsHistory.table.header.scan"),
      dataIndex: "txid",
      key: "txid",
      render: (value: string) => (
        <a
          style={{ fontSize: "30px" }}
          href={`${process.env.REACT_APP_EXPLORER_URL}/tx/${value}`}
          target="_blank"
          rel="noreferrer"
        >
          🔗
        </a>
      ),
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
    { label: t("transactionsHistory.table.header.time"), key: "createdAt" },
    {
      label: t("transactionsHistory.table.header.blockNumber"),
      key: "blockNumber",
    },
    {
      label: t("transactionsHistory.table.header.blockHash"),
      key: "blockHash",
    },
    { label: t("transactionsHistory.table.header.txHash"), key: "txHash" },
    {
      label: t("transactionsHistory.table.header.toAddress"),
      key: "toAddress",
    },
    { label: t("transactionsHistory.table.header.amount"), key: "amount" },
    { label: t("transactionsHistory.table.header.fee"), key: "fee" },
    { label: t("transactionsHistory.table.header.type"), key: "type" },
    { label: t("transactionsHistory.table.header.status"), key: "status" },
    { label: t("transactionsHistory.table.header.scan"), key: "scan" },
  ];

  const downloadTxs = async () => {
    try {
      setLoading(true);
      const response = await api.get(`${DOWNLOAD_TRANSACTION_HISTORY_API}`);
      let txs = response.data;
      txs = txs.map((tx: any) => {
        return {
          blockTime: tx.createdAt
            ? moment(tx.createdAt).format("YYYY/MM/DD HH:mm:ss")
            : "",
          blockNumber: tx.blockNumber,
          blockHash: tx.blockHash,
          txHash: tx.txid,
          toAddress: tx.toAddress,
          amount: tx.amount,
          fee: tx.fee,
          type: formatType(tx.type),
          status: formatStatus(tx.status),
          scan: `${process.env.REACT_APP_EXPLORER_URL}/tx/${tx.txid}`,
        };
      });
      setCsvData(txs);
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

  const fileNameCSV = `${t("transactionsHistory.title")}.csv`;

  return (
    <Fragment>
      <div className="transaction-history">
        <div className="transaction-history__title">
          {t("transactionsHistory.title")}
        </div>
        {renderSearch()}
        <Table
          columns={columns}
          dataSource={transactions}
          className="table-striped-rows"
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
    </Fragment>
  );
}
