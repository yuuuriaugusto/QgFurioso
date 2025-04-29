import { useState } from 'react';
import { 
  Table, Card, Button, Input, Select, Typography, Space, Row, Col, Form, Tag, 
  Badge, Modal, Steps, Descriptions, Divider, Drawer, Input as AntInput, message
} from 'antd';
import { 
  SearchOutlined, ReloadOutlined, EyeOutlined, TagOutlined, 
  CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, 
  UserOutlined, ShopOutlined, InboxOutlined, SendOutlined, 
  DeleteOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRedemptionOrders, updateRedemptionStatus, fetchShopItem, fetchUserDetails } from '@api/shop';
import type { RedemptionOrder, ShopItem, User, PaginationParams, SortParams } from '@types';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = AntInput;
const { Step } = Steps;

const RedemptionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  
  // Estados
  const [currentOrder, setCurrentOrder] = useState<RedemptionOrder | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isUpdateStatusModalVisible, setIsUpdateStatusModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [updateForm] = Form.useForm();
  
  // Estados para filtros e paginação
  const [searchParams, setSearchParams] = useState({
    status: undefined as string | undefined,
    userId: undefined as number | undefined,
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

  // Buscar pedidos de resgate
  const { data: redemptionsData, isLoading, refetch } = useQuery({
    queryKey: ['redemption-orders', searchParams, pagination, sort],
    queryFn: () => fetchRedemptionOrders(searchParams, pagination, sort),
  });

  // Buscar detalhes do item e do usuário quando um pedido é selecionado
  const { data: shopItem, isLoading: isLoadingItem } = useQuery({
    queryKey: ['shop-item', currentOrder?.shopItemId],
    queryFn: () => currentOrder ? fetchShopItem(currentOrder.shopItemId) : null,
    enabled: !!currentOrder?.shopItemId,
  });

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user-details', currentOrder?.userId],
    queryFn: () => currentOrder ? fetchUserDetails(currentOrder.userId) : null,
    enabled: !!currentOrder?.userId,
  });

  // Mutação para atualizar status
  const updateStatusMutation = useMutation({
    mutationFn: (data: { orderId: number; status: string; details?: { trackingCode?: string; notes?: string } }) => 
      updateRedemptionStatus(data.orderId, data.status, data.details),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redemption-orders'] });
      message.success('Status atualizado com sucesso');
      setIsUpdateStatusModalVisible(false);
      updateForm.resetFields();
    },
    onError: () => {
      message.error('Erro ao atualizar status');
    },
  });

  // Função para abrir drawer de detalhes
  const showOrderDetails = (order: RedemptionOrder) => {
    setCurrentOrder(order);
    setIsDrawerVisible(true);
  };

  // Função para abrir modal de atualização de status
  const showUpdateStatusModal = (order: RedemptionOrder, status: string) => {
    setCurrentOrder(order);
    setNewStatus(status);
    updateForm.resetFields();
    setIsUpdateStatusModalVisible(true);
  };

  // Função para atualizar o status
  const handleUpdateStatus = (values: any) => {
    if (!currentOrder) return;
    
    updateStatusMutation.mutate({
      orderId: currentOrder.id,
      status: newStatus,
      details: {
        trackingCode: values.trackingCode,
        notes: values.notes,
      },
    });
  };

  // Funções para lidar com a busca
  const handleSearch = (values: any) => {
    setSearchParams({
      search: values.searchTerm,
      status: values.status,
      userId: values.userId,
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
      status: undefined,
      userId: undefined,
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
    });
    
    // Atualizar ordenação
    if (sorter.field && sorter.order) {
      setSort({
        field: sorter.field,
        order: sorter.order === 'ascend' ? 'ascend' : 'descend',
      });
    }
  };

  // Obter o status atual para o Steps
  const getCurrentStep = (status: string): number => {
    switch (status) {
      case 'pending': return 0;
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'completed': return 3;
      case 'cancelled': return 4;
      default: return 0;
    }
  };

  // Renderizar o ícone de status
  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge status="warning" text="Pendente" />;
      case 'processing':
        return <Badge status="processing" text="Em processamento" />;
      case 'shipped':
        return <Badge status="success" text="Enviado" />;
      case 'completed':
        return <Badge status="success" text="Concluído" />;
      case 'cancelled':
        return <Badge status="error" text="Cancelado" />;
      default:
        return <Badge status="default" text={status} />;
    }
  };

  // Colunas da tabela
  const columns: ColumnsType<RedemptionOrder> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: 'Usuário ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
    },
    {
      title: 'Item',
      dataIndex: 'shopItemId',
      key: 'shopItemId',
    },
    {
      title: 'Quantidade',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
    },
    {
      title: 'Custo (Coins)',
      dataIndex: 'coinsCost',
      key: 'coinsCost',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = '';
        switch (status) {
          case 'pending':
            color = 'orange';
            break;
          case 'processing':
            color = 'blue';
            break;
          case 'shipped':
            color = 'green';
            break;
          case 'completed':
            color = 'green';
            break;
          case 'cancelled':
            color = 'red';
            break;
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      filters: [
        { text: 'Pendente', value: 'pending' },
        { text: 'Em processamento', value: 'processing' },
        { text: 'Enviado', value: 'shipped' },
        { text: 'Concluído', value: 'completed' },
        { text: 'Cancelado', value: 'cancelled' },
      ],
    },
    {
      title: 'Criado em',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: true,
    },
    {
      title: 'Atualizado em',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      sorter: true,
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => showOrderDetails(record)}
          />
          
          {record.status === 'pending' && (
            <>
              <Button
                type="text"
                icon={<LoadingOutlined />}
                onClick={() => showUpdateStatusModal(record, 'processing')}
              />
              <Button
                type="text"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => showUpdateStatusModal(record, 'cancelled')}
              />
            </>
          )}
          
          {record.status === 'processing' && (
            <>
              <Button
                type="text"
                icon={<SendOutlined />}
                onClick={() => showUpdateStatusModal(record, 'shipped')}
              />
              <Button
                type="text"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => showUpdateStatusModal(record, 'cancelled')}
              />
            </>
          )}
          
          {record.status === 'shipped' && (
            <Button
              type="text"
              icon={<CheckCircleOutlined />}
              onClick={() => showUpdateStatusModal(record, 'completed')}
            />
          )}
        </Space>
      ),
    },
  ];

  // Determinar quais campos são necessários para cada status
  const getRequiredFields = () => {
    switch (newStatus) {
      case 'shipped':
        return ['trackingCode'];
      default:
        return [];
    }
  };

  return (
    <div>
      <Title level={2}>Gerenciamento de Resgates</Title>
      
      <Card style={{ marginBottom: 24 }}>
        <Form form={form} onFinish={handleSearch} layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="searchTerm" label="Buscar">
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="ID ou código de rastreio"
                  allowClear
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="status" label="Status">
                <Select placeholder="Todos" allowClear>
                  <Option value="pending">Pendente</Option>
                  <Option value="processing">Em processamento</Option>
                  <Option value="shipped">Enviado</Option>
                  <Option value="completed">Concluído</Option>
                  <Option value="cancelled">Cancelado</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="userId" label="ID do Usuário">
                <Input type="number" />
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
            <InboxOutlined />
            <span>
              {redemptionsData?.total || 0} resgates encontrados
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
          dataSource={redemptionsData?.data || []}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange as any}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: redemptionsData?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} resgates`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
      
      {/* Drawer de detalhes do pedido */}
      <Drawer
        title={`Detalhes do Resgate #${currentOrder?.id}`}
        placement="right"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        width={600}
        extra={
          <Space>
            {currentOrder?.status === 'pending' && (
              <>
                <Button onClick={() => showUpdateStatusModal(currentOrder, 'processing')}>
                  Iniciar processamento
                </Button>
                <Button danger onClick={() => showUpdateStatusModal(currentOrder, 'cancelled')}>
                  Cancelar
                </Button>
              </>
            )}
            
            {currentOrder?.status === 'processing' && (
              <>
                <Button onClick={() => showUpdateStatusModal(currentOrder, 'shipped')}>
                  Marcar como enviado
                </Button>
                <Button danger onClick={() => showUpdateStatusModal(currentOrder, 'cancelled')}>
                  Cancelar
                </Button>
              </>
            )}
            
            {currentOrder?.status === 'shipped' && (
              <Button type="primary" onClick={() => showUpdateStatusModal(currentOrder, 'completed')}>
                Marcar como concluído
              </Button>
            )}
          </Space>
        }
      >
        {currentOrder && (
          <>
            <Steps 
              current={getCurrentStep(currentOrder.status)} 
              status={currentOrder.status === 'cancelled' ? 'error' : 'process'}
              direction="horizontal"
              style={{ marginBottom: 24 }}
            >
              <Step title="Pendente" icon={<InboxOutlined />} />
              <Step title="Processando" icon={<LoadingOutlined />} />
              <Step title="Enviado" icon={<SendOutlined />} />
              <Step title="Concluído" icon={<CheckCircleOutlined />} />
            </Steps>
            
            <Divider orientation="left">Informações gerais</Divider>
            
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Status">
                {renderStatusIcon(currentOrder.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Data de criação">
                {dayjs(currentOrder.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Última atualização">
                {dayjs(currentOrder.updatedAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Custo total">
                <Text strong>{currentOrder.coinsCost}</Text> coins
              </Descriptions.Item>
              <Descriptions.Item label="Quantidade">
                <Text strong>{currentOrder.quantity}</Text> unidade(s)
              </Descriptions.Item>
            </Descriptions>
            
            <Divider orientation="left">Informações do usuário</Divider>
            
            {isLoadingUser ? (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <LoadingOutlined style={{ fontSize: 24 }} />
                <p>Carregando dados do usuário...</p>
              </div>
            ) : user ? (
              <Descriptions bordered column={1}>
                <Descriptions.Item label="ID">
                  <Space>
                    <UserOutlined />
                    <Text>{user.id}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Email/Identificador">
                  {user.primaryIdentity}
                </Descriptions.Item>
                <Descriptions.Item label="Nome">
                  {user.profile?.displayName || 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Alert message="Não foi possível carregar os dados do usuário" type="error" />
            )}
            
            <Divider orientation="left">Informações do item</Divider>
            
            {isLoadingItem ? (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <LoadingOutlined style={{ fontSize: 24 }} />
                <p>Carregando dados do item...</p>
              </div>
            ) : shopItem ? (
              <Descriptions bordered column={1}>
                <Descriptions.Item label="ID">
                  <Space>
                    <ShopOutlined />
                    <Text>{shopItem.id}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Nome">
                  {shopItem.name}
                </Descriptions.Item>
                <Descriptions.Item label="Tipo">
                  <Tag>{shopItem.type}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Preço unitário">
                  <Text strong>{shopItem.coinPrice}</Text> coins
                </Descriptions.Item>
                <Descriptions.Item label="Descrição">
                  {shopItem.description}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Alert message="Não foi possível carregar os dados do item" type="error" />
            )}
            
            {currentOrder.shippingInfo && (
              <>
                <Divider orientation="left">Informações de envio</Divider>
                <Card>
                  <Paragraph>{currentOrder.shippingInfo}</Paragraph>
                </Card>
              </>
            )}
            
            {currentOrder.trackingCode && (
              <>
                <Divider orientation="left">Código de rastreio</Divider>
                <Card>
                  <Space>
                    <TagOutlined />
                    <Text copyable>{currentOrder.trackingCode}</Text>
                  </Space>
                </Card>
              </>
            )}
            
            {currentOrder.notes && (
              <>
                <Divider orientation="left">Observações</Divider>
                <Card>
                  <Paragraph>{currentOrder.notes}</Paragraph>
                </Card>
              </>
            )}
          </>
        )}
      </Drawer>
      
      {/* Modal para atualizar status */}
      <Modal
        title={`Atualizar status para ${newStatus?.toUpperCase()}`}
        open={isUpdateStatusModalVisible}
        onCancel={() => setIsUpdateStatusModalVisible(false)}
        footer={null}
      >
        <Form
          form={updateForm}
          onFinish={handleUpdateStatus}
          layout="vertical"
        >
          {newStatus === 'shipped' && (
            <Form.Item
              name="trackingCode"
              label="Código de rastreio"
              rules={[{ required: true, message: 'Por favor, insira o código de rastreio' }]}
            >
              <Input />
            </Form.Item>
          )}
          
          <Form.Item
            name="notes"
            label="Observações"
          >
            <TextArea rows={4} />
          </Form.Item>
          
          <Divider />
          
          <div style={{ padding: '0 16px 16px', color: '#ff4d4f' }}>
            {newStatus === 'cancelled' && (
              <Paragraph>
                <DeleteOutlined /> Atenção: Esta ação irá cancelar o resgate e não pode ser desfeita.
                {currentOrder?.status !== 'pending' && ' Os coins serão reembolsados para o usuário.'}
              </Paragraph>
            )}
          </div>
          
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                style={{ marginRight: 8 }}
                onClick={() => setIsUpdateStatusModalVisible(false)}
                disabled={updateStatusMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateStatusMutation.isPending}
                danger={newStatus === 'cancelled'}
              >
                Confirmar
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RedemptionsPage;