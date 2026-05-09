import { useEffect, useState } from 'react';
import {
    Row, Col, Card, Statistic, Table, Tag,
    Typography, Spin, Alert
} from 'antd';
import {
    DollarOutlined,
    RiseOutlined,
    FallOutlined,
    WarningOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../api/axios';

const { Title } = Typography;

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // fetch dashboard stats and invoices simultaneously
            const [dashboardRes, invoicesRes] = await Promise.all([
                api.get('/api/dashboard'),
                api.get('/api/invoices')
            ]);

            setStats(dashboardRes.data.data);
            setRecentInvoices(
                invoicesRes.data.data?.slice(0, 5) || []
            );
            // show only 5 most recent

        } catch(err) {
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // loading state
    if(loading) return (
        <div style={{ textAlign: 'center', padding: 50 }}>
            <Spin size="large" />
        </div>
    );

    // error state
    if(error) return (
        <Alert type="error" message={error} />
    );

    // format monthly revenue for chart
    const chartData = stats?.monthlyRevenue
        ? Object.entries(stats.monthlyRevenue).map(([month, amount]) => ({
            month,
            revenue: Number(amount)
        }))
        : [];

    // invoice status colors
    const statusColors = {
        DRAFT:     'default',
        SENT:      'blue',
        PAID:      'green',
        OVERDUE:   'red',
        CANCELLED: 'gray'
    };

    // recent invoices table columns
    const columns = [
        {
            title: 'Invoice #',
            dataIndex: 'invoiceNumber',
            key: 'invoiceNumber',
            render: (text) => (
                <span style={{ fontWeight: 500 }}>{text}</span>
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
            render: (amount) => `₹${Number(amount).toLocaleString()}`
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={statusColors[status]}>
                    {status}
                </Tag>
            )
        }
    ];

    return (
        <div>
            <Title level={4} style={{ marginBottom: 24 }}>
                Dashboard
            </Title>

            {/* Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Revenue"
                            value={stats?.totalRevenue || 0}
                            prefix={<DollarOutlined />}
                            formatter={(val) =>
                                `₹${Number(val).toLocaleString()}`
                            }
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Expenses"
                            value={stats?.totalExpenses || 0}
                            prefix={<FallOutlined />}
                            formatter={(val) =>
                                `₹${Number(val).toLocaleString()}`
                            }
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Net P&L"
                            value={stats?.netProfitLoss || 0}
                            prefix={<RiseOutlined />}
                            formatter={(val) =>
                                `₹${Number(val).toLocaleString()}`
                            }
                            valueStyle={{
                                color: (stats?.netProfitLoss || 0) >= 0
                                    ? '#3f8600'
                                    : '#cf1322'
                            }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Overdue Invoices"
                            value={stats?.overdueCount || 0}
                            prefix={<WarningOutlined />}
                            valueStyle={{
                                color: stats?.overdueCount > 0
                                    ? '#cf1322'
                                    : '#3f8600'
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Chart + Recent Invoices */}
            <Row gutter={[16, 16]}>
                {/* Monthly Revenue Chart */}
                <Col xs={24} lg={12}>
                    <Card title="Monthly Revenue">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis
                                        tickFormatter={(v) =>
                                            `₹${(v/1000).toFixed(0)}k`
                                        }
                                    />
                                    <Tooltip
                                        formatter={(v) =>
                                            [`₹${Number(v).toLocaleString()}`,
                                                'Revenue']
                                        }
                                    />
                                    <Bar
                                        dataKey="revenue"
                                        fill="#1677ff"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{
                                textAlign: 'center',
                                padding: 40,
                                color: '#999'
                            }}>
                                No revenue data yet
                            </div>
                        )}
                    </Card>
                </Col>

                {/* Invoice Status Summary */}
                <Col xs={24} lg={12}>
                    <Card title="Invoice Summary">
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Card
                                    size="small"
                                    style={{ background: '#f6ffed',
                                        border: '1px solid #b7eb8f' }}
                                >
                                    <Statistic
                                        title="Paid"
                                        value={stats?.paidCount || 0}
                                        prefix={<FileTextOutlined />}
                                        valueStyle={{ color: '#3f8600' }}
                                    />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card
                                    size="small"
                                    style={{ background: '#e6f4ff',
                                        border: '1px solid #91caff' }}
                                >
                                    <Statistic
                                        title="Pending"
                                        value={stats?.pendingCount || 0}
                                        prefix={<FileTextOutlined />}
                                        valueStyle={{ color: '#1677ff' }}
                                    />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card
                                    size="small"
                                    style={{ background: '#fff2f0',
                                        border: '1px solid #ffccc7' }}
                                >
                                    <Statistic
                                        title="Overdue"
                                        value={stats?.overdueCount || 0}
                                        prefix={<WarningOutlined />}
                                        valueStyle={{ color: '#cf1322' }}
                                    />
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small">
                                    <Statistic
                                        title="Draft"
                                        value={
                                            (stats?.totalInvoices || 0) -
                                            (stats?.paidCount || 0) -
                                            (stats?.pendingCount || 0) -
                                            (stats?.overdueCount || 0)
                                        }
                                        prefix={<FileTextOutlined />}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </Card>
                </Col>

                {/* Recent Invoices Table */}
                <Col span={24}>
                    <Card title="Recent Invoices">
                        <Table
                            columns={columns}
                            dataSource={recentInvoices}
                            rowKey="id"
                            pagination={false}
                            size="middle"
                            locale={{
                                emptyText: 'No invoices yet — create your first one!'
                            }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}