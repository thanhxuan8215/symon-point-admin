import { Button, Form, Input, message } from "antd";
import Cookies from "js-cookie";
import api from "../../api";
import "./style.scss";

interface User {
  username: string;
  password: string;
}

interface ErrorType {
  response: {
    status?: number;
    data: {
      message: [{ field: string; message: string }];
    };
  };
}

export default function LoginPage() {
  const [form] = Form.useForm();

  const onFinish = (values: User) => {
    api
      .post("/auth/login", values)
      .then((res) => {
        const { access_token: token } = res.data;
        setCookie("token", token, 31536000000);
        window.location.href = "/points-history";
      })
      .catch((errors) => handleError(errors));
  };

  const handleError = (err: ErrorType) => {
    const mess = "ログインに失敗しました";
    if (err.response) {
      switch (err.response.status) {
        case 400:
          const errors = err.response.data.message;
          errors.forEach((item) => {
            const setFields = [{ name: item.field }];
            form.setFields(setFields);
            message.error(item.message);
          });
          break;
        case 401:
          message.error("ユーザー名かパスワードが無効");
          break;
        case 404:
          message.error("見つかりません");
          break;
        case 500:
          message.error(mess);
          break;
        default:
          message.error(mess);
          break;
      }
    } else {
      message.error("ログイン要求に失敗しました");
    }
  };

  const setCookie = (username: string, value: string, expires: number) => {
    const date = new Date();
    date.setTime(date.getTime() + expires);
    Cookies.set(username, value, { expires: date, path: "/" });
  };

  return (
    <div className="container">
      <div className="login">
        <div className="login__title">システムにログインします。</div>
        <Form
          form={form}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onFinish={onFinish}
          autoComplete="off"
          layout="horizontal"
        >
          <Form.Item
            label="ログインID"
            name="username"
            rules={[
              {
                required: true,
                message: "ユーザー名を入力してください。",
              },
            ]}
          >
            <Input placeholder="ID" />
          </Form.Item>
          <Form.Item
            label="パスワード"
            name="password"
            rules={[
              {
                required: true,
                message: "パスワードを入力してください。",
              },
            ]}
          >
            <Input.Password placeholder="パスワード" />
          </Form.Item>
          <Form.Item wrapperCol={{ span: 24 }}>
            <Button htmlType="submit" type="primary">
              ログイン
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
