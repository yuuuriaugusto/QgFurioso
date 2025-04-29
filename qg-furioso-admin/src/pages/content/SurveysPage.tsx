import { useState, useEffect } from 'react';
import { 
  Table, Card, Button, Input, Select, Typography, Space, Row, Col, Form, Tag, 
  Modal, Tabs, Tooltip, Popconfirm, message, Steps, Divider, Badge, Drawer,
  List, Progress, Collapse, Statistic, DatePicker, Empty
} from 'antd';
import { 
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, 
  CheckCircleOutlined, CloseCircleOutlined, QuestionOutlined,
  ReloadOutlined, FormOutlined, EyeOutlined, BarChartOutlined,
  MinusCircleOutlined, PlusCircleOutlined, ArrowRightOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSurveys, fetchSurvey, fetchSurveyQuestions, fetchSurveyResults, fetchSurveyResponses, createSurvey, updateSurvey, updateSurveyStatus, deleteSurvey } from '@api/content';
import type { Survey, SurveyQuestion, PaginationParams, SortParams } from '@types';
import type { ColumnsType } from 'antd/es/table';
import type { TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, Legend } from 'recharts';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Step } = Steps;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;

// Cores para gráficos
const CHART_COLORS = [
  '#1890ff', '#52c41a', '#722ed1', '#fa8c16', '#fa541c', '#eb2f96',
  '#f5222d', '#faad14', '#a0d911', '#13c2c2', '#2f54eb', '#eb2f96'
];

const SurveysPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchForm] = Form.useForm();
  const [surveyForm] = Form.useForm();
  
  // Estados
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isResultsDrawerVisible, setIsResultsDrawerVisible] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);
  const [currentSurvey, setCurrentSurvey] = useState<number | null>(null);
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([]);
  const [activeTab, setActiveTab] = useState('info');
  const [currentStep, setCurrentStep] = useState(0);
  
  // Estados para filtros e paginação
  const [searchParams, setSearchParams] = useState({
    status: undefined as string | undefined,
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
  
  // Estados para paginação de respostas
  const [responsesPagination, setResponsesPagination] = useState<PaginationParams>({
    page: 1,
    pageSize: 5,
  });

  // Buscar pesquisas
  const { data: surveysData, isLoading: isLoadingSurveys, refetch } = useQuery({
    queryKey: ['surveys', searchParams, pagination, sort],
    queryFn: () => fetchSurveys(searchParams, pagination, sort),
  });

  // Buscar detalhes da pesquisa atual (para edição ou visualização)
  const { data: surveyDetails, isLoading: isLoadingSurveyDetails } = useQuery({
    queryKey: ['survey-details', currentSurvey],
    queryFn: () => currentSurvey ? fetchSurvey(currentSurvey) : null,
    enabled: !!currentSurvey,
  });

  // Buscar perguntas da pesquisa
  const { data: questionData, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ['survey-questions', currentSurvey],
    queryFn: () => currentSurvey ? fetchSurveyQuestions(currentSurvey) : null,
    enabled: !!currentSurvey,
    onSuccess: (data) => {
      if (data) {
        setSurveyQuestions(data);
      }
    },
  });

  // Buscar resultados da pesquisa
  const { data: surveyResults, isLoading: isLoadingResults } = useQuery({
    queryKey: ['survey-results', currentSurvey],
    queryFn: () => currentSurvey ? fetchSurveyResults(currentSurvey) : null,
    enabled: !!currentSurvey && isResultsDrawerVisible,
  });

  // Buscar respostas individuais da pesquisa
  const { data: surveyResponses, isLoading: isLoadingResponses } = useQuery({
    queryKey: ['survey-responses', currentSurvey, responsesPagination],
    queryFn: () => currentSurvey ? fetchSurveyResponses(currentSurvey, responsesPagination) : null,
    enabled: !!currentSurvey && isResultsDrawerVisible,
  });

  // Mutações
  const createSurveyMutation = useMutation({
    mutationFn: ({ survey, questions }: { survey: Omit<Survey, 'id' | 'createdAt' | 'updatedAt'>; questions: Omit<SurveyQuestion, 'id' | 'surveyId'>[] }) => 
      createSurvey(survey, questions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      message.success('Pesquisa criada com sucesso');
      handleCloseCreateModal();
    },
    onError: () => {
      message.error('Erro ao criar pesquisa');
    },
  });

  const updateSurveyMutation = useMutation({
    mutationFn: ({ id, survey, questions }: { id: number; survey: Partial<Omit<Survey, 'id' | 'createdAt' | 'updatedAt'>>; questions?: Omit<SurveyQuestion, 'surveyId'>[] }) => 
      updateSurvey(id, survey, questions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      queryClient.invalidateQueries({ queryKey: ['survey-details', currentSurvey] });
      queryClient.invalidateQueries({ queryKey: ['survey-questions', currentSurvey] });
      message.success('Pesquisa atualizada com sucesso');
      handleCloseCreateModal();
    },
    onError: () => {
      message.error('Erro ao atualizar pesquisa');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateSurveyStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      message.success('Status da pesquisa atualizado com sucesso');
    },
    onError: () => {
      message.error('Erro ao atualizar status');
    },
  });

  const deleteSurveyMutation = useMutation({
    mutationFn: (id: number) => deleteSurvey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      message.success('Pesquisa removida com sucesso');
    },
    onError: () => {
      message.error('Erro ao remover pesquisa');
    },
  });

  // Efeito para configurar o formulário ao editar
  useEffect(() => {
    if (editingSurvey && currentStep === 0) {
      surveyForm.setFieldsValue({
        ...editingSurvey,
        startDate: editingSurvey.startDate ? dayjs(editingSurvey.startDate) : null,
        endDate: editingSurvey.endDate ? dayjs(editingSurvey.endDate) : null,
      });
    }
  }, [editingSurvey, currentStep, surveyForm]);

  // Funções para manipulação do modal
  const showCreateModal = () => {
    setEditingSurvey(null);
    setCurrentSurvey(null);
    setSurveyQuestions([]);
    setCurrentStep(0);
    setActiveTab('info');
    surveyForm.resetFields();
    surveyForm.setFieldsValue({
      status: 'draft',
      coinReward: 50,
    });
    setIsCreateModalVisible(true);
  };

  const showEditModal = (survey: Survey) => {
    setEditingSurvey(survey);
    setCurrentSurvey(survey.id);
    setCurrentStep(0);
    setActiveTab('info');
    setIsCreateModalVisible(true);
  };

  const showResultsDrawer = (survey: Survey) => {
    setCurrentSurvey(survey.id);
    setIsResultsDrawerVisible(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalVisible(false);
    setEditingSurvey(null);
    setCurrentSurvey(null);
    setSurveyQuestions([]);
    setCurrentStep(0);
    surveyForm.resetFields();
  };

  // Funções para o formulário de perguntas
  const addQuestion = () => {
    const newQuestion: Omit<SurveyQuestion, 'id' | 'surveyId'> = {
      questionText: '',
      questionType: 'multiple_choice',
      options: [''],
      isRequired: true,
      orderIndex: surveyQuestions.length,
    };
    
    setSurveyQuestions([...surveyQuestions, newQuestion as SurveyQuestion]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...surveyQuestions];
    (updatedQuestions[index] as any)[field] = value;
    setSurveyQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...surveyQuestions];
    updatedQuestions.splice(index, 1);
    // Reordenar índices
    updatedQuestions.forEach((q, i) => q.orderIndex = i);
    setSurveyQuestions(updatedQuestions);
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...surveyQuestions];
    const question = updatedQuestions[questionIndex];
    if (question.options) {
      question.options.push('');
    } else {
      question.options = [''];
    }
    setSurveyQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...surveyQuestions];
    const question = updatedQuestions[questionIndex];
    if (question.options) {
      question.options[optionIndex] = value;
      setSurveyQuestions(updatedQuestions);
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...surveyQuestions];
    const question = updatedQuestions[questionIndex];
    if (question.options && question.options.length > 1) {
      question.options.splice(optionIndex, 1);
      setSurveyQuestions(updatedQuestions);
    }
  };

  // Função para avançar no assistente de criação
  const handleNextStep = async () => {
    if (currentStep === 0) {
      try {
        await surveyForm.validateFields();
        setCurrentStep(1);
      } catch (error) {
        console.error('Formulário inválido:', error);
      }
    }
  };

  // Função para retornar no assistente de criação
  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Função para submeter o formulário
  const handleSubmit = () => {
    surveyForm.validateFields()
      .then(values => {
        // Validar perguntas
        if (surveyQuestions.length === 0) {
          message.error('A pesquisa deve ter pelo menos uma pergunta');
          return;
        }
        
        // Verificar se todas as perguntas estão preenchidas
        const invalidQuestions = surveyQuestions.some(q => 
          !q.questionText || 
          (q.questionType === 'multiple_choice' && (!q.options || q.options.some(o => !o)))
        );
        
        if (invalidQuestions) {
          message.error('Todas as perguntas devem estar corretamente preenchidas');
          return;
        }
        
        const formattedQuestions = surveyQuestions.map(q => ({
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          isRequired: q.isRequired,
          orderIndex: q.orderIndex,
        }));
        
        const surveyData = {
          ...values,
          startDate: values.startDate ? values.startDate.toISOString() : null,
          endDate: values.endDate ? values.endDate.toISOString() : null,
        };
        
        if (editingSurvey) {
          updateSurveyMutation.mutate({
            id: editingSurvey.id,
            survey: surveyData,
            questions: formattedQuestions,
          });
        } else {
          createSurveyMutation.mutate({
            survey: surveyData,
            questions: formattedQuestions,
          });
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

  // Colunas da tabela
  const columns: ColumnsType<Survey> = [
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
      title: 'Recompensa',
      dataIndex: 'coinReward',
      key: 'coinReward',
      width: 120,
      sorter: true,
      render: (coins) => (
        <Text strong>{coins} coins</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        let color = '';
        let text = '';
        
        switch (status) {
          case 'draft':
            color = 'default';
            text = 'Rascunho';
            break;
          case 'active':
            color = 'green';
            text = 'Ativa';
            break;
          case 'closed':
            color = 'red';
            text = 'Encerrada';
            break;
          default:
            color = 'default';
            text = status;
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: 'Rascunho', value: 'draft' },
        { text: 'Ativa', value: 'active' },
        { text: 'Encerrada', value: 'closed' },
      ],
    },
    {
      title: 'Período',
      key: 'period',
      render: (_, record) => {
        const startDate = record.startDate ? dayjs(record.startDate).format('DD/MM/YYYY') : '-';
        const endDate = record.endDate ? dayjs(record.endDate).format('DD/MM/YYYY') : '-';
        
        return `${startDate} até ${endDate}`;
      },
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
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
              disabled={record.status !== 'draft'}
            />
          </Tooltip>
          
          <Tooltip title="Ver Resultados">
            <Button
              type="text"
              icon={<BarChartOutlined />}
              onClick={() => showResultsDrawer(record)}
            />
          </Tooltip>
          
          {record.status === 'draft' && (
            <Tooltip title="Ativar">
              <Button
                type="text"
                style={{ color: '#52c41a' }}
                icon={<CheckCircleOutlined />}
                onClick={() => updateStatusMutation.mutate({ id: record.id, status: 'active' })}
              />
            </Tooltip>
          )}
          
          {record.status === 'active' && (
            <Tooltip title="Encerrar">
              <Button
                type="text"
                style={{ color: '#f5222d' }}
                icon={<CloseCircleOutlined />}
                onClick={() => updateStatusMutation.mutate({ id: record.id, status: 'closed' })}
              />
            </Tooltip>
          )}
          
          {record.status === 'draft' && (
            <Popconfirm
              title="Tem certeza que deseja remover esta pesquisa?"
              onConfirm={() => deleteSurveyMutation.mutate(record.id)}
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
          )}
        </Space>
      ),
    },
  ];

  // Renderizar o formulário de informações básicas
  const renderBasicInfoForm = () => (
    <Form
      form={surveyForm}
      layout="vertical"
      initialValues={{ status: 'draft', coinReward: 50 }}
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
              <Option value="active">Ativa</Option>
              <Option value="closed">Encerrada</Option>
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
        <Col span={8}>
          <Form.Item
            name="coinReward"
            label="Recompensa (Coins)"
            rules={[
              { required: true, message: 'Por favor, insira a recompensa' },
              { type: 'number', min: 1, message: 'A recompensa deve ser maior que 0' },
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        
        <Col span={8}>
          <Form.Item
            name="startDate"
            label="Data de início"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        
        <Col span={8}>
          <Form.Item
            name="endDate"
            label="Data de término"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );

  // Renderizar o formulário de perguntas
  const renderQuestionsForm = () => (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={addQuestion}>
          Adicionar Pergunta
        </Button>
      </div>
      
      {surveyQuestions.length === 0 ? (
        <Empty 
          description="Adicione perguntas à pesquisa" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
        />
      ) : (
        <div className="questions-container">
          {surveyQuestions.map((question, questionIndex) => (
            <Card 
              key={questionIndex} 
              title={`Pergunta ${questionIndex + 1}`}
              style={{ marginBottom: 16 }}
              extra={
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => removeQuestion(questionIndex)}
                />
              }
            >
              <Row gutter={16}>
                <Col span={16}>
                  <Form.Item
                    label="Texto da pergunta"
                    required
                  >
                    <Input
                      value={question.questionText}
                      onChange={(e) => updateQuestion(questionIndex, 'questionText', e.target.value)}
                      placeholder="Ex: Qual sua opinião sobre..."
                    />
                  </Form.Item>
                </Col>
                
                <Col span={8}>
                  <Form.Item
                    label="Tipo de pergunta"
                    required
                  >
                    <Select
                      value={question.questionType}
                      onChange={(value) => updateQuestion(questionIndex, 'questionType', value)}
                    >
                      <Option value="multiple_choice">Múltipla Escolha</Option>
                      <Option value="text">Texto</Option>
                      <Option value="scale">Escala (1-5)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item>
                <Checkbox
                  checked={question.isRequired}
                  onChange={(e) => updateQuestion(questionIndex, 'isRequired', e.target.checked)}
                >
                  Resposta obrigatória
                </Checkbox>
              </Form.Item>
              
              {question.questionType === 'multiple_choice' && (
                <div>
                  <Divider orientation="left">Opções</Divider>
                  
                  {question.options?.map((option, optionIndex) => (
                    <Row key={optionIndex} gutter={8} style={{ marginBottom: 8 }}>
                      <Col flex="auto">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                          placeholder={`Opção ${optionIndex + 1}`}
                        />
                      </Col>
                      <Col>
                        <Button
                          type="text"
                          danger
                          icon={<MinusCircleOutlined />}
                          onClick={() => removeOption(questionIndex, optionIndex)}
                          disabled={question.options?.length === 1}
                        />
                      </Col>
                    </Row>
                  ))}
                  
                  <Button
                    type="dashed"
                    onClick={() => addOption(questionIndex)}
                    block
                    icon={<PlusOutlined />}
                    style={{ marginTop: 8 }}
                  >
                    Adicionar opção
                  </Button>
                </div>
              )}
              
              {question.questionType === 'scale' && (
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">Os usuários poderão responder em uma escala de 1 a 5.</Text>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // Renderizar os resultados da pesquisa
  const renderSurveyResults = () => {
    if (!surveyResults || !questionData) {
      return <Empty description="Sem dados disponíveis" />;
    }
    
    return (
      <div>
        {questionData.map((question, index) => (
          <Card 
            key={index} 
            title={`Pergunta ${index + 1}: ${question.questionText}`}
            style={{ marginBottom: 16 }}
          >
            {question.questionType === 'multiple_choice' && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={surveyResults.questionStats[index]?.optionCounts || []}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="option"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {surveyResults.questionStats[index]?.optionCounts?.map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartTooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {question.questionType === 'scale' && (
              <Row gutter={16}>
                <Col span={16}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={surveyResults.questionStats[index]?.optionCounts || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="option" />
                      <YAxis />
                      <RechartTooltip />
                      <Bar dataKey="count" fill="#1890ff" />
                    </BarChart>
                  </ResponsiveContainer>
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="Média" 
                    value={surveyResults.questionStats[index]?.average || 0} 
                    precision={1}
                  />
                  <Statistic 
                    title="Total de respostas" 
                    value={surveyResults.questionStats[index]?.total || 0} 
                    style={{ marginTop: 16 }}
                  />
                </Col>
              </Row>
            )}
            
            {question.questionType === 'text' && (
              <div>
                <Text>Total de respostas: {surveyResults.questionStats[index]?.total || 0}</Text>
                <List
                  bordered
                  dataSource={surveyResults.questionStats[index]?.textResponses || []}
                  renderItem={(item) => (
                    <List.Item>
                      {item}
                    </List.Item>
                  )}
                  pagination={{
                    pageSize: 5,
                    size: 'small',
                  }}
                />
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  };

  // Renderizar as respostas individuais
  const renderIndividualResponses = () => {
    if (!surveyResponses || !questionData) {
      return <Empty description="Sem dados disponíveis" />;
    }
    
    return (
      <div>
        <List
          itemLayout="vertical"
          dataSource={surveyResponses.data || []}
          renderItem={(response) => (
            <Card style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <Space>
                  <Text strong>ID do Usuário:</Text>
                  <Text>{response.userId}</Text>
                </Space>
                <div>
                  <Text type="secondary">
                    Concluído em {dayjs(response.completedAt).format('DD/MM/YYYY HH:mm')}
                  </Text>
                </div>
                <div>
                  <Badge 
                    status={response.rewardIssued ? 'success' : 'warning'} 
                    text={response.rewardIssued ? 'Recompensa entregue' : 'Recompensa pendente'} 
                  />
                </div>
              </div>
              
              <Collapse>
                <Panel header="Ver respostas detalhadas" key="1">
                  <List
                    itemLayout="vertical"
                    dataSource={questionData}
                    renderItem={(question, qIndex) => {
                      const answer = response.answers[`q${question.id}`];
                      return (
                        <div style={{ marginBottom: 16 }}>
                          <Text strong>{question.questionText}</Text>
                          <div style={{ marginTop: 8 }}>
                            {question.questionType === 'multiple_choice' && (
                              <Tag color="blue">{answer}</Tag>
                            )}
                            
                            {question.questionType === 'scale' && (
                              <Rate disabled defaultValue={Number(answer)} />
                            )}
                            
                            {question.questionType === 'text' && (
                              <div style={{ background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                                {answer}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }}
                  />
                </Panel>
              </Collapse>
            </Card>
          )}
          pagination={{
            current: responsesPagination.page,
            pageSize: responsesPagination.pageSize,
            total: surveyResponses.total || 0,
            onChange: (page, pageSize) => {
              setResponsesPagination({
                page,
                pageSize: pageSize || 5,
              });
            },
          }}
        />
      </div>
    );
  };

  return (
    <div>
      <Title level={2}>Gerenciamento de Pesquisas</Title>
      
      <Card style={{ marginBottom: 24 }}>
        <Form form={searchForm} onFinish={handleSearch} layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="searchTerm" label="Buscar">
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="Título ou descrição"
                  allowClear
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="status" label="Status">
                <Select placeholder="Todos" allowClear>
                  <Option value="draft">Rascunho</Option>
                  <Option value="active">Ativa</Option>
                  <Option value="closed">Encerrada</Option>
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
            <FormOutlined />
            <span>
              {surveysData?.total || 0} pesquisas encontradas
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
              Criar Pesquisa
            </Button>
          </Space>
        </div>
        
        <Table
          columns={columns}
          dataSource={surveysData?.data || []}
          rowKey="id"
          loading={isLoadingSurveys}
          onChange={handleTableChange as any}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: surveysData?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `Total: ${total} pesquisas`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
      
      {/* Modal para criar/editar pesquisa */}
      <Modal
        title={editingSurvey ? 'Editar Pesquisa' : 'Criar Pesquisa'}
        open={isCreateModalVisible}
        onCancel={handleCloseCreateModal}
        footer={null}
        width={800}
      >
        <Steps
          current={currentStep}
          style={{ marginBottom: 24 }}
        >
          <Step title="Informações" description="Detalhes básicos" />
          <Step title="Perguntas" description="Conteúdo da pesquisa" />
        </Steps>
        
        <div style={{ marginBottom: 24 }}>
          {currentStep === 0 && renderBasicInfoForm()}
          {currentStep === 1 && renderQuestionsForm()}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {currentStep > 0 && (
            <Button onClick={handlePreviousStep}>
              Voltar
            </Button>
          )}
          
          <div style={{ marginLeft: 'auto' }}>
            <Button 
              style={{ marginRight: 8 }} 
              onClick={handleCloseCreateModal}
              disabled={createSurveyMutation.isPending || updateSurveyMutation.isPending}
            >
              Cancelar
            </Button>
            
            {currentStep === 0 && (
              <Button type="primary" onClick={handleNextStep}>
                Próximo <ArrowRightOutlined />
              </Button>
            )}
            
            {currentStep === 1 && (
              <Button 
                type="primary" 
                onClick={handleSubmit}
                loading={createSurveyMutation.isPending || updateSurveyMutation.isPending}
              >
                {editingSurvey ? 'Atualizar' : 'Criar'} Pesquisa
              </Button>
            )}
          </div>
        </div>
      </Modal>
      
      {/* Drawer para visualizar resultados */}
      <Drawer
        title={`Resultados da Pesquisa: ${surveyDetails?.title || ''}`}
        width={800}
        placement="right"
        onClose={() => setIsResultsDrawerVisible(false)}
        open={isResultsDrawerVisible}
      >
        {isLoadingSurveyDetails || isLoadingQuestions || isLoadingResults ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Carregando resultados...</div>
          </div>
        ) : (
          <Tabs defaultActiveKey="summary">
            <TabPane tab="Resumo" key="summary">
              <Card style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Statistic 
                      title="Total de Respostas" 
                      value={surveyResults?.totalResponses || 0}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  
                  <Col span={8}>
                    <Statistic 
                      title="Taxa de Conclusão" 
                      value={surveyResults?.completionRate || 0} 
                      suffix="%" 
                      precision={1}
                      valueStyle={{ color: surveyResults?.completionRate > 50 ? '#52c41a' : '#f5222d' }}
                    />
                  </Col>
                  
                  <Col span={8}>
                    <Statistic 
                      title="Coins Distribuídos" 
                      value={(surveyResults?.totalResponses || 0) * (surveyDetails?.coinReward || 0)} 
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Col>
                </Row>
              </Card>
              
              {renderSurveyResults()}
            </TabPane>
            
            <TabPane tab="Respostas Individuais" key="individual">
              {renderIndividualResponses()}
            </TabPane>
          </Tabs>
        )}
      </Drawer>
    </div>
  );
};

export default SurveysPage;