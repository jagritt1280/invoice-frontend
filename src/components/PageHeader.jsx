import { Row, Col, Typography, Button } from 'antd';

const { Title, Text } = Typography;

export default function PageHeader({
                                       title,
                                       subtitle,
                                       action,
                                       actionText,
                                       actionIcon
                                   }) {
    return (
        <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: 24 }}
        >
            <Col>
                <Title level={4} style={{ margin: 0 }}>
                    {title}
                </Title>
                {subtitle && (
                    <Text type="secondary">{subtitle}</Text>
                )}
            </Col>
            {action && (
                <Col>
                    <Button
                        type="primary"
                        icon={actionIcon}
                        onClick={action}
                    >
                        {actionText}
                    </Button>
                </Col>
            )}
        </Row>
    );
}