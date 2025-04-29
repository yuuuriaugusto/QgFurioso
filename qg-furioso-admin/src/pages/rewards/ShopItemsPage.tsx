import { useState } from 'react';
import { 
  Table, Card, Button, Input, Select, Typography, Space, Row, Col, Form, Tag, 
  Image, Modal, InputNumber, Switch, Upload, message, Tooltip, Popconfirm, Badge
} from 'antd';
import { 
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, 
  ReloadOutlined, ShopOutlined, UploadOutlined, EyeOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchShopItems, createShopItem, updateShopItem, toggleShopItemStatus, deleteShopItem } from '@api/shop';
import type { ShopItem, PaginationParams, SortParams } from '@types';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import type { UploadFile, UploadProps } from 'antd/es/upload';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ShopItemsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  
  // Estados
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  
  // Estados para filtros e paginação
  const [searchParams, setSearchParams] = useState({
    isActive: undefined as boolean | undefined,
    type: undefined as string | undefined,
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

  // Buscar itens da loja
  const { data: shopItemsData, isLoading, refetch } = useQuery({
    queryKey: ['shop-items', searchParams, pagination, sort],
    queryFn: () => fetchShopItems(searchParams, pagination, sort),
  });

  // Mutações
  const createMutation = useMutation({
    mutationFn: createShopItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-items'] });
      message.success('Item criado com sucesso');
      handleModalClose();
    },
    onError: () => {
      message.error('Erro ao criar item');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ShopItem> }) => updateShopItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-items'] });
      message.success('Item atualizado com sucesso');
      handleModalClose();
    },
    onError: () => {
      message.error('Erro ao atualizar item');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => toggleShopItemStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-items'] });
      message.success('Status atualizado com sucesso');
    },
    onError: () => {
      message.error('Erro ao atualizar status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteShopItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-items'] });
      message.success('Item removido com sucesso');
    },
    onError: () => {
      message.error('Erro ao remover item');
    },
  });

  // Funções para manipulação do modal
  const showAddModal = () => {
    setEditingItem(null);
    setFileList([]);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (item: ShopItem) => {
    setEditingItem(item);
    form.setFieldsValue({
      ...item,
      // Converter outros tipos de dados se necessário
    });
    
    if (item.imageUrl) {
      setFileList([
        {
          uid: '-1',
          name: 'Imagem atual',
          status: 'done',
          url: item.imageUrl,
        },
      ]);
    } else {
      setFileList([]);
    }
    
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingItem(null);
    setFileList([]);
    form.resetFields();
  };

  // Função para lidar com envio do formulário
  const handleFormSubmit = (values: any) => {
    // Neste exemplo estamos simulando upload de imagem
    // Em um cenário real, você faria upload da imagem e obteria a URL
    const finalData = {
      ...values,
      imageUrl: fileList.length > 0 && fileList[0].url ? fileList[0].url : 
                (fileList.length > 0 ? `https://example.com/images/${fileList[0].name}` : null),
    };
    
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: finalData });
    } else {
      createMutation.mutate(finalData);
    }
  };

  // Propriedades do upload de imagens
  const uploadProps: UploadProps = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      // Em um cenário real, você validaria o arquivo aqui
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Você só pode fazer upload de imagens!');
        return Upload.LIST_IGNORE;
      }
      
      // Simular upload bem-sucedido
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setFileList([
          {
            uid: file.uid,
            name: file.name,
            status: 'done',
            url: reader.result as string,
          },
        ]);
      };
      
      // Prevenir upload real (em um cenário real, você faria upload para o servidor)
      return false;
    },
    fileList,
    listType: 'picture-card',
    maxCount: 1,
  };

  // Colunas da tabela
  const columns: ColumnsType<ShopItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: 'Imagem',
      key: 'imageUrl',
      width: 80,
      render: (_, record) => (
        record.imageUrl ? (
          <Image
            width={50}
            height={50}
            src={record.imageUrl}
            alt={record.name}
            fallback="data:image/png;base64,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"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <Badge count={<ShopOutlined style={{ color: '#f5222d' }} />} offset={[0, 0]}>
            <div 
              style={{ 
                width: 50, 
                height: 50, 
                backgroundColor: '#f5f5f5', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                borderRadius: 4
              }}
            >
              <Text type="secondary">Sem imagem</Text>
            </div>
          </Badge>
        )
      ),
    },
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        let color = 'blue';
        switch (type) {
          case 'physical':
            color = 'purple';
            break;
          case 'digital':
            color = 'green';
            break;
          case 'subscription':
            color = 'orange';
            break;
        }
        return <Tag color={color}>{type}</Tag>;
      },
      filters: [
        { text: 'Físico', value: 'physical' },
        { text: 'Digital', value: 'digital' },
        { text: 'Assinatura', value: 'subscription' },
        { text: 'Outro', value: 'other' },
      ],
    },
    {
      title: 'Preço (Coins)',
      dataIndex: 'coinPrice',
      key: 'coinPrice',
      sorter: true,
      render: (price) => (
        <Text strong>{price}</Text>
      ),
    },
    {
      title: 'Estoque',
      dataIndex: 'stock',
      key: 'stock',
      sorter: true,
      render: (stock) => (
        stock === null ? 
          <Tag color="green">Ilimitado</Tag> : 
          <Text type={stock <= 5 ? "danger" : undefined}>{stock}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        isActive ? 
          <Tag color="green">Ativo</Tag> : 
          <Tag color="red">Inativo</Tag>
      ),
      filters: [
        { text: 'Ativo', value: true },
        { text: 'Inativo', value: false },
      ],
    },
    {
      title: 'Criado em',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Visualizar">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          
          <Tooltip title={record.isActive ? "Desativar" : "Ativar"}>
            <Button
              type="text"
              danger={record.isActive}
              style={{ color: !record.isActive ? '#52c41a' : undefined }}
              icon={record.isActive ? <DeleteOutlined /> : <EyeOutlined />}
              onClick={() => toggleStatusMutation.mutate({ id: record.id, isActive: !record.isActive })}
            />
          </Tooltip>
          
          <Popconfirm
            title="Tem certeza que deseja remover este item?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Sim"
            cancelText="Não"
          >
            <Tooltip title="Remover">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
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
      isActive: filters.isActive ? filters.isActive[0] : undefined,
      type: filters.type ? filters.type[0] : undefined,
    });
    
    // Atualizar ordenação
    if (sorter.field && sorter.order) {
      setSort({
        field: sorter.field,
        order: sorter.order === 'ascend' ? 'ascend' : 'descend',
      });
    }
  };

  // Função para lidar com a busca
  const handleSearch = (values: any) => {
    setSearchParams({
      ...searchParams,
      search: values.searchTerm,
      type: values.type,
      isActive: values.isActive,
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
      isActive: undefined,
      type: undefined,
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
      <Title level={2}>Gerenciamento da Loja</Title>
      
      <Card style={{ marginBottom: 24 }}>
        <Form form={form} onFinish={handleSearch} layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="searchTerm" label="Buscar">
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="Nome ou ID"
                  allowClear
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="type" label="Tipo">
                <Select placeholder="Todos" allowClear>
                  <Option value="physical">Físico</Option>
                  <Option value="digital">Digital</Option>
                  <Option value="subscription">Assinatura</Option>
                  <Option value="other">Outro</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="isActive" label="Status">
                <Select placeholder="Todos" allowClear>
                  <Option value={true}>Ativo</Option>
                  <Option value={false}>Inativo</Option>
                </Select>
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
            <ShopOutlined />
            <span>
              {shopItemsData?.total || 0} itens encontrados
            </span>
          </Space>
          
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
            >
              Atualizar
            </Button>
            
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showAddModal}
            >
              Adicionar Item
            </Button>
          </Space>
        </div>
        
        <Table
          columns={columns}
          dataSource={shopItemsData?.data || []}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange as any}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: shopItemsData?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} itens`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
      
      {/* Modal para adicionar/editar item */}
      <Modal
        title={editingItem ? 'Editar Item' : 'Adicionar Item'}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          onFinish={handleFormSubmit}
          layout="vertical"
          initialValues={{
            isActive: true,
            type: 'physical',
            stock: null,
            coinPrice: 100,
          }}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="Nome"
                rules={[{ required: true, message: 'Por favor, insira um nome' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                name="type"
                label="Tipo"
                rules={[{ required: true, message: 'Por favor, selecione um tipo' }]}
              >
                <Select>
                  <Option value="physical">Físico</Option>
                  <Option value="digital">Digital</Option>
                  <Option value="subscription">Assinatura</Option>
                  <Option value="other">Outro</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="Descrição"
            rules={[{ required: true, message: 'Por favor, insira uma descrição' }]}
          >
            <TextArea rows={4} />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="coinPrice"
                label="Preço (Coins)"
                rules={[
                  { required: true, message: 'Por favor, insira um preço' },
                  { type: 'number', min: 1, message: 'O preço deve ser maior que 0' },
                ]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="stock"
                label="Estoque (em branco = ilimitado)"
              >
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="imageUrl"
            label="Imagem"
            extra="Tamanho recomendado: 500x500px. Apenas imagens JPG, PNG e GIF são aceitas."
          >
            <Upload {...uploadProps}>
              {fileList.length < 1 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          
          <Form.Item
            name="isActive"
            label="Status"
            valuePropName="checked"
          >
            <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" />
          </Form.Item>
          
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                style={{ marginRight: 8 }}
                onClick={handleModalClose}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingItem ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ShopItemsPage;