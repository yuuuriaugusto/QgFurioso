import { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, theme, message } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  ShopOutlined,
  FileTextOutlined,
  FormOutlined,
  AuditOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuthStore } from '@store/authStore';
import { logoutAdmin } from '@api/auth';

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const { admin, clearAuth } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Itens do menu lateral
  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: <Link to="/users">Usuários</Link>,
    },
    {
      key: 'rewards',
      icon: <ShopOutlined />,
      label: 'Sistema de Recompensas',
      children: [
        {
          key: '/rewards/shop',
          label: <Link to="/rewards/shop">Loja</Link>,
        },
        {
          key: '/rewards/redemptions',
          label: <Link to="/rewards/redemptions">Resgates</Link>,
        },
        {
          key: '/rewards/coin-rules',
          label: <Link to="/rewards/coin-rules">Regras de Moedas</Link>,
        },
      ],
    },
    {
      key: 'content',
      icon: <FileTextOutlined />,
      label: 'Conteúdo',
      children: [
        {
          key: '/content/news',
          label: <Link to="/content/news">Notícias</Link>,
        },
        {
          key: '/content/surveys',
          label: <Link to="/content/surveys">Pesquisas</Link>,
        },
      ],
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: <Link to="/analytics">Analytics</Link>,
    },
    {
      key: '/audit',
      icon: <AuditOutlined />,
      label: <Link to="/audit">Logs de Auditoria</Link>,
    },
  ];

  // Opções do dropdown do usuário
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Meu Perfil',
      onClick: () => message.info('Funcionalidade em desenvolvimento'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configurações',
      onClick: () => message.info('Funcionalidade em desenvolvimento'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sair',
      onClick: async () => {
        try {
          await logoutAdmin();
          clearAuth();
          navigate('/login');
          message.success('Logout realizado com sucesso');
        } catch (error) {
          message.error('Erro ao fazer logout');
        }
      },
    },
  ];

  // Determina qual chave do menu está ativa com base na URL atual
  const getSelectedMenuKeys = () => {
    const pathname = location.pathname;
    
    if (pathname === '/') {
      return ['/'];
    }
    
    // Para rotas aninhadas, retorna tanto a rota pai quanto a filha
    if (pathname.startsWith('/rewards/')) {
      return ['rewards', pathname];
    }
    
    if (pathname.startsWith('/content/')) {
      return ['content', pathname];
    }
    
    if (pathname.startsWith('/users/')) {
      return ['/users'];
    }
    
    return [pathname];
  };

  return (
    <Layout className="admin-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="admin-sidebar"
        theme="dark"
        width={256}
      >
        <div className="sidebar-logo">
          {collapsed ? (
            <img src="/furia-icon.svg" alt="FURIA" height={40} />
          ) : (
            <img src="/furia-logo.svg" alt="FURIA QG Furioso" height={40} />
          )}
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['/']}
          selectedKeys={getSelectedMenuKeys()}
          defaultOpenKeys={['rewards', 'content']}
          items={menuItems}
        />
      </Sider>
      
      <Layout>
        <Header className="admin-header" style={{ background: token.colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{ marginRight: 16 }}
              onClick={() => message.info('Notificações em desenvolvimento')}
            />
            
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  style={{ marginRight: 8, backgroundColor: token.colorPrimary }} 
                  icon={<UserOutlined />}
                />
                <span>{admin?.firstName} {admin?.lastName}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: '100vh', background: token.colorBgContainer }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;