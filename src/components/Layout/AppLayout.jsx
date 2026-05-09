import { Layout, Menu, Avatar, Dropdown, Typography } from 'antd';
import {
    DashboardOutlined, FileTextOutlined,
    DollarOutlined, TeamOutlined,
    LogoutOutlined, UserOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

export default function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const menuItems = [
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard'
        },
        {
            key: '/invoices',
            icon: <FileTextOutlined />,
            label: 'Invoices'
        },
        {
            key: '/expenses',
            icon: <DollarOutlined />,
            label: 'Expenses'
        },
        {
            key: '/clients',
            icon: <TeamOutlined />,
            label: 'Clients'
        }
    ];

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'My Profile',
            onClick: () => navigate('/profile')
        },
        { type: 'divider' },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            danger: true,
            onClick: () => {
                logout();
                navigate('/login');
            }
        }
    ];

    const pageTitles = {
        '/dashboard': 'Dashboard',
        '/invoices':  'Invoices',
        '/expenses':  'Expenses',
        '/clients':   'Clients',
        '/profile':   'My Profile'
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                theme="dark"
                width={220}
                style={{
                    background: '#001529',
                    position: 'fixed',
                    height: '100vh',
                    left: 0,
                    top: 0,
                    zIndex: 100
                }}
            >
                {/* Logo */}
                <div style={{
                    padding: '20px 24px 16px',
                    borderBottom: '1px solid #1f3a5c'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}>
                        <div style={{
                            width: 32,
                            height: 32,
                            background: '#1677ff',
                            borderRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 16,
                            fontWeight: 700,
                            color: '#fff'
                        }}>
                            I
                        </div>
                        <Text style={{
                            color: '#fff',
                            fontSize: 16,
                            fontWeight: 600
                        }}>
                            InvoiceApp
                        </Text>
                    </div>
                </div>

                {/* Navigation */}
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                    style={{ borderRight: 0, marginTop: 8 }}
                />

                {/* User info at bottom */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    padding: '16px 24px',
                    borderTop: '1px solid #1f3a5c',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                }}>
                    <Avatar
                        size="small"
                        style={{ background: '#1677ff', flexShrink: 0 }}
                    >
                        {user?.name?.[0]?.toUpperCase()}
                    </Avatar>
                    <Text style={{
                        color: '#8c9bad',
                        fontSize: 12,
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {user?.email}
                    </Text>
                </div>
            </Sider>

            <Layout style={{ marginLeft: 220 }}>
                {/* Header */}
                <Header style={{
                    background: '#fff',
                    padding: '0 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 99
                }}>
                    <Text strong style={{ fontSize: 16 }}>
                        {pageTitles[location.pathname] || 'InvoiceApp'}
                    </Text>

                    <Dropdown
                        menu={{ items: userMenuItems }}
                        placement="bottomRight"
                        trigger={['click']}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: 6
                        }}>
                            <Avatar style={{ background: '#1677ff' }}>
                                {user?.name?.[0]?.toUpperCase()}
                            </Avatar>
                            <Text strong>{user?.name}</Text>
                        </div>
                    </Dropdown>
                </Header>

                {/* Content */}
                <Content style={{
                    margin: 24,
                    padding: 24,
                    background: '#f5f5f5',
                    minHeight: 'calc(100vh - 64px - 48px)'
                }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}