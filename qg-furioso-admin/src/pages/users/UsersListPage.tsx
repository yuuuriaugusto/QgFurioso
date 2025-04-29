import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Button, Input, Select, Tag, Typography, Space, Row, Col, Form, DatePicker, Badge, Tooltip, message } from 'antd';
import { SearchOutlined, UserOutlined, ReloadOutlined, EyeOutlined, LockOutlined, StopOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers, updateUserStatus } from '@api/users';
import type { User, PaginationParams, SortParams } from '@types';
import type { TablePaginationConfig } from 'antd/es/table';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const UsersListPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  // Estados para filtros e paginação
  const [searchParams, setSearchParams] = useState({
    status: undefined as string | undefined,
    kycStatus: undefined as string | undefined,
    search: undefined as string | undefined,
  });
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    pageSize: 10,
  });
  const [sort, setSort] = useState<SortParams>({
    field: 'createdAt',
    order: 'descend',
  });

  // Buscar usuários
  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ['users', searchParams, pagination, sort],
    queryFn: () => fetchUsers(searchParams, pagination, sort),
  });

  // Função para alterar status do usuário
  const handleStatusChange = async (userId: number, newStatus: string) => {
    try {
      await updateUserStatus(userId, newStatus);
      message.success('Status do usuário atualizado com sucesso');
      refetch();
    } catch (error) {
      message.error('Erro ao atualizar status do usuário');
    }
  };

  // Colunas da tabela
  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: 'Identificador',
      dataIndex: 'primaryIdentity',
      key: 'primaryIdentity',
      render: (text) => <a>{text}</a>,
      sorter: true,
    },
    {
      title: 'Nome',
      key: 'displayName',
      render: (_, record) => record.profile?.displayName || '-',
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'green';
        if (status === 'inactive') color = 'volcano';
        if (status === 'suspended') color = 'red';
        if (status === 'pending') color = 'gold';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      filters: [
        { text: 'Ativo', value: 'active' },
        { text: 'Inativo', value: 'inactive' },
        { text: 'Suspenso', value: 'suspended' },
        { text: 'Pendente', value: 'pending' },
      ],
    },
    {
      title: 'KYC',
      key: 'kycStatus',
      render: (_, record) => {
        const kycStatus = record.profile?.kycStatus || 'not_started';
        let color = '';
        let text = '';
        
        switch (kycStatus) {
          case 'verified':
            color = 'success';
            text = 'Verificado';
            break;
          case 'pending':
            color = 'processing';
            text = 'Pendente';
            break;
          case 'rejected':
            color = 'error';
            text = 'Rejeitado';
            break;
          default:
            color = 'default';
            text = 'Não iniciado';
        }
        
        return <Badge status={color as any} text={text} />;
      },
      filters: [
        { text: 'Verificado', value: 'verified' },
        { text: 'Pendente', value: 'pending' },
        { text: 'Rejeitado', value: 'rejected' },
        { text: 'Não iniciado', value: 'not_started' },
      ],
    },
    {
      title: 'Coins',
      key: 'coinBalance',
      render: (_, record) => record.coinBalance?.amount || 0,
      sorter: true,
    },
    {
      title: 'Cadastro',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      sorter: true,
    },
    {
      title: 'Último Login',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-',
      sorter: true,
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Ver detalhes">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/users/${record.id}`)}
            />
          </Tooltip>
          
          <Tooltip title="Redefinir senha">
            <Button
              type="text"
              icon={<LockOutlined />}
              onClick={() => message.info(`Enviar link de redefinição para ${record.primaryIdentity}`)}
            />
          </Tooltip>
          
          {record.status === 'active' ? (
            <Tooltip title="Suspender">
              <Button
                type="text"
                danger
                icon={<StopOutlined />}
                onClick={() => handleStatusChange(record.id, 'suspended')}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Ativar">
              <Button
                type="text"
                style={{ color: 'green' }}
                icon={<StopOutlined />}
                onClick={() => handleStatusChange(record.id, 'active')}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

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
      status: filters.status && filters.status.length > 0 ? filters.status[0] : undefined,
      kycStatus: filters.kycStatus && filters.kycStatus.length > 0 ? filters.kycStatus[0] : undefined,
    });
    
    // Atualizar ordenação
    if (sorter.field && sorter.order) {
      setSort({
        field: sorter.field,
        order: sorter.order === 'ascend' ? 'ascend' : 'descend',
      });
    }
  };

  // Função para lidar com a busca de usuários
  const handleSearch = (values: any) => {
    const { searchTerm, status, kycStatus, dateRange } = values;
    
    setSearchParams({
      search: searchTerm,
      status,
      kycStatus,
      // Adicionar lógica para filtro de data se necessário
    });
    
    // Resetar para a primeira página ao buscar
    setPagination({
      ...pagination,
      page: 1,
    });
  };

  // Função para resetar filtros
  const handleReset = () => {
    form.resetFields();
    setSearchParams({
      status: undefined,
      kycStatus: undefined,
      search: undefined,
    });
    setPagination({
      page: 1,
      pageSize: 10,
    });
    setSort({
      field: 'createdAt',
      order: 'descend',
    });
  };

  return (
    <div>
      <Title level={2}>Gerenciamento de Usuários</Title>
      
      <Card style={{ marginBottom: 24 }}>
        <Form form={form} onFinish={handleSearch} layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="searchTerm" label="Buscar">
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="Email, nome ou ID"
                  allowClear
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="status" label="Status">
                <Select placeholder="Todos" allowClear>
                  <Option value="active">Ativo</Option>
                  <Option value="inactive">Inativo</Option>
                  <Option value="suspended">Suspenso</Option>
                  <Option value="pending">Pendente</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="kycStatus" label="Status KYC">
                <Select placeholder="Todos" allowClear>
                  <Option value="verified">Verificado</Option>
                  <Option value="pending">Pendente</Option>
                  <Option value="rejected">Rejeitado</Option>
                  <Option value="not_started">Não iniciado</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="dateRange" label="Data de cadastro">
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            
            <Col xs={24}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
            <UserOutlined />
            <span>
              {usersData?.total || 0} usuários encontrados
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
          dataSource={usersData?.data || []}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange as any}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: usersData?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} usuários`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default UsersListPage;