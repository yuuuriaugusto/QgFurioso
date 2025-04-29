import { useState } from 'react';
import { 
  Table, Card, Button, Input, Select, Typography, Space, Row, Col, Form, Tag, 
  Badge, DatePicker, Drawer, Descriptions, Divider, Alert, Tooltip, Statistic,
  Spin, Empty
} from 'antd';
import { 
  SearchOutlined, ReloadOutlined, EyeOutlined, DashboardOutlined, 
  UserOutlined, DatabaseOutlined, EditOutlined, DeleteOutlined,
  UploadOutlined, StopOutlined, CheckCircleOutlined, PlusOutlined, 
  TagsOutlined, LockOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs, fetchAuditLogDetails, fetchAuditStatsByAction, fetchAuditStatsByAdmin } from '@api/audit';
import type { AuditLog, PaginationParams, SortParams } from '@types';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import { Bar } from 'recharts';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, Legend } from 'recharts';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Constantes
const ACTION_COLOR_MAP: Record<string, string> = {
  'CREATE': '#52c41a',
  'UPDATE': '#1890ff',
  'DELETE': '#f5222d',
  'PUBLISH': '#722ed1',
  'UNPUBLISH': '#fa8c16',
  'SUSPEND': '#faad14',
  'ACTIVATE': '#a0d911',
  'RESET_PASSWORD': '#eb2f96',
  'ADJUST_COINS': '#fa541c',
};

const ENTITY_COLOR_MAP: Record<string, string> = {
  'USER': '#1890ff',
  'SHOP_ITEM': '#52c41a',
  'NEWS_CONTENT': '#722ed1',
  'SURVEY': '#fa8c16',
  'REDEMPTION_ORDER': '#fa541c',
  'COIN_TRANSACTION': '#eb2f96',
};

// Cores para gráficos
const COLOR_PALETTE = [
  '#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#fa541c', '#eb2f96',
  '#f5222d', '#faad14', '#a0d911', '#13c2c2', '#2f54eb', '#eb2f96'
];

// Componente principal
const AuditLogsPage: React.FC = () => {
  const [form] = Form.useForm();
  
  // Estados
  const [currentLog, setCurrentLog] = useState<AuditLog | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [statsPeriod, setStatsPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  
  // Estados para filtros e paginação
  const [searchParams, setSearchParams] = useState({
    adminId: undefined as number | undefined,
    action: undefined as string | undefined,
    entityType: undefined as string | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
    search: undefined as string | undefined,
  });
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    pageSize: 10,
  });
  const [sort, setSort] = useState<SortParams>({
    field: 'timestamp',
    order: 'descend',
  });

  // Buscar logs de auditoria
  const { data: auditLogsData, isLoading, refetch } = useQuery({
    queryKey: ['audit-logs', searchParams, pagination, sort],
    queryFn: () => fetchAuditLogs(searchParams, pagination, sort),
  });

  // Buscar detalhes de um log específico
  const { data: logDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['audit-log-details', currentLog?.id],
    queryFn: () => currentLog ? fetchAuditLogDetails(currentLog.id) : null,
    enabled: !!currentLog?.id,
  });

  // Buscar estatísticas para os gráficos
  const { data: statsByAction, isLoading: isLoadingActionStats } = useQuery({
    queryKey: ['audit-stats-action', statsPeriod],
    queryFn: () => fetchAuditStatsByAction(statsPeriod),
    enabled: showStats,
  });

  const { data: statsByAdmin, isLoading: isLoadingAdminStats } = useQuery({
    queryKey: ['audit-stats-admin', statsPeriod],
    queryFn: () => fetchAuditStatsByAdmin(statsPeriod),
    enabled: showStats,
  });

  // Função para mostrar detalhes de um log
  const showLogDetails = (log: AuditLog) => {
    setCurrentLog(log);
    setIsDrawerVisible(true);
  };

  // Função para lidar com a busca
  const handleSearch = (values: any) => {
    const { searchTerm, action, entityType, dateRange, adminId } = values;
    
    setSearchParams({
      search: searchTerm,
      action,
      entityType,
      adminId: adminId ? Number(adminId) : undefined,
      startDate: dateRange && dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : undefined,
      endDate: dateRange && dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : undefined,
    });
    
    setPagination({
      ...pagination,
      page: 1,
    });
  };

  // Função para resetar filtros
  const handleReset = () => {
    form.resetFields();
    setSearchParams({
      adminId: undefined,
      action: undefined,
      entityType: undefined,
      startDate: undefined,
      endDate: undefined,
      search: undefined,
    });
    setPagination({
      page: 1,
      pageSize: 10,
    });
    setSort({
      field: 'timestamp',
      order: 'descend',
    });
  };

  // Função para lidar com mudança na paginação
  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, any>,
    sorter: any
  ) => {
    setPagination({
      page: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
    });
    
    // Atualizar filtros
    setSearchParams({
      ...searchParams,
      action: filters.action && filters.action.length > 0 ? filters.action[0] : undefined,
      entityType: filters.entityType && filters.entityType.length > 0 ? filters.entityType[0] : undefined,
    });
    
    // Atualizar ordenação
    if (sorter.field && sorter.order) {
      setSort({
        field: sorter.field,
        order: sorter.order === 'ascend' ? 'ascend' : 'descend',
      });
    }
  };

  // Função para renderizar o ícone de ação
  const renderActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <PlusOutlined />;
      case 'UPDATE':
        return <EditOutlined />;
      case 'DELETE':
        return <DeleteOutlined />;
      case 'PUBLISH':
      case 'ACTIVATE':
        return <CheckCircleOutlined />;
      case 'UNPUBLISH':
      case 'SUSPEND':
        return <StopOutlined />;
      case 'RESET_PASSWORD':
        return <LockOutlined />;
      case 'UPLOAD':
        return <UploadOutlined />;
      default:
        return <DatabaseOutlined />;
    }
  };

  // Colunas da tabela
  const columns: ColumnsType<AuditLog> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: 'Admin',
      dataIndex: 'adminId',
      key: 'adminId',
      width: 100,
      render: (adminId) => (
        <Space>
          <UserOutlined />
          {adminId}
        </Space>
      ),
    },
    {
      title: 'Ação',
      dataIndex: 'action',
      key: 'action',
      render: (action) => (
        <Tag color={ACTION_COLOR_MAP[action] || 'default'}>
          {action}
        </Tag>
      ),
      filters: [
        { text: 'CREATE', value: 'CREATE' },
        { text: 'UPDATE', value: 'UPDATE' },
        { text: 'DELETE', value: 'DELETE' },
        { text: 'PUBLISH', value: 'PUBLISH' },
        { text: 'UNPUBLISH', value: 'UNPUBLISH' },
        { text: 'SUSPEND', value: 'SUSPEND' },
        { text: 'ACTIVATE', value: 'ACTIVATE' },
        { text: 'RESET_PASSWORD', value: 'RESET_PASSWORD' },
        { text: 'ADJUST_COINS', value: 'ADJUST_COINS' },
      ],
    },
    {
      title: 'Entidade',
      dataIndex: 'entityType',
      key: 'entityType',
      render: (entityType) => (
        <Tag color={ENTITY_COLOR_MAP[entityType] || 'default'}>
          {entityType}
        </Tag>
      ),
      filters: [
        { text: 'USER', value: 'USER' },
        { text: 'SHOP_ITEM', value: 'SHOP_ITEM' },
        { text: 'NEWS_CONTENT', value: 'NEWS_CONTENT' },
        { text: 'SURVEY', value: 'SURVEY' },
        { text: 'REDEMPTION_ORDER', value: 'REDEMPTION_ORDER' },
        { text: 'COIN_TRANSACTION', value: 'COIN_TRANSACTION' },
      ],
    },
    {
      title: 'ID da Entidade',
      dataIndex: 'entityId',
      key: 'entityId',
      width: 120,
      render: (entityId) => entityId || '-',
    },
    {
      title: 'Detalhes',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (details) => (
        <Tooltip title={details}>
          <Text ellipsis style={{ maxWidth: 300 }}>{details}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 130,
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      sorter: true,
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm:ss'),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => showLogDetails(record)}
        />
      ),
    },
  ];

  // Renderizar gráficos de estatísticas
  const renderStatistics = () => (
    <Card style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={4}>Estatísticas de Auditoria</Title>
        
        <Select
          value={statsPeriod}
          onChange={(value) => setStatsPeriod(value)}
          style={{ width: 120 }}
        >
          <Option value="7d">Últimos 7 dias</Option>
          <Option value="30d">Últimos 30 dias</Option>
          <Option value="90d">Últimos 90 dias</Option>
          <Option value="all">Todo período</Option>
        </Select>
      </div>
      
      <Row gutter={[24, 24]}>
        <Col xs={24} xl={12}>
          <Card title="Atividade por Tipo de Ação" loading={isLoadingActionStats}>
            {statsByAction && statsByAction.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statsByAction}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="action" />
                  <YAxis />
                  <RechartTooltip />
                  <Legend />
                  <Bar dataKey="count" name="Quantidade" fill="#1890ff">
                    {statsByAction.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={ACTION_COLOR_MAP[entry.action] || '#1890ff'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Sem dados disponíveis" />
            )}
          </Card>
        </Col>
        
        <Col xs={24} xl={12}>
          <Card title="Atividade por Administrador" loading={isLoadingAdminStats}>
            {statsByAdmin && statsByAdmin.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statsByAdmin}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="adminName"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statsByAdmin.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                    ))}
                  </Pie>
                  <RechartTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="Sem dados disponíveis" />
            )}
          </Card>
        </Col>
        
        <Col xs={24}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Statistic 
                title="Total de registros" 
                value={statsByAction?.reduce((sum, item) => sum + item.count, 0) || 0} 
                prefix={<DatabaseOutlined />} 
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic 
                title="Tipos de ações" 
                value={statsByAction?.length || 0} 
                prefix={<TagsOutlined />} 
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic 
                title="Administradores ativos" 
                value={statsByAdmin?.length || 0} 
                prefix={<UserOutlined />} 
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );

  return (
    <div>
      <Title level={2}>Logs de Auditoria</Title>
      
      <Alert 
        message="Rastreabilidade de Ações Administrativas"
        description="Este módulo permite monitorar todas as ações realizadas no painel administrativo, fornecendo uma trilha de auditoria completa para fins de segurança e compliance."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />
      
      <div style={{ marginBottom: 16 }}>
        <Button 
          type={showStats ? "primary" : "default"}
          icon={<DashboardOutlined />}
          onClick={() => setShowStats(!showStats)}
        >
          {showStats ? "Ocultar Estatísticas" : "Mostrar Estatísticas"}
        </Button>
      </div>
      
      {showStats && renderStatistics()}
      
      <Card style={{ marginBottom: 24 }}>
        <Form form={form} onFinish={handleSearch} layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="searchTerm" label="Buscar">
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="Detalhes ou IP"
                  allowClear
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="action" label="Tipo de Ação">
                <Select placeholder="Todas" allowClear>
                  <Option value="CREATE">CREATE</Option>
                  <Option value="UPDATE">UPDATE</Option>
                  <Option value="DELETE">DELETE</Option>
                  <Option value="PUBLISH">PUBLISH</Option>
                  <Option value="UNPUBLISH">UNPUBLISH</Option>
                  <Option value="SUSPEND">SUSPEND</Option>
                  <Option value="ACTIVATE">ACTIVATE</Option>
                  <Option value="RESET_PASSWORD">RESET_PASSWORD</Option>
                  <Option value="ADJUST_COINS">ADJUST_COINS</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="entityType" label="Tipo de Entidade">
                <Select placeholder="Todas" allowClear>
                  <Option value="USER">USER</Option>
                  <Option value="SHOP_ITEM">SHOP_ITEM</Option>
                  <Option value="NEWS_CONTENT">NEWS_CONTENT</Option>
                  <Option value="SURVEY">SURVEY</Option>
                  <Option value="REDEMPTION_ORDER">REDEMPTION_ORDER</Option>
                  <Option value="COIN_TRANSACTION">COIN_TRANSACTION</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="adminId" label="ID do Administrador">
                <Input type="number" allowClear />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item name="dateRange" label="Período">
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 29 }}>
                <Button onClick={handleReset} style={{ marginRight: 8 }}>
                  Limpar
                </Button>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  Buscar
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </Card>
      
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space>
            <DatabaseOutlined />
            <span>
              {auditLogsData?.total || 0} registros encontrados
            </span>
          </Space>
          
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
          >
            Atualizar
          </Button>
        </div>
        
        <Table
          columns={columns}
          dataSource={auditLogsData?.data || []}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange as any}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: auditLogsData?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} registros`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
      
      {/* Drawer para detalhes do log */}
      <Drawer
        title={`Detalhes do Log #${currentLog?.id}`}
        placement="right"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        width={600}
      >
        {isLoadingDetails ? (
          <Spin size="large" />
        ) : logDetails ? (
          <>
            <Descriptions title="Informações Básicas" bordered column={1}>
              <Descriptions.Item label="ID do Log">
                {logDetails.id}
              </Descriptions.Item>
              <Descriptions.Item label="Administrador">
                <Space>
                  <UserOutlined />
                  ID: {logDetails.adminId}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Ação">
                <Tag color={ACTION_COLOR_MAP[logDetails.action] || 'default'}>
                  {logDetails.action}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Timestamp">
                {dayjs(logDetails.timestamp).format('DD/MM/YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Endereço IP">
                {logDetails.ipAddress}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <Descriptions title="Informações da Entidade" bordered column={1}>
              <Descriptions.Item label="Tipo de Entidade">
                <Tag color={ENTITY_COLOR_MAP[logDetails.entityType] || 'default'}>
                  {logDetails.entityType}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="ID da Entidade">
                {logDetails.entityId || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Detalhes">
                <Paragraph>{logDetails.details}</Paragraph>
              </Descriptions.Item>
            </Descriptions>
          </>
        ) : (
          <Alert 
            message="Informações não disponíveis" 
            description="Não foi possível carregar os detalhes deste log de auditoria." 
            type="error" 
            showIcon 
          />
        )}
      </Drawer>
    </div>
  );
};

export default AuditLogsPage;