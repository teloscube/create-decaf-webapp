import { Col, Row, Space, Typography } from "antd";

export default function Home() {
  return (
    <Space direction="vertical" size={"middle"} style={{ width: "100%" }}>
      <Row gutter={12} align="middle" justify={"center"}>
        <Col span={6} style={{ textAlign: "center" }}>
          <Typography.Title level={3}>Learn DECAF</Typography.Title>
          <Typography.Link style={{ fontSize: '1.3em' }} href="https://docs.decafhub.com" target={'_blank'}>
            Documentation
          </Typography.Link>
        </Col>
      </Row>
    </Space>
  );
}
