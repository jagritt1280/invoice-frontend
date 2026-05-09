import { Card, Avatar, Typography,
    Descriptions, Button, message } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        message.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <Card>
                <div style={{
                    textAlign: 'center',
                    marginBottom: 24
                }}>
                    <Avatar
                        size={80}
                        style={{
                            background: '#1677ff',
                            fontSize: 32
                        }}
                    >
                        {user?.name?.[0]?.toUpperCase()}
                    </Avatar>
                    <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>
                        {user?.name}
                    </Title>
                    <Text type="secondary">{user?.email}</Text>
                </div>

                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Name">
                        {user?.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                        {user?.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Account Type">
                        Standard
                    </Descriptions.Item>
                </Descriptions>

                <Button
                    danger
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    style={{ marginTop: 24 }}
                    block
                >
                    Logout
                </Button>
            </Card>
        </div>
    );
}