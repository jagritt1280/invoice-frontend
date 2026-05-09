import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const { Title, Text } = Typography;

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const handleSubmit = async (values) => {
        try {
            const response = await api.post('/auth/login', values);
            const { token, name, email } = response.data.data;

            login({ name, email }, token);
            // store in context + localStorage

            message.success('Welcome back, ' + name + '!');
            navigate('/dashboard');

        } catch(error) {
            message.error(
                error.response?.data?.message || 'Login failed'
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
                    <Text type="secondary">Sign in to your account</Text>
                </div>

                <Form form={form} onFinish={handleSubmit} layout="vertical">
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: 'Email is required' },
                            { type: 'email', message: 'Invalid email' }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Email"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Password is required' }]}
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
                            Sign In
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center' }}>
                        <Text>Don't have an account? </Text>
                        <Link to="/register">Register</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
}