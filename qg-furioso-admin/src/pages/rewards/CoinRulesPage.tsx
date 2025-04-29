import { useState } from 'react';
import { 
  Card, Typography, Form, InputNumber, Button, Table, Space, 
  Tooltip, Popconfirm, message, Alert, Switch, Divider, Row, Col
} from 'antd';
import { 
  SaveOutlined, PlusOutlined, DeleteOutlined, EditOutlined, 
  ReloadOutlined, CrownOutlined, QuestionCircleOutlined 
} from '@ant-design/icons';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchCoinRules, updateCoinRules } from '@api/shop';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text, Paragraph } = Typography;

interface CoinRuleTableItem {
  key: string;
  name: string;
  displayName: string;
  coins: number;
  description: string;
  active: boolean;
}

const CoinRulesPage: React.FC = () => {
  const [form] = Form.useForm();
  const [editableKeys, setEditableKeys] = useState<string[]>([]);
  const [isAddMode, setIsAddMode] = useState(false);
  const [newRuleType, setNewRuleType] = useState('');
  const [newRuleForm] = Form.useForm();
  
  // Buscar regras de moedas
  const { data: coinRules, isLoading, refetch } = useQuery({
    queryKey: ['coin-rules'],
    queryFn: fetchCoinRules,
  });
  
  // Mutação para atualizar regras
  const updateRulesMutation = useMutation({
    mutationFn: updateCoinRules,
    onSuccess: () => {
      message.success('Regras atualizadas com sucesso');
      refetch();
    },
    onError: () => {
      message.error('Erro ao atualizar regras');
    },
  });
  
  // Converter regras para formato de tabela
  const getTableData = (): CoinRuleTableItem[] => {
    if (!coinRules) return [];
    
    const ruleMapping: Record<string, { displayName: string; description: string }> = {
      'profile_completion': { 
        displayName: 'Completar Perfil', 
        description: 'Recompensa por preencher completamente o perfil' 
      },
      'kyc_verification': { 
        displayName: 'Verificação KYC', 
        description: 'Recompensa por completar verificação de identidade' 
      },
      'daily_login': { 
        displayName: 'Login Diário', 
        description: 'Recompensa por fazer login diariamente' 
      },
      'social_link': { 
        displayName: 'Vincular Rede Social', 
        description: 'Recompensa por cada rede social vinculada' 
      },
      'twitter_follow': { 
        displayName: 'Seguir no Twitter', 
        description: 'Recompensa por seguir a FURIA no Twitter' 
      },
      'instagram_follow': { 
        displayName: 'Seguir no Instagram', 
        description: 'Recompensa por seguir a FURIA no Instagram' 
      },
      'discord_join': { 
        displayName: 'Entrar no Discord', 
        description: 'Recompensa por entrar no servidor Discord da FURIA' 
      },
      'survey_completion': { 
        displayName: 'Completar Pesquisa', 
        description: 'Recompensa base por completar pesquisas (pode ser ajustada por pesquisa)' 
      },
      'referral': { 
        displayName: 'Indicação de Amigo', 
        description: 'Recompensa por indicar um amigo que se registre' 
      },
      'stream_watch': { 
        displayName: 'Assistir Stream', 
        description: 'Recompensa por assistir transmissões ao vivo (por hora)' 
      },
      'newsletter_signup': { 
        displayName: 'Inscrição Newsletter', 
        description: 'Recompensa por se inscrever na newsletter' 
      }
    };
    
    return Object.entries(coinRules).map(([key, value]) => ({
      key,
      name: key,
      displayName: ruleMapping[key]?.displayName || key,
      coins: value,
      description: ruleMapping[key]?.description || 'Sem descrição disponível',
      active: value > 0,
    }));
  };
  
  // Salvar alterações em uma regra específica
  const handleSaveRule = (key: string, newCoins: number) => {
    if (!coinRules) return;
    
    const updatedRules = { ...coinRules, [key]: newCoins };
    updateRulesMutation.mutate(updatedRules);
    setEditableKeys([]);
  };
  
  // Adicionar nova regra
  const handleAddRule = (values: { name: string; displayName: string; coins: number; description: string }) => {
    if (!coinRules) return;
    
    const newRuleName = values.name.trim().toLowerCase().replace(/\s+/g, '_');
    
    if (coinRules[newRuleName] !== undefined) {
      message.error('Esta regra já existe');
      return;
    }
    
    const updatedRules = { ...coinRules, [newRuleName]: values.coins };
    updateRulesMutation.mutate(updatedRules);
    setIsAddMode(false);
    newRuleForm.resetFields();
  };
  
  // Remover uma regra
  const handleRemoveRule = (key: string) => {
    if (!coinRules) return;
    
    const { [key]: _, ...updatedRules } = coinRules;
    updateRulesMutation.mutate(updatedRules);
  };
  
  // Atualizar status ativo/inativo
  const handleToggleActive = (key: string, active: boolean) => {
    if (!coinRules) return;
    
    const newValue = active ? 0 : (coinRules[key] > 0 ? coinRules[key] : 10);
    const updatedRules = { ...coinRules, [key]: active ? 0 : newValue };
    updateRulesMutation.mutate(updatedRules);
  };
  
  // Colunas da tabela
  const columns: ColumnsType<CoinRuleTableItem> = [
    {
      title: 'Nome',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (text, record) => (
        <Space>
          <Text strong>{text}</Text>
          <Tooltip title={record.description}>
            <QuestionCircleOutlined style={{ color: '#1890ff' }} />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Chave',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (text) => <Text type="secondary" copyable>{text}</Text>,
    },
    {
      title: 'Coins',
      dataIndex: 'coins',
      key: 'coins',
      width: 180,
      render: (coins, record) => {
        const isEditing = editableKeys.includes(record.key);
        
        return isEditing ? (
          <Form form={form}>
            <Form.Item
              name={`coins_${record.key}`}
              initialValue={coins}
              style={{ margin: 0 }}
              rules={[
                { required: true, message: 'Obrigatório' },
                { type: 'number', min: 0, message: 'Valor mínimo: 0' },
              ]}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                autoFocus
              />
            </Form.Item>
          </Form>
        ) : (
          <Text 
            style={{ 
              color: record.active ? '#52c41a' : '#f5222d', 
              fontWeight: 'bold' 
            }}
          >
            <CrownOutlined style={{ marginRight: 8 }} />
            {coins}
          </Text>
        );
      },
    },
    {
      title: 'Ativo',
      dataIndex: 'active',
      key: 'active',
      width: 100,
      render: (active, record) => (
        <Switch
          checked={active}
          onChange={(checked) => handleToggleActive(record.key, !checked)}
          disabled={editableKeys.includes(record.key)}
        />
      ),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 150,
      render: (_, record) => {
        const isEditing = editableKeys.includes(record.key);
        
        return isEditing ? (
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => {
                form.validateFields([`coins_${record.key}`])
                  .then(values => {
                    handleSaveRule(record.key, values[`coins_${record.key}`]);
                  })
                  .catch(error => {
                    console.error('Validation failed:', error);
                  });
              }}
            >
              Salvar
            </Button>
            <Button
              onClick={() => setEditableKeys([])}
            >
              Cancelar
            </Button>
          </Space>
        ) : (
          <Space>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                form.setFieldsValue({ [`coins_${record.key}`]: record.coins });
                setEditableKeys([record.key]);
              }}
              disabled={editableKeys.length > 0}
            />
            <Popconfirm
              title="Tem certeza que deseja remover esta regra?"
              onConfirm={() => handleRemoveRule(record.key)}
              okText="Sim"
              cancelText="Não"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={editableKeys.length > 0}
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  
  return (
    <div>
      <Title level={2}>Regras de Moedas</Title>
      
      <Alert
        message="Regras de Atribuição de Coins"
        description={
          <Paragraph>
            Defina aqui as regras para ganho de coins dos usuários. Alterações nessas regras afetam imediatamente o funcionamento do sistema.
            Desativar uma regra (0 coins) significa que os usuários não receberão coins por esta ação.
          </Paragraph>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />
      
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space>
            <CrownOutlined />
            <Text>{getTableData().length} regras configuradas</Text>
          </Space>
          
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={isLoading}
            >
              Atualizar
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAddMode(true)}
              disabled={isAddMode}
            >
              Adicionar Regra
            </Button>
          </Space>
        </div>
        
        {isAddMode && (
          <Card style={{ marginBottom: 16, background: '#f9f9f9' }}>
            <Form
              form={newRuleForm}
              onFinish={handleAddRule}
              layout="vertical"
              initialValues={{ coins: 10 }}
            >
              <Row gutter={16}>
                <Col span={10}>
                  <Form.Item
                    name="name"
                    label="Chave da regra"
                    rules={[
                      { required: true, message: 'Por favor, insira uma chave' },
                      { pattern: /^[a-z0-9_]+$/, message: 'Use apenas letras minúsculas, números e underscore' },
                    ]}
                    tooltip="Identificador único usado no código, ex: 'daily_login'"
                  >
                    <Input 
                      placeholder="ex: daily_login" 
                      onChange={(e) => setNewRuleType(e.target.value)}
                    />
                  </Form.Item>
                </Col>
                
                <Col span={8}>
                  <Form.Item
                    name="displayName"
                    label="Nome de exibição"
                    rules={[{ required: true, message: 'Por favor, insira um nome' }]}
                    tooltip="Nome amigável exibido na interface"
                  >
                    <Input placeholder="ex: Login Diário" />
                  </Form.Item>
                </Col>
                
                <Col span={6}>
                  <Form.Item
                    name="coins"
                    label="Quantidade de Coins"
                    rules={[
                      { required: true, message: 'Obrigatório' },
                      { type: 'number', min: 0, message: 'Valor mínimo: 0' },
                    ]}
                    tooltip="Quantidade de coins a ser concedida"
                  >
                    <InputNumber 
                      min={0} 
                      style={{ width: '100%' }} 
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="description"
                label="Descrição"
                rules={[{ required: true, message: 'Por favor, insira uma descrição' }]}
                tooltip="Explicação sobre quando e como esta regra é aplicada"
              >
                <TextArea rows={2} placeholder="Descreva quando esta regra será aplicada" />
              </Form.Item>
              
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Salvar
                  </Button>
                  <Button onClick={() => setIsAddMode(false)}>
                    Cancelar
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        )}
        
        <Table
          columns={columns}
          dataSource={getTableData()}
          rowKey="key"
          loading={isLoading}
          pagination={false}
        />
      </Card>
      
      <Divider />
      
      <Card title="Regras Comuns" style={{ marginTop: 24 }}>
        <Paragraph>
          Abaixo estão exemplos de regras comuns que você pode querer adicionar:
        </Paragraph>
        
        <Table
          size="small"
          pagination={false}
          columns={[
            { title: 'Tipo de Regra', dataIndex: 'type', key: 'type' },
            { title: 'Descrição', dataIndex: 'description', key: 'description' },
            { title: 'Valor Sugerido', dataIndex: 'suggested', key: 'suggested' },
          ]}
          dataSource={[
            { 
              key: '1', 
              type: 'Ações únicas', 
              description: 'Recompensas concedidas uma única vez (completar perfil, verificação)', 
              suggested: '50-200 coins' 
            },
            { 
              key: '2', 
              type: 'Ações periódicas', 
              description: 'Recompensas que podem ser obtidas repetidamente (login diário)', 
              suggested: '5-20 coins' 
            },
            { 
              key: '3', 
              type: 'Ações sociais', 
              description: 'Vínculos com redes sociais, compartilhamentos', 
              suggested: '10-50 coins' 
            },
            { 
              key: '4', 
              type: 'Pesquisas e feedback', 
              description: 'Participação em pesquisas ou fornecimento de feedback', 
              suggested: '20-100 coins' 
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default CoinRulesPage;