import { useState, useEffect } from 'react';
import { 
  Table, Card, Button, Input, Select, Typography, Space, Row, Col, Form, Tag, 
  Modal, Tabs, Tooltip, Popconfirm, message, Upload, Switch
} from 'antd';
import { 
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, 
  EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, 
  ReloadOutlined, FileTextOutlined, UploadOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNewsContent, createNewsContent, updateNewsContent, toggleNewsContentPublishStatus, deleteNewsContent } from '@api/content';
import type { NewsContent, PaginationParams, SortParams } from '@types';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import type { UploadFile, UploadProps } from 'antd/es/upload';
import type { RcFile } from 'antd/es/upload/interface';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

// Editor configuration
const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],
    ['link', 'image'],
    ['clean'],
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'align',
  'link', 'image',
];

const NewsContentPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  
  // Estados para gerenciar a interface
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [editingContent, setEditingContent] = useState<NewsContent | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [activeTab, setActiveTab] = useState<string>('edit');
  
  // Estados para filtros e paginação
  const [searchParams, setSearchParams] = useState({
    isPublished: undefined as boolean | undefined,
    category: undefined as string | undefined,
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

  // Buscar conteúdos de notícias
  const { data: newsContentData, isLoading, refetch } = useQuery({
    queryKey: ['news-content', searchParams, pagination, sort],
    queryFn: () => fetchNewsContent(searchParams, pagination, sort),
  });

  // Mutações
  const createMutation = useMutation({
    mutationFn: createNewsContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-content'] });
      message.success('Conteúdo criado com sucesso');
      handleCloseModal();
    },
    onError: () => {
      message.error('Erro ao criar conteúdo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<NewsContent> }) => updateNewsContent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-content'] });
      message.success('Conteúdo atualizado com sucesso');
      handleCloseModal();
    },
    onError: () => {
      message.error('Erro ao atualizar conteúdo');
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: number; isPublished: boolean }) => toggleNewsContentPublishStatus(id, isPublished),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-content'] });
      message.success('Status de publicação atualizado com sucesso');
    },
    onError: () => {
      message.error('Erro ao atualizar status de publicação');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteNewsContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-content'] });
      message.success('Conteúdo removido com sucesso');
    },
    onError: () => {
      message.error('Erro ao remover conteúdo');
    },
  });

  // Funções para manipulação do modal
  const showAddModal = () => {
    setEditingContent(null);
    setFileList([]);
    form.resetFields();
    form.setFieldsValue({
      isPublished: false,
      category: 'news',
      publishDate: dayjs(),
    });
    setIsModalVisible(true);
  };

  const showEditModal = (content: NewsContent) => {
    setEditingContent(content);
    
    // Preencher o formulário
    form.setFieldsValue({
      ...content,
      publishDate: content.publishDate ? dayjs(content.publishDate) : null,
    });
    
    // Configurar imagem se existir
    if (content.imageUrl) {
      setFileList([
        {
          uid: '-1',
          name: 'Current image',
          status: 'done',
          url: content.imageUrl,
        },
      ]);
    } else {
      setFileList([]);
    }
    
    setIsModalVisible(true);
  };

  const handlePreview = () => {
    // Validar campos antes de mostrar o preview
    form.validateFields()
      .then(() => {
        setActiveTab('preview');
        setIsPreviewVisible(true);
      })
      .catch(() => {
        message.error('Por favor, preencha todos os campos obrigatórios antes de visualizar');
      });
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setIsPreviewVisible(false);
    setEditingContent(null);
    setFileList([]);
    form.resetFields();
    setActiveTab('edit');
  };

  // Função para calcular o tempo de leitura
  const calculateReadTime = (content: string): number => {
    const wordsPerMinute = 200;
    // Remover tags HTML
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  // Função para manipulação do upload de imagens
  const handleBeforeUpload = (file: RcFile): boolean => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Você só pode fazer upload de imagens!');
      return false;
    }
    
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
    
    // Prevent automatic upload
    return false;
  };

  // Configuração do componente Upload
  const uploadProps: UploadProps = {
    fileList,
    beforeUpload: handleBeforeUpload,
    onRemove: () => {
      setFileList([]);
    },
    listType: 'picture-card',
    maxCount: 1,
  };

  // Função para enviar o formulário
  const handleSubmit = (values: any) => {
    // Adicionar tempo de leitura se conteúdo foi fornecido
    const formData = {
      ...values,
      imageUrl: fileList.length > 0 ? fileList[0].url : null,
      readTime: values.content ? calculateReadTime(values.content) : null,
    };
    
    if (editingContent) {
      updateMutation.mutate({ id: editingContent.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Colunas da tabela
  const columns: ColumnsType<NewsContent> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 200,
      render: (text) => <Text copyable>{text}</Text>,
    },
    {
      title: 'Categoria',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => {
        let color = 'blue';
        if (category === 'news') color = 'green';
        if (category === 'announcement') color = 'orange';
        if (category === 'event') color = 'purple';
        return <Tag color={color}>{category}</Tag>;
      },
      filters: [
        { text: 'Notícias', value: 'news' },
        { text: 'Anúncios', value: 'announcement' },
        { text: 'Eventos', value: 'event' },
        { text: 'Blog', value: 'blog' },
      ],
    },
    {
      title: 'Status',
      dataIndex: 'isPublished',
      key: 'isPublished',
      width: 100,
      render: (isPublished) => (
        isPublished ? 
          <Tag color="green">Publicado</Tag> : 
          <Tag color="orange">Rascunho</Tag>
      ),
      filters: [
        { text: 'Publicado', value: true },
        { text: 'Rascunho', value: false },
      ],
    },
    {
      title: 'Data de Publicação',
      dataIndex: 'publishDate',
      key: 'publishDate',
      sorter: true,
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-',
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
      width: 180,
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
          
          <Tooltip title={record.isPublished ? "Despublicar" : "Publicar"}>
            <Button
              type="text"
              icon={record.isPublished ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
              style={{ color: record.isPublished ? '#f5222d' : '#52c41a' }}
              onClick={() => togglePublishMutation.mutate({ 
                id: record.id, 
                isPublished: !record.isPublished 
              })}
            />
          </Tooltip>
          
          <Popconfirm
            title="Tem certeza que deseja remover este conteúdo?"
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
      isPublished: filters.isPublished ? filters.isPublished[0] : undefined,
      category: filters.category ? filters.category[0] : undefined,
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
      search: values.searchTerm,
      category: values.category,
      isPublished: values.isPublished,
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
      isPublished: undefined,
      category: undefined,
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
      <Title level={2}>Gerenciamento de Conteúdo</Title>
      
      <Card style={{ marginBottom: 24 }}>
        <Form form={form} onFinish={handleSearch} layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="searchTerm" label="Buscar">
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="Título ou slug"
                  allowClear
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="category" label="Categoria">
                <Select placeholder="Todas" allowClear>
                  <Option value="news">Notícias</Option>
                  <Option value="announcement">Anúncios</Option>
                  <Option value="event">Eventos</Option>
                  <Option value="blog">Blog</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="isPublished" label="Status">
                <Select placeholder="Todos" allowClear>
                  <Option value={true}>Publicado</Option>
                  <Option value={false}>Rascunho</Option>
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
            <FileTextOutlined />
            <span>
              {newsContentData?.total || 0} conteúdos encontrados
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
              Criar Conteúdo
            </Button>
          </Space>
        </div>
        
        <Table
          columns={columns}
          dataSource={newsContentData?.data || []}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange as any}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: newsContentData?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} conteúdos`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
      
      {/* Modal para adicionar/editar conteúdo */}
      <Modal
        title={editingContent ? 'Editar Conteúdo' : 'Criar Conteúdo'}
        open={isModalVisible}
        onCancel={handleCloseModal}
        width={1000}
        footer={null}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Editar" key="edit">
            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              initialValues={{
                isPublished: false,
                category: 'news',
                publishDate: dayjs(),
              }}
            >
              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item
                    name="title"
                    label="Título"
                    rules={[{ required: true, message: 'Por favor, insira um título' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                
                <Col span={8}>
                  <Form.Item
                    name="category"
                    label="Categoria"
                    rules={[{ required: true, message: 'Por favor, selecione uma categoria' }]}
                  >
                    <Select>
                      <Option value="news">Notícias</Option>
                      <Option value="announcement">Anúncios</Option>
                      <Option value="event">Eventos</Option>
                      <Option value="blog">Blog</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="slug"
                label="Slug"
                rules={[
                  { required: true, message: 'Por favor, insira um slug' },
                  { pattern: /^[a-z0-9-]+$/, message: 'O slug deve conter apenas letras minúsculas, números e hífens' },
                ]}
                tooltip="URL amigável (ex: noticias-campeonato-2023)"
              >
                <Input />
              </Form.Item>
              
              <Form.Item
                name="summary"
                label="Resumo"
                rules={[{ required: true, message: 'Por favor, insira um resumo' }]}
                tooltip="Breve resumo do conteúdo (exibido em cards e previews)"
              >
                <TextArea rows={2} />
              </Form.Item>
              
              <Form.Item
                name="content"
                label="Conteúdo"
                rules={[{ required: true, message: 'Por favor, insira o conteúdo' }]}
              >
                <ReactQuill
                  theme="snow"
                  modules={modules}
                  formats={formats}
                  style={{ height: 300, marginBottom: 50 }}
                />
              </Form.Item>
              
              <Form.Item
                name="imageUrl"
                label="Imagem de Capa"
                tooltip="Imagem exibida nos cards e no topo do artigo"
                valuePropName="fileList"
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
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="authorId"
                    label="ID do autor"
                    rules={[{ required: true, message: 'Por favor, insira o ID do autor' }]}
                  >
                    <Input type="number" />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    name="publishDate"
                    label="Data de publicação"
                    rules={[{ required: true, message: 'Por favor, selecione uma data' }]}
                  >
                    <DatePicker showTime style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="isPublished"
                label="Publicar imediatamente"
                valuePropName="checked"
              >
                <Switch checkedChildren="Publicado" unCheckedChildren="Rascunho" />
              </Form.Item>
              
              <Form.Item>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    onClick={handlePreview}
                    style={{ marginRight: 8 }}
                  >
                    Visualizar
                  </Button>
                  <Button
                    style={{ marginRight: 8 }}
                    onClick={handleCloseModal}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingContent ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane tab="Visualizar" key="preview" disabled={!isPreviewVisible}>
            {isPreviewVisible && (
              <div className="content-preview">
                <h1>{form.getFieldValue('title')}</h1>
                
                {fileList.length > 0 && fileList[0].url && (
                  <div style={{ marginBottom: 20 }}>
                    <img 
                      src={fileList[0].url} 
                      alt={form.getFieldValue('title')} 
                      style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'cover' }} 
                    />
                  </div>
                )}
                
                <div style={{ marginBottom: 20 }}>
                  <Space split={<Divider type="vertical" />}>
                    <Text type="secondary">
                      {dayjs(form.getFieldValue('publishDate')).format('DD/MM/YYYY')}
                    </Text>
                    <Text type="secondary">
                      <Tag>{form.getFieldValue('category')}</Tag>
                    </Text>
                    <Text type="secondary">
                      {calculateReadTime(form.getFieldValue('content'))} min de leitura
                    </Text>
                  </Space>
                </div>
                
                <Paragraph style={{ marginBottom: 20 }}>
                  <Text strong>{form.getFieldValue('summary')}</Text>
                </Paragraph>
                
                <div
                  className="content-html"
                  dangerouslySetInnerHTML={{ __html: form.getFieldValue('content') }}
                  style={{ marginBottom: 40 }}
                />
                
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="primary"
                    onClick={() => setActiveTab('edit')}
                  >
                    Voltar para Edição
                  </Button>
                </div>
              </div>
            )}
          </TabPane>
        </Tabs>
      </Modal>
    </div>
  );
};

export default NewsContentPage;