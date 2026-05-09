import { useEffect, useState } from 'react';
import {
    Table, Button, Modal, Form, Input,
    Space, Typography, Popconfirm,
    message, Card, Row, Avatar //Avatar
} from 'antd';
import {
    PlusOutlined, DeleteOutlined,
    EditOutlined, UserOutlined,
    SearchOutlined
} from '@ant-design/icons';
import api from '../api/axios';

const { Title, Text } = Typography;

export default function Clients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [searchText, setSearchText] = useState('');  // ← NEW
    const [form] = Form.useForm();

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/clients');
            setClients(res.data.data || []);
        } catch(err) {
            message.error('Failed to load clients');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if(editingClient) {
                await api.put(`/api/clients/${editingClient.id}`, values);
                message.success('Client updated successfully!');
            } else {
                await api.post('/api/clients', values);
                message.success('Client created successfully!');
            }

            setModalOpen(false);
            setEditingClient(null);
            form.resetFields();
            fetchClients();

        } catch(err) {
            message.error(
                err.response?.data?.message || 'Operation failed'
            );
        }
    };

    const handleEdit = (client) => {
        setEditingClient(client);
        form.setFieldsValue(client);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/api/clients/${id}`);
            message.success('Client deleted');
            fetchClients();
        } catch(err) {
            message.error(
                err.response?.data?.message || 'Delete failed'
            );
        }
    };

    const getInitials = (name) => {
        return name.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // ── NEW: filtered clients ────────────────────────────────
    const filteredClients = clients.filter(c =>
        c.name?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
        c.email?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
        c.companyName?.toLowerCase()
            .includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: 'Client',
            key: 'client',
            render: (_, record) => (
                <Space>
                    <Avatar style={{ background: '#1677ff' }}>
                        {getInitials(record.name)}
                    </Avatar>
                    <div>
                        <div>
                            <Text strong>{record.name}</Text>
                        </div>
                        <div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {record.companyName || '—'}
                            </Text>
                        </div>
                    </div>
                </Space>
            )
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email'
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            render: (phone) => phone || '—'
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Delete this client?"
                        description="All invoices for this client will also be deleted"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            {/* Header */}
            <Row justify="space-between" align="middle"
                 style={{ marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>
                    Clients
                </Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingClient(null);
                        form.resetFields();
                        setModalOpen(true);
                    }}
                >
                    Add Client
                </Button>
            </Row>

            <Card>
                {/* ── NEW: Search bar ── */}
                <Input
                    prefix={<SearchOutlined />}
                    placeholder="Search by name, email or company..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ marginBottom: 16, maxWidth: 400 }}
                    allowClear
                />

                <Table
                    columns={columns}
                    dataSource={filteredClients}  // ← changed
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    locale={{
                        emptyText: 'No clients yet — add your first one!'
                    }}
                />
            </Card>

            {/* Create/Edit Client Modal */}
            <Modal
                title={editingClient ? 'Edit Client' : 'Add New Client'}
                open={modalOpen}
                onOk={handleSubmit}
                onCancel={() => {
                    setModalOpen(false);
                    setEditingClient(null);
                    form.resetFields();
                }}
                okText={editingClient ? 'Update' : 'Add Client'}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Full Name"
                        rules={[{
                            required: true,
                            message: 'Name is required'
                        }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="John Smith"
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Email is required' },
                            { type: 'email', message: 'Invalid email' }
                        ]}
                    >
                        <Input placeholder="john@company.com" />
                    </Form.Item>

                    <Form.Item name="phone" label="Phone">
                        <Input placeholder="9999999999" />
                    </Form.Item>

                    <Form.Item name="companyName" label="Company Name">
                        <Input placeholder="Company Pvt Ltd" />
                    </Form.Item>

                    <Form.Item name="address" label="Address">
                        <Input.TextArea
                            placeholder="Full address"
                            rows={2}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}