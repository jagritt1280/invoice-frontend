import { useEffect, useState } from 'react';
import {
    Table, Button, Modal, Form, Input, Select,
    DatePicker, InputNumber, Space, Tag, Typography,
    Popconfirm, message, Card, Row, Col, Divider,
    Statistic
} from 'antd';
import {
    PlusOutlined, DeleteOutlined,
    EyeOutlined, SearchOutlined
} from '@ant-design/icons';
import api from '../api/axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const statusColors = {
    DRAFT: 'default',
    SENT: 'blue',
    PAID: 'green',
    OVERDUE: 'red',
    CANCELLED: 'gray'
};

const nextStatuses = {
    DRAFT: ['SENT', 'CANCELLED'],
    SENT: ['PAID', 'OVERDUE', 'CANCELLED'],
    OVERDUE: ['PAID', 'CANCELLED'],
    PAID: [],
    CANCELLED: []
};

export default function Invoices() {
    const [invoices, setInvoices] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [searchText, setSearchText] = useState('');  // ← NEW
    const [form] = Form.useForm();
    const [items, setItems] = useState([
        { description: '', quantity: 1, unitPrice: 0 }
    ]);

    useEffect(() => {
        fetchInvoices();
        fetchClients();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/invoices');
            setInvoices(res.data.data || []);
        } catch(err) {
            message.error('Failed to load invoices');
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const res = await api.get('/api/clients');
            setClients(res.data.data || []);
        } catch(err) {
            message.error('Failed to load clients');
        }
    };

    const handleCreate = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                clientId: values.clientId,
                dueDate: values.dueDate.format('YYYY-MM-DD'),
                notes: values.notes || '',
                items: items.map(item => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice
                }))
            };
            await api.post('/api/invoices', payload);
            message.success('Invoice created successfully!');
            setModalOpen(false);
            form.resetFields();
            setItems([{ description: '', quantity: 1, unitPrice: 0 }]);
            fetchInvoices();
        } catch(err) {
            if(err.response?.data?.message)
                message.error(err.response.data.message);
        }
    };

    const handleStatusUpdate = async (invoiceId, newStatus) => {
        try {
            await api.patch(
                `/api/invoices/${invoiceId}/status?status=${newStatus}`
            );
            message.success(`Status updated to ${newStatus}`);
            fetchInvoices();
        } catch(err) {
            message.error(err.response?.data?.message || 'Update failed');
        }
    };

    const handleDelete = async (invoiceId) => {
        try {
            await api.delete(`/api/invoices/${invoiceId}`);
            message.success('Invoice deleted');
            fetchInvoices();
        } catch(err) {
            message.error(err.response?.data?.message || 'Delete failed');
        }
    };

    const addItem = () => setItems([...items,
        { description: '', quantity: 1, unitPrice: 0 }]);

    const removeItem = (index) =>
        setItems(items.filter((_, i) => i !== index));

    const updateItem = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;
        setItems(updated);
    };

    const calculateTotal = () =>
        items.reduce((sum, item) =>
            sum + (item.quantity * item.unitPrice), 0);

    // ── NEW: computed stats ──────────────────────────────────
    const totalAmount = invoices.reduce(
        (sum, inv) => sum + Number(inv.totalAmount), 0
    );
    const paidAmount = invoices
        .filter(inv => inv.status === 'PAID')
        .reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const overdueCount = invoices
        .filter(inv => inv.status === 'OVERDUE').length;

    // ── NEW: filtered invoices ───────────────────────────────
    const filteredInvoices = invoices.filter(inv =>
        inv.invoiceNumber?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
        inv.clientName?.toLowerCase()
            .includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: 'Invoice #',
            dataIndex: 'invoiceNumber',
            key: 'invoiceNumber',
            render: (text) => (
                <Text strong style={{ color: '#1677ff' }}>{text}</Text>
            )
        },
        {
            title: 'Client',
            dataIndex: 'clientName',
            key: 'clientName'
        },
        {
            title: 'Amount',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            render: (amount) => (
                <Text strong>₹{Number(amount).toLocaleString()}</Text>
            ),
            sorter: (a, b) => a.totalAmount - b.totalAmount
        },
        {
            title: 'Issue Date',
            dataIndex: 'issueDate',
            key: 'issueDate'
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (date, record) => (
                <Text type={
                    record.status === 'OVERDUE' ? 'danger' : 'default'
                }>
                    {date}
                </Text>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'Draft',   value: 'DRAFT' },
                { text: 'Sent',    value: 'SENT' },
                { text: 'Paid',    value: 'PAID' },
                { text: 'Overdue', value: 'OVERDUE' }
            ],
            onFilter: (value, record) => record.status === value,
            render: (status, record) => (
                <Space>
                    <Tag color={statusColors[status]}>{status}</Tag>
                    {nextStatuses[status]?.length > 0 && (
                        <Select
                            size="small"
                            placeholder="Update"
                            style={{ width: 100 }}
                            onChange={(val) =>
                                handleStatusUpdate(record.id, val)
                            }
                        >
                            {nextStatuses[status].map(s => (
                                <Option key={s} value={s}>{s}</Option>
                            ))}
                        </Select>
                    )}
                </Space>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => {
                            setSelectedInvoice(record);
                            setDetailOpen(true);
                        }}
                    />
                    <Popconfirm
                        title="Delete this invoice?"
                        description="This action cannot be undone"
                        onConfirm={() => handleDelete(record.id)}
                        disabled={record.status === 'PAID'}
                    >
                        <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            disabled={record.status === 'PAID'}
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
                    Invoices
                </Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalOpen(true)}
                >
                    New Invoice
                </Button>
            </Row>

            {/* ── NEW: Stats Cards ── */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Total Invoiced"
                            value={totalAmount}
                            formatter={v =>
                                `₹${Number(v).toLocaleString()}`
                            }
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Total Collected"
                            value={paidAmount}
                            formatter={v =>
                                `₹${Number(v).toLocaleString()}`
                            }
                            styles={{ value: { color: '#3f8600' } }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Overdue"
                            value={overdueCount}
                            styles={{
                                value: {
                                    color: overdueCount > 0
                                        ? '#cf1322'
                                        : '#3f8600'
                                }
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Invoices Table */}
            <Card>
                {/* ── NEW: Search bar ── */}
                <Input
                    prefix={<SearchOutlined />}
                    placeholder="Search by invoice number or client..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ marginBottom: 16, maxWidth: 400 }}
                    allowClear
                />

                <Table
                    columns={columns}
                    dataSource={filteredInvoices}  // ← changed
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    locale={{
                        emptyText: 'No invoices yet — create your first one!'
                    }}
                />
            </Card>

            {/* Create Invoice Modal */}
            <Modal
                title="Create New Invoice"
                open={modalOpen}
                onOk={handleCreate}
                onCancel={() => {
                    setModalOpen(false);
                    form.resetFields();
                    setItems([{
                        description: '', quantity: 1, unitPrice: 0
                    }]);
                }}
                width={700}
                okText="Create Invoice"
            >
                <Form form={form} layout="vertical">
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="clientId"
                                label="Client"
                                rules={[{
                                    required: true,
                                    message: 'Select a client'
                                }]}
                            >
                                <Select placeholder="Select client">
                                    {clients.map(c => (
                                        <Option key={c.id} value={c.id}>
                                            {c.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="dueDate"
                                label="Due Date"
                                rules={[{
                                    required: true,
                                    message: 'Select due date'
                                }]}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    disabledDate={(d) =>
                                        d && d < dayjs().startOf('day')
                                    }
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="notes" label="Notes">
                        <Input.TextArea
                            placeholder="Payment terms, notes..."
                            rows={2}
                        />
                    </Form.Item>

                    <Divider>Line Items</Divider>

                    <Row style={{ marginBottom: 8 }}>
                        <Col span={10}>
                            <Text strong>Description</Text>
                        </Col>
                        <Col span={4}>
                            <Text strong>Qty</Text>
                        </Col>
                        <Col span={5}>
                            <Text strong>Unit Price</Text>
                        </Col>
                        <Col span={4}>
                            <Text strong>Amount</Text>
                        </Col>
                    </Row>

                    {items.map((item, index) => (
                        <Row key={index} gutter={8}
                             style={{ marginBottom: 8 }}>
                            <Col span={10}>
                                <Input
                                    placeholder="Description"
                                    value={item.description}
                                    onChange={(e) => updateItem(
                                        index, 'description', e.target.value
                                    )}
                                />
                            </Col>
                            <Col span={4}>
                                <InputNumber
                                    min={1}
                                    value={item.quantity}
                                    onChange={(v) =>
                                        updateItem(index, 'quantity', v)
                                    }
                                    style={{ width: '100%' }}
                                />
                            </Col>
                            <Col span={5}>
                                <InputNumber
                                    min={0}
                                    value={item.unitPrice}
                                    onChange={(v) =>
                                        updateItem(index, 'unitPrice', v)
                                    }
                                    style={{ width: '100%' }}
                                    prefix="₹"
                                />
                            </Col>
                            <Col span={4}>
                                <Text>
                                    ₹{(item.quantity *
                                    item.unitPrice).toLocaleString()}
                                </Text>
                            </Col>
                            <Col span={1}>
                                {items.length > 1 && (
                                    <Button
                                        danger
                                        size="small"
                                        onClick={() => removeItem(index)}
                                    >
                                        ×
                                    </Button>
                                )}
                            </Col>
                        </Row>
                    ))}

                    <Button
                        type="dashed"
                        onClick={addItem}
                        block
                        icon={<PlusOutlined />}
                        style={{ marginTop: 8 }}
                    >
                        Add Line Item
                    </Button>

                    <Divider />

                    <Row justify="end">
                        <Text strong style={{ fontSize: 16 }}>
                            Total: ₹{calculateTotal().toLocaleString()}
                        </Text>
                    </Row>
                </Form>
            </Modal>

            {/* Invoice Detail Modal */}
            <Modal
                title={`Invoice ${selectedInvoice?.invoiceNumber}`}
                open={detailOpen}
                onCancel={() => setDetailOpen(false)}
                footer={null}
                width={600}
            >
                {selectedInvoice && (
                    <div>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Text type="secondary">Client</Text>
                                <div>
                                    <Text strong>
                                        {selectedInvoice.clientName}
                                    </Text>
                                </div>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary">Status</Text>
                                <div>
                                    <Tag color={
                                        statusColors[selectedInvoice.status]
                                    }>
                                        {selectedInvoice.status}
                                    </Tag>
                                </div>
                            </Col>
                            <Col span={12} style={{ marginTop: 12 }}>
                                <Text type="secondary">Issue Date</Text>
                                <div>
                                    <Text>{selectedInvoice.issueDate}</Text>
                                </div>
                            </Col>
                            <Col span={12} style={{ marginTop: 12 }}>
                                <Text type="secondary">Due Date</Text>
                                <div>
                                    <Text>{selectedInvoice.dueDate}</Text>
                                </div>
                            </Col>
                        </Row>

                        <Divider>Line Items</Divider>

                        <Table
                            dataSource={selectedInvoice.items || []}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            columns={[
                                {
                                    title: 'Description',
                                    dataIndex: 'description'
                                },
                                {
                                    title: 'Qty',
                                    dataIndex: 'quantity'
                                },
                                {
                                    title: 'Unit Price',
                                    dataIndex: 'unitPrice',
                                    render: v =>
                                        `₹${Number(v).toLocaleString()}`
                                },
                                {
                                    title: 'Amount',
                                    dataIndex: 'amount',
                                    render: v =>
                                        `₹${Number(v).toLocaleString()}`
                                }
                            ]}
                        />

                        <Row justify="end" style={{ marginTop: 16 }}>
                            <Text strong style={{ fontSize: 16 }}>
                                Total: ₹{Number(selectedInvoice.totalAmount)
                                .toLocaleString()}
                            </Text>
                        </Row>

                        {selectedInvoice.notes && (
                            <>
                                <Divider />
                                <Text type="secondary">Notes: </Text>
                                <Text>{selectedInvoice.notes}</Text>
                            </>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}