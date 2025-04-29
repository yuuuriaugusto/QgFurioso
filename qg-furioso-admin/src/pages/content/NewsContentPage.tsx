import { useState } from 'react';
import { 
  Table, Card, Button, Input, Select, Typography, Space, Row, Col, Form, Tag, 
  Modal, Tabs, Tooltip, Popconfirm, message, Upload, Empty, Image
} from 'antd';
import { 
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, 
  EyeOutlined, CheckCircleOutlined, StopOutlined, ReloadOutlined,
  UploadOutlined, FileImageOutlined, LinkOutlined
} from '@ant-design/icons';
import type { UploadProps, RcFile } from 'antd/es/upload';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNewsContent, fetchNewsContentById, createNewsContent, updateNewsContent, updateNewsStatus, deleteNewsContent, uploadContentImage } from '@api/content';
import type { NewsContent, PaginationParams, SortParams } from '@types';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

// Constantes
const STATUS_MAP: Record<string, { color: string; text: string }> = {
  'draft': { color: 'default', text: 'Rascunho' },
  'published': { color: 'green', text: 'Publicado' },
};

const CATEGORY_OPTIONS = [
  { label: 'Notícias', value: 'news' },
  { label: 'Atualizações', value: 'updates' },
  { label: 'Eventos', value: 'events' },
  { label: 'Promoções', value: 'promos' },
];

const NewsContentPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchForm] = Form.useForm();
  const [contentForm] = Form.useForm();
  
  // Estados
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [editingContent, setEditingContent] = useState<NewsContent | null>(null);
  const [previewContent, setPreviewContent] = useState<NewsContent | null>(null);
  const [activeTab, setActiveTab] = useState('content');
  const [editorContent, setEditorContent] = useState('');
  
  // Estados para filtros e paginação
  const [searchParams, setSearchParams] = useState({
    status: undefined as string | undefined,
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

  // Buscar conteúdos
  const { data: contentData, isLoading, refetch } = useQuery({
    queryKey: ['news-content', searchParams, pagination, sort],
    queryFn: () => fetchNewsContent(searchParams, pagination, sort),
  });

  // Buscar detalhes de um conteúdo específico
  const { data: contentDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['news-content-details', previewContent?.id],
    queryFn: () => previewContent ? fetchNewsContentById(previewContent.id) : null,
    enabled: !!previewContent?.id,
  });

  // Mutações
  const createContentMutation = useMutation({
    mutationFn: (content: Omit<NewsContent, 'id' | 'createdAt' | 'updatedAt'>) => createNewsContent(content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-content'] });
      message.success('Conteúdo criado com sucesso');
      handleCloseCreateModal();
    },
    onError: () => {
      message.error('Erro ao criar conteúdo');
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: ({ id, content }: { id: number; content: Partial<Omit<NewsContent, 'id' | 'createdAt' | 'updatedAt'>> }) => 
      updateNewsContent(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-content'] });
      message.success('Conteúdo atualizado com sucesso');
      handleCloseCreateModal();
    },
    onError: () => {
      message.error('Erro ao atualizar conteúdo');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'published' | 'draft' }) => updateNewsStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-content'] });
      message.success('Status do conteúdo atualizado com sucesso');
    },
    onError: () => {
      message.error('Erro ao atualizar status');
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: (id: number) => deleteNewsContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-content'] });
      message.success('Conteúdo removido com sucesso');
    },
    onError: () => {
      message.error('Erro ao remover conteúdo');
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: (formData: FormData) => uploadContentImage(formData),
    onSuccess: (data) => {
      message.success('Imagem enviada com sucesso');
      // Adiciona a URL da imagem no campo de imagem destacada
      contentForm.setFieldsValue({ featuredImage: data.url });
    },
    onError: () => {
      message.error('Erro ao enviar imagem');
    },
  });

  // Funções para manipulação do modal
  const showCreateModal = () => {
    setEditingContent(null);
    setActiveTab('content');
    contentForm.resetFields();
    contentForm.setFieldsValue({
      status: 'draft',
      category: 'news',
    });
    setEditorContent('');
    setIsCreateModalVisible(true);
  };

  const showEditModal = (content: NewsContent) => {
    setEditingContent(content);
    setActiveTab('content');
    setEditorContent(content.content);
    contentForm.setFieldsValue({
      ...content,
      publishDate: content.publishDate ? dayjs(content.publishDate) : null,
    });
    setIsCreateModalVisible(true);
  };

  const showPreviewModal = (content: NewsContent) => {
    setPreviewContent(content);
    setIsPreviewModalVisible(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalVisible(false);
    setEditingContent(null);
    contentForm.resetFields();
    setEditorContent('');
  };

  // Função para fazer upload da imagem destacada
  const handleBeforeUpload = (file: RcFile): boolean => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Você só pode fazer upload de arquivos de imagem!');
      return false;
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('A imagem deve ser menor que 2MB!');
      return false;
    }
    
    // Criar FormData e fazer upload
    const formData = new FormData();
    formData.append('image', file);
    uploadImageMutation.mutate(formData);
    
    // Retorna false para que o Upload componente não faça o upload automaticamente
    return false;
  };

  // Configuração do componente de upload
  const uploadProps: UploadProps = {
    name: 'image',
    accept: 'image/*',
    showUploadList: false,
    beforeUpload: handleBeforeUpload,
  };

  // Função para submeter o formulário
  const handleSubmit = () => {
    contentForm.validateFields()
      .then(values => {
        const formattedContent = {
          ...values,
          content: editorContent,
          publishDate: values.publishDate ? values.publishDate.toISOString() : null,
        };
        
        if (editingContent) {
          updateContentMutation.mutate({
            id: editingContent.id,
            content: formattedContent,
          });
        } else {
          createContentMutation.mutate(formattedContent);
        }
      })
      .catch(() => {
        message.error('Por favor, corrija os erros no formulário');
      });
  };

  // Função para lidar com a busca
  const handleSearch = (values: any) => {
    setSearchParams({
      search: values.searchTerm,
      status: values.status,
      category: values.category,
    });
    
    setPagination({
      ...pagination,
      page: 1,
    });
  };

  // Função para resetar filtros
  const handleReset = () => {
    searchForm.resetFields();
    setSearchParams({
      status: undefined,
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
      category: filters.category && filters.category.length > 0 ? filters.category[0] : undefined,
    });
    
    // Atualizar ordenação
    if (sorter.field && sorter.order) {
      setSort({
        field: sorter.field,
        order: sorter.order === 'ascend' ? 'ascend' : 'descend',
      });
    }
  };

  // Configuração do editor de texto rico
  const editorModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
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
      title: 'Imagem',
      dataIndex: 'featuredImage',
      key: 'featuredImage',
      width: 100,
      render: (image) => (
        image ? 
          <Image 
            src={image} 
            alt="Thumbnail" 
            width={80} 
            height={45} 
            style={{ objectFit: 'cover' }}
          /> :
          <div style={{ 
            width: 80, 
            height: 45, 
            background: '#f5f5f5', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <FileImageOutlined />
          </div>
      ),
    },
    {
      title: 'Título',
      dataIndex: 'title',
      key: 'title',
      sorter: true,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Categoria',
      dataIndex: 'category',
      key: 'category',
      width: 130,
      render: (category) => {
        const option = CATEGORY_OPTIONS.find(opt => opt.value === category);
        return <Tag>{option?.label || category}</Tag>;
      },
      filters: CATEGORY_OPTIONS.map(option => ({ text: option.label, value: option.value })),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const statusInfo = STATUS_MAP[status] || { color: 'default', text: status };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
      filters: [
        { text: 'Rascunho', value: 'draft' },
        { text: 'Publicado', value: 'published' },
      ],
    },
    {
      title: 'Autor',
      dataIndex: 'author',
      key: 'author',
      width: 120,
    },
    {
      title: 'Publicado em',
      dataIndex: 'publishDate',
      key: 'publishDate',
      sorter: true,
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
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
              onClick={() => showPreviewModal(record)}
            />
          </Tooltip>
          
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          
          {record.status === 'draft' && (
            <Tooltip title="Publicar">
              <Button
                type="text"
                style={{ color: '#52c41a' }}
                icon={<CheckCircleOutlined />}
                onClick={() => updateStatusMutation.mutate({ id: record.id, status: 'published' })}
              />
            </Tooltip>
          )}
          
          {record.status === 'published' && (
            <Tooltip title="Despublicar">
              <Button
                type="text"
                style={{ color: '#faad14' }}
                icon={<StopOutlined />}
                onClick={() => updateStatusMutation.mutate({ id: record.id, status: 'draft' })}
              />
            </Tooltip>
          )}
          
          <Popconfirm
            title="Tem certeza que deseja remover este conteúdo?"
            onConfirm={() => deleteContentMutation.mutate(record.id)}
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

  return (
    <div>
      <Title level={2}>Gerenciamento de Conteúdo</Title>
      
      <Card style={{ marginBottom: 24 }}>
        <Form form={searchForm} onFinish={handleSearch} layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="searchTerm" label="Buscar">
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="Título ou autor"
                  allowClear
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8} lg={4}>
              <Form.Item name="status" label="Status">
                <Select placeholder="Todos" allowClear>
                  <Option value="draft">Rascunho</Option>
                  <Option value="published">Publicado</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8} lg={4}>
              <Form.Item name="category" label="Categoria">
                <Select placeholder="Todas" allowClear>
                  {CATEGORY_OPTIONS.map(option => (
                    <Option key={option.value} value={option.value}>{option.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col xs={24} lg={8}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
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
            <FileImageOutlined />
            <span>
              {contentData?.total || 0} itens encontrados
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
              onClick={showCreateModal}
            >
              Criar Conteúdo
            </Button>
          </Space>
        </div>
        
        <Table
          columns={columns}
          dataSource={contentData?.data || []}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange as any}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: contentData?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} itens`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
      
      {/* Modal para criar/editar conteúdo */}
      <Modal
        title={editingContent ? 'Editar Conteúdo' : 'Criar Conteúdo'}
        open={isCreateModalVisible}
        onCancel={handleCloseCreateModal}
        width={1000}
        footer={[
          <Button key="cancel" onClick={handleCloseCreateModal}>
            Cancelar
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleSubmit}
            loading={createContentMutation.isPending || updateContentMutation.isPending}
          >
            {editingContent ? 'Atualizar' : 'Criar'}
          </Button>,
        ]}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Conteúdo" key="content">
            <Form
              form={contentForm}
              layout="vertical"
              initialValues={{ status: 'draft', category: 'news' }}
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
                    name="status"
                    label="Status"
                    rules={[{ required: true, message: 'Por favor, selecione um status' }]}
                  >
                    <Select>
                      <Option value="draft">Rascunho</Option>
                      <Option value="published">Publicado</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="category"
                    label="Categoria"
                    rules={[{ required: true, message: 'Por favor, selecione uma categoria' }]}
                  >
                    <Select>
                      {CATEGORY_OPTIONS.map(option => (
                        <Option key={option.value} value={option.value}>{option.label}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col span={8}>
                  <Form.Item
                    name="author"
                    label="Autor"
                    rules={[{ required: true, message: 'Por favor, insira o autor' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                
                <Col span={8}>
                  <Form.Item
                    name="publishDate"
                    label="Data de Publicação"
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="slug"
                label="Slug"
                rules={[{ required: true, message: 'Por favor, insira um slug' }]}
              >
                <Input 
                  addonBefore={<LinkOutlined />}
                  placeholder="titulo-da-noticia"
                />
              </Form.Item>
              
              <Form.Item
                name="excerpt"
                label="Resumo"
                rules={[{ required: true, message: 'Por favor, insira um resumo' }]}
              >
                <TextArea rows={3} />
              </Form.Item>
              
              <Form.Item
                label="Conteúdo"
                rules={[{ required: true, message: 'Por favor, insira o conteúdo' }]}
              >
                <ReactQuill 
                  theme="snow" 
                  value={editorContent} 
                  onChange={setEditorContent}
                  modules={editorModules}
                  style={{ height: 300, marginBottom: 50 }}
                />
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane tab="Mídias" key="media">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="featuredImage"
                  label="Imagem Destacada"
                >
                  <Input 
                    addonAfter={
                      <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />}>Upload</Button>
                      </Upload>
                    }
                    placeholder="URL da imagem"
                  />
                </Form.Item>
                
                <div style={{ marginTop: 16 }}>
                  {contentForm.getFieldValue('featuredImage') ? (
                    <div style={{ marginBottom: 16 }}>
                      <p>Imagem atual:</p>
                      <Image 
                        src={contentForm.getFieldValue('featuredImage')}
                        alt="Imagem destacada"
                        width={300}
                        style={{ maxHeight: 200, objectFit: 'contain' }}
                      />
                    </div>
                  ) : (
                    <Empty 
                      image={Empty.PRESENTED_IMAGE_SIMPLE} 
                      description="Nenhuma imagem destacada"
                    />
                  )}
                </div>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  name="metaTitle"
                  label="Meta Título (SEO)"
                >
                  <Input placeholder="Título para SEO" />
                </Form.Item>
                
                <Form.Item
                  name="metaDescription"
                  label="Meta Descrição (SEO)"
                >
                  <TextArea 
                    rows={4}
                    placeholder="Descrição para SEO"
                  />
                </Form.Item>
                
                <Form.Item
                  name="tags"
                  label="Tags"
                >
                  <Select 
                    mode="tags" 
                    style={{ width: '100%' }}
                    placeholder="Adicione tags"
                    tokenSeparators={[',']}
                  />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Modal>
      
      {/* Modal para visualizar conteúdo */}
      <Modal
        title={contentDetails?.title || 'Visualização de Conteúdo'}
        open={isPreviewModalVisible}
        onCancel={() => setIsPreviewModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setIsPreviewModalVisible(false)}>
            Fechar
          </Button>,
          <Button 
            key="edit" 
            type="primary" 
            onClick={() => {
              setIsPreviewModalVisible(false);
              if (previewContent) {
                showEditModal(previewContent);
              }
            }}
          >
            Editar
          </Button>,
        ]}
      >
        {isLoadingDetails ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Carregando conteúdo...</div>
          </div>
        ) : contentDetails ? (
          <div className="content-preview">
            {contentDetails.featuredImage && (
              <div style={{ marginBottom: 16 }}>
                <Image 
                  src={contentDetails.featuredImage}
                  alt={contentDetails.title}
                  style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }}
                />
              </div>
            )}
            
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Tag color={STATUS_MAP[contentDetails.status]?.color}>
                  {STATUS_MAP[contentDetails.status]?.text}
                </Tag>
                <Tag>
                  {CATEGORY_OPTIONS.find(c => c.value === contentDetails.category)?.label || contentDetails.category}
                </Tag>
              </Space>
            </div>
            
            <Title level={3}>{contentDetails.title}</Title>
            
            <Paragraph type="secondary">
              Por {contentDetails.author || 'Desconhecido'} 
              {contentDetails.publishDate && ` • ${dayjs(contentDetails.publishDate).format('DD/MM/YYYY')}`}
            </Paragraph>
            
            <Paragraph strong>{contentDetails.excerpt}</Paragraph>
            
            <div 
              className="content-html"
              dangerouslySetInnerHTML={{ __html: contentDetails.content }}
              style={{ 
                border: '1px solid #f0f0f0', 
                padding: 16, 
                borderRadius: 4,
                background: '#fff' 
              }}
            />
            
            {contentDetails.tags && contentDetails.tags.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Tags: </Text>
                <Space size={[0, 8]} wrap>
                  {contentDetails.tags.map((tag, index) => (
                    <Tag key={index}>{tag}</Tag>
                  ))}
                </Space>
              </div>
            )}
          </div>
        ) : (
          <Empty description="Conteúdo não encontrado" />
        )}
      </Modal>
    </div>
  );
};

export default NewsContentPage;