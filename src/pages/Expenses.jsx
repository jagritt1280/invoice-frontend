import { useEffect, useState } from 'react';
import {
    Table, Button, Modal, Form, Input,
    Select, DatePicker, InputNumber,
    Typography, Popconfirm,
    message, Card, Row, Col, Statistic, Tag
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../api/axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

// category colors
const categoryColors = {
    TRAVEL: 'blue',
    FOOD: 'orange',
    UTILITIES: 'cyan',
    RENT: 'purple',
    SALARIES: 'green',
    MARKETING: 'magenta',
    SOFTWARE: 'geekblue',
    HARDWARE: 'volcano',
    MISCELLANEOUS: 'default'
};

const categories = [
    'TRAVEL', 'FOOD', 'UTILITIES', 'RENT',
    'SALARIES', 'MARKETING', 'SOFTWARE',
    'HARDWARE', 'MISCELLANEOUS'
];

export default function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/expenses');
            setExpenses(res.data.data || []);
        } catch(err) {
            message.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                ...values,
                date: values.date.format('YYYY-MM-DD')
            };

            await api.post('/api/expenses', payload);
            message.success('Expense added successfully!');
            setModalOpen(false);
            form.resetFields();
            fetchExpenses();

        } catch(err) {
            message.error(
                err.response?.data?.message || 'Failed to add expense'
            );
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/api/expenses/${id}`);
            message.success('Expense deleted');
            fetchExpenses();
        } catch(err) {
            message.error('Delete failed');
        }
    };

    // calculate totals
    const totalExpenses = expenses.reduce(
        (sum, e) => sum + Number(e.amount), 0
    );

    // expenses by category
    const byCategory = expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
        return acc;
    }, {});

    const topCategory = Object.entries(byCategory)
        .sort((a, b) => b[1] - a[1])[0];

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            filters: categories.map(c => ({ text: c, value: c })),
            onFilter: (value, record) => record.category === value,
            render: (cat) => (
                <Tag color={categoryColors[cat]}>{cat}</Tag>
            )
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            sorter: (a, b) => a.amount - b.amount,
            render: (amount) => (
                <Text strong style={{ color: '#cf1322' }}>
                    ₹{Number(amount).toLocaleString()}
                </Text>
            )
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            sorter: (a, b) => new Date(a.date) - new Date(b.date)
        },
        {
            title: 'Notes',
            dataIndex: 'notes',
            key: 'notes',
            render: (notes) => notes || '—'
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Popconfirm
                    title="Delete this expense?"
                    onConfirm={() => handleDelete(record.id)}
                >
                    <Button
                        icon={<DeleteOutlined />}
                        size="small"
                        danger
                    />
                </Popconfirm>
            )
        }
    ];

    return (
        <div>
            <Row justify="space-between" align="middle"
                 style={{ marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>
                    Expenses
                </Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalOpen(true)}
                >
                    Add Expense
                </Button>
            </Row>

            {/* Summary Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12}>
                    <Card>
                        <Statistic
                            title="Total Expenses"
                            value={totalExpenses}
                            formatter={(v) =>
                                `₹${Number(v).toLocaleString()}`
                            }
                            styles={{ value: { color: '#cf1322' } }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card>
                        <Statistic
                            title="Top Category"
                            value={topCategory
                                ? `${topCategory[0]}`
                                : 'None'
                            }
                            suffix={topCategory
                                ? `₹${Number(topCategory[1])
                                    .toLocaleString()}`
                                : ''
                            }
                        />
                    </Card>
                </Col>
            </Row>

            {/* Expenses Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={expenses}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    locale={{
                        emptyText: 'No expenses yet'
                    }}
                />
            </Card>

            {/* Add Expense Modal */}
            <Modal
                title="Add New Expense"
                open={modalOpen}
                onOk={handleCreate}
                onCancel={() => {
                    setModalOpen(false);
                    form.resetFields();
                }}
                okText="Add Expense"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{
                            required: true,
                            message: 'Title is required'
                        }]}
                    >
                        <Input placeholder="AWS Server Bill" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="category"
                                label="Category"
                                rules={[{
                                    required: true,
                                    message: 'Select category'
                                }]}
                            >
                                <Select placeholder="Select category">
                                    {categories.map(c => (
                                        <Option key={c} value={c}>
                                            <Tag color={categoryColors[c]}>
                                                {c}
                                            </Tag>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="amount"
                                label="Amount"
                                rules={[{
                                    required: true,
                                    message: 'Amount is required'
                                }]}
                            >
                                <InputNumber
                                    min={0}
                                    style={{ width: '100%' }}
                                    prefix="₹"
                                    placeholder="5000"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="date"
                        label="Date"
                        rules={[{
                            required: true,
                            message: 'Date is required'
                        }]}
                        initialValue={dayjs()}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="notes" label="Notes">
                        <Input.TextArea
                            placeholder="Additional notes..."
                            rows={2}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}