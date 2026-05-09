import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const { Title, Text } = Typography;

export default function Register() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        try {
            const response = await api.post('/auth/register', values);
            const { token, name, email } = response.data.data;

            login({ name, email }, token);
            message.success('Account created successfully!');
            navigate('/dashboard');

        } catch(error) {
            message.error(
                error.response?.data?.message || 'Registration failed'
            );
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f0f2f5'
        }}>
            <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={2} style={{ color: '#1677ff', margin: 0 }}>
                        InvoiceApp
                    </Title>
                    <Text type="secondary">Create your account</Text>
                </div>

                <Form onFinish={handleSubmit} layout="vertical">
                    <Form.Item
                        name="name"
                        rules={[{ required: true, message: 'Name is required' }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Full Name"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Email is required' },
                            { type: 'email', message: 'Invalid email' }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder="Email"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Password is required' },
                            { min: 6, message: 'Min 6 characters' }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Password"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                        >
                            Create Account
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        <Text>Already have an account? </Text>
                        <Link to="/login">Sign in</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
}