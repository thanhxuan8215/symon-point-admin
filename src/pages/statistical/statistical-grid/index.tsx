import { Button, DatePicker, Form, Input, Pagination, Spin, Table } from "antd";
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./style.scss";
import { DownloadOutlined } from "@ant-design/icons";
import { CSVLink } from "react-csv";

const { RangePicker } = DatePicker;

export default function StatisticalGrid({
  keyColumn,
  dataSource,
  onClick,
  getItems,
  total,
  isShowDates = true,
  loading,
  onDownload,
  csvData,
  headers,
  csvLinkEl,
}: any) {
  const [form] = Form.useForm();
  const load = loading;
  const { t } = useTranslation();

  const [filter, setFilter] = useState<any>({
    offset: 0,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  });

  const columns = [
    {
      title: t("statistical.table.header.init"),
      dataIndex: "init",
      key: "init",
    },
    {
      title: t("statistical.table.header.grant"),
      dataIndex: "grant",
      key: "grant",
    },
    {
      title: t("statistical.table.header.attach"),
      dataIndex: "attach",
      key: "attach",
    },
    {
      title: t("statistical.table.header.exchange"),
      dataIndex: "exchange",
      key: "exchange",
    },
    {
      title: t("statistical.table.header.cansel"),
      dataIndex: "cansel",
      key: "cansel",
    },
    {
      title: t("statistical.table.header.detach"),
      dataIndex: "detach",
      key: "detach",
    },
    {
      title: t("statistical.table.header.expired"),
      dataIndex: "expired",
      key: "expired",
    },
    {
      title: t("statistical.table.header.total"),
      dataIndex: "total",
      key: "total",
    },
  ];

  useEffect(() => {
    getItems(filter);
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (form: any) => {
    setFilter({
      ...filter,
      [keyColumn.key]: form[keyColumn.key] || undefined,
      startTime: isShowDates ? form.dates && form.dates[0]["$d"] : undefined,
      endTime: isShowDates ? form.dates && form.dates[1]["$d"] : undefined,
    });
  };

  const renderSearch = (keyColumn: any) => {
    return (
      <Form
        form={form}
        className="search"
        onFinish={handleSearch}
        disabled={load}
      >
        <Form.Item name={keyColumn.key} className="search__input">
          <Input placeholder={keyColumn.title} />
        </Form.Item>
        {isShowDates ? (
          <Form.Item name="dates">
            <RangePicker
              showTime={{ format: "HH:mm" }}
              format="YYYY-MM-DD HH:mm"
              placeholder={[
                t("statistical.startTime.placeholder"),
                t("statistical.endTime.placeholder"),
              ]}
            />
          </Form.Item>
        ) : (
          <Fragment></Fragment>
        )}
        <Form.Item style={{ marginRight: "10px" }}>
          <Button type="primary" className="search__button" htmlType="submit">
            {t("search")}
          </Button>
        </Form.Item>
      </Form>
    );
  };

  const onChange = (page: number, pageSize: number) => {
    setPagination({ ...pagination, page });
    setFilter({
      ...filter,
      offset: (page - 1) * pagination.pageSize,
      limit: pagination.pageSize,
    });
  };

  const renderCSV = () => {
    if (!csvLinkEl) {
      return;
    }
    const fileNameCSV = `${t("statistical.title")}.csv`;
    return (
      <Fragment>
        <Button
          type="primary"
          className="search__button"
          htmlType="submit"
          icon={<DownloadOutlined />}
          onClick={onDownload}
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
      </Fragment>
    );
  };

  return (
    <div className="statistical-grid">
      <div style={{ display: "inline-flex" }}>
        {renderSearch(keyColumn)}
        {renderCSV()}
      </div>
      <Table
        columns={[keyColumn, ...columns]}
        dataSource={dataSource}
        className="table-striped-rows"
        rowKey={keyColumn.key}
        scroll={{ y: `calc(100vh - 475px)` }}
        loading={{ indicator: <Spin size="large" />, spinning: load }}
        onRow={(record, rowIndex) => {
          return {
            onClick: (event) => onClick(record),
          };
        }}
        pagination={false}
      />
      <Pagination
        current={pagination.page}
        onChange={onChange}
        pageSize={pagination.pageSize}
        total={total}
        disabled={load}
        showSizeChanger={false}
      />
    </div>
  );
}
