import { Button, Modal, notification, Radio, RadioChangeEvent } from "antd";
import React, { useEffect, useState } from "react";
import api from "../../api";
import "./style.scss";
import StatisticalGrid from "./statistical-grid";
import { useTranslation } from "react-i18next";

const modalDataDefault = {
  isOpen: false,
  title: "",
  id: "",
  item: {},
};

export default function StatisticalPage() {
  type Option = keyof typeof option;
  type ModalOption = keyof typeof modalOption;

  const [type, setType] = useState<string>("store");
  const [dataSource, setDataSource] = useState([]);
  const [total, setTotal] = useState(0);
  const [modalData, setModalData] = useState<any>(modalDataDefault);
  const [loading, setLoading] = useState<boolean>(false);
  const [csvData, setCsvData] = useState<any>([]);
  const [csvHeaders, setCsvHeaders] = useState<any>([]);
  const [csvLinkEl] = useState<any>(React.createRef());

  const { t } = useTranslation();

  const [modalDataSource, setModalDataSource] = useState([]);
  const [modalTotal, setModalTotal] = useState(0);

  useEffect(() => {
    option[type as Option].getItems(undefined);
  }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  const getDevices = async (filter: any) => {
    try {
      setLoading(true);
      const response = await api.get("points/statistical/devices", {
        params: filter,
      });
      const { results, count } = response.data;
      setDataSource(results);
      setTotal(count);
      setLoading(false);
    } catch (err) {
      notification.error({
        message: t("error.message"),
        description: t("error.description"),
      });
      setLoading(false);
      setDataSource([]);
    }
  };

  const getCustomers = async (filter: any) => {
    try {
      setLoading(true);
      const response = await api.get("points/statistical/customers", {
        params: filter,
      });
      const { results, count } = response.data;
      setDataSource(results);
      setTotal(count);
      setLoading(false);
    } catch (err) {
      notification.error({
        message: t("error.message"),
        description: t("error.description"),
      });
      setLoading(false);
      setDataSource([]);
    }
  };

  const option = {
    store: {
      keyColumn: {
        title: t("statistical.device.placeholder"),
        dataIndex: "deviceId",
        key: "deviceId",
      },
      getItems: getDevices,
    },
    member: {
      keyColumn: {
        title: t("statistical.customer.placeholder"),
        dataIndex: "customerId",
        key: "customerId",
      },
      getItems: getCustomers,
    },
  };

  const getDevice = async (filter: any, id?: string) => {
    try {
      setLoading(true);
      const response = await api.get(`points/statistical/device`, {
        params: { ...filter, deviceId: id || modalData.id },
      });
      const { results, count } = response.data;
      setModalDataSource(results);
      setModalTotal(count);
      setLoading(false);
    } catch (err) {
      notification.error({
        message: t("error.message"),
        description: t("error.description"),
      });
      setLoading(false);
      setModalDataSource([]);
    }
  };

  const getCustomer = async (filter: any, id?: string) => {
    try {
      setLoading(true);
      const response = await api.get(
        `points/statistical/customer/${id || modalData.id}`,
        { params: filter }
      );
      const { results, count } = response.data;
      setModalDataSource(results);
      setModalTotal(count);
      setLoading(false);
    } catch (err) {
      notification.error({
        message: t("error.message"),
        description: t("error.description"),
      });
      setLoading(false);
      setModalDataSource([]);
    }
  };

  const modalOption = {
    store: {
      keyColumn: {
        title: t("statistical.customer.placeholder"),
        dataIndex: "customerId",
        key: "customerId",
      },
      getItems: getDevice,
    },
    member: {
      keyColumn: {
        title: t("statistical.device.placeholder"),
        dataIndex: "deviceId",
        key: "deviceId",
      },
      getItems: getCustomer,
    },
  };

  const setHeaders = () => {
    const key = type === "store" ? "deviceId" : "customerId";
    const result = [
      { label: t(`statistical.table.header.${key}`), key: `${key}` },
      { label: t("statistical.table.header.init"), key: "init" },
      { label: t("statistical.table.header.grant"), key: "grant" },
      { label: t("statistical.table.header.attach"), key: "attach" },
      { label: t("statistical.table.header.exchange"), key: "exchange" },
      { label: t("statistical.table.header.cansel"), key: "cansel" },
      { label: t("statistical.table.header.detach"), key: "detach" },
      { label: t("statistical.table.header.expired"), key: "expired" },
      { label: t("statistical.table.header.total"), key: "total" },
    ];
    setCsvHeaders(result);
  };

  const downloadDevices = async () => {
    try {
      setLoading(true);
      const response = await api.get(`points/statistical/devices/all`);
      const devices = response.data;
      setCsvData(devices);
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

  const downloadCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`points/statistical/customers/all`);
      const customers = response.data;
      setCsvData(customers);
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

  const onChangeType = (e: RadioChangeEvent) => {
    setType(e.target.value);
  };

  const onClick = (item: any) => {
    const { keyColumn } = option[type as Option];
    const id = item[`${keyColumn.key}`];
    setModalData({ ...modalData, id, title: keyColumn.title, isOpen: true });
    modalOption[type as ModalOption].getItems(undefined, id);
  };

  const onDownload = () => {
    if (type === "store") {
      downloadDevices();
    } else {
      downloadCustomers();
    }
    setHeaders();
  };

  return (
    <div className="statistical">
      <div className="statistical__title">{t("statistical.title")}</div>
      <div className="group">
        <Radio.Group
          className="radio"
          onChange={onChangeType}
          value={type}
          disabled={loading}
        >
          <Radio value="store">
            {t("statistical.header.store.placeholder")}
          </Radio>
          <Radio value="member">
            {t("statistical.header.member.placeholder")}
          </Radio>
        </Radio.Group>
        <StatisticalGrid
          keyColumn={option[type as Option].keyColumn}
          dataSource={dataSource}
          onClick={onClick}
          getItems={option[type as Option].getItems}
          total={total}
          loading={loading}
          onDownload={onDownload}
          csvData={csvData}
          headers={csvHeaders}
          csvLinkEl={csvLinkEl}
        ></StatisticalGrid>
      </div>
      <Modal
        centered
        open={modalData.isOpen}
        onCancel={() => {
          setModalData(modalDataDefault);
          setModalDataSource([]);
          setModalTotal(0);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setModalData(modalDataDefault);
              setModalDataSource([]);
              setModalTotal(0);
            }}
            style={{ backgroundColor: "#000000", color: "#FFF" }}
          >
            {t("statistical.table.footer.close")}
          </Button>,
        ]}
        width={1000}
        className="modal"
      >
        <div className="title">{`${modalData.title}: ${modalData.id}`}</div>
        <StatisticalGrid
          keyColumn={modalOption[type as ModalOption].keyColumn}
          dataSource={modalDataSource}
          getItems={modalOption[type as ModalOption].getItems}
          total={modalTotal}
          isShowDates={false}
          loading={loading}
        ></StatisticalGrid>
      </Modal>
    </div>
  );
}
