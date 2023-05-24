import { Result } from "antd";

export default function NotFoundPage() {
  return (
    <Result
      status="404"
      title="404"
      subTitle="ご迷惑をかけて申し訳ございません。ページが見つかりませんでした。"
    />
  );
}
