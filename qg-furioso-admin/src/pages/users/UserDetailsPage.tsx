import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, Tabs, Descriptions, Button, Tag, Avatar, Typography, Spin, 
  Table, Modal, Form, InputNumber, Input, Space, message, Divider,
  Row, Col, Statistic, Timeline, List, Badge, Alert
} from 'antd';
import {
  UserOutlined, ArrowLeftOutlined, StopOutlined, CheckCircleOutlined,
  LockOutlined, CrownOutlined, InfoCircleOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserDetails, fetchUserKycInfo, fetchUserSocialLinks, fetchUserEsportsProfiles, fetchUserCoinTransactions, adjustUserCoins, updateUserStatus, sendPasswordReset } from '@api/users';
import type { User, KycVerification, SocialLink, EsportsProfile, CoinTransaction } from '@types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { confirm } = Modal;

const UserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const userId = parseInt(id as string);
  
  const [isAdjustCoinsModalVisible, setIsAdjustCoinsModalVisible] = useState(false);
  const [adjustCoinsForm] = Form.useForm();
  
  // Consultas para buscar dados do usuário
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUserDetails(userId),
    enabled: !!userId && !isNaN(userId),
  });
  
  const { data: kycInfo, isLoading: isLoadingKyc } = useQuery({
    queryKey: ['user-kyc', userId],
    queryFn: () => fetchUserKycInfo(userId),
    enabled: !!userId && !isNaN(userId),
  });
  
  const { data: socialLinks, isLoading: isLoadingSocial } = useQuery({
    queryKey: ['user-social-links', userId],
    queryFn: () => fetchUserSocialLinks(userId),
    enabled: !!userId && !isNaN(userId),
  });
  
  const { data: esportsProfiles, isLoading: isLoadingEsports } = useQuery({
    queryKey: ['user-esports-profiles', userId],
    queryFn: () => fetchUserEsportsProfiles(userId),
    enabled: !!userId && !isNaN(userId),
  });
  
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['user-coin-transactions', userId],
    queryFn: () => fetchUserCoinTransactions(userId),
    enabled: !!userId && !isNaN(userId),
  });
  
  // Mutações para ações administrativas
  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: number; status: string }) => updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      message.success('Status do usuário atualizado com sucesso');
    },
    onError: () => {
      message.error('Erro ao atualizar status do usuário');
    },
  });
  
  const adjustCoinsMutation = useMutation({
    mutationFn: ({ userId, amount, reason }: { userId: number; amount: number; reason: string }) => adjustUserCoins(userId, amount, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-coin-transactions', userId] });
      message.success('Saldo de coins ajustado com sucesso');
      setIsAdjustCoinsModalVisible(false);
      adjustCoinsForm.resetFields();
    },
    onError: () => {
      message.error('Erro ao ajustar saldo de coins');
    },
  });
  
  const resetPasswordMutation = useMutation({
    mutationFn: (userId: number) => sendPasswordReset(userId),
    onSuccess: () => {
      message.success('Link de redefinição de senha enviado com sucesso');
    },
    onError: () => {
      message.error('Erro ao enviar link de redefinição de senha');
    },
  });
  
  // Função para confirmar alteração de status
  const confirmStatusChange = (newStatus: string) => {
    const action = newStatus === 'active' ? 'ativar' : 'suspender';
    
    confirm({
      title: `Tem certeza que deseja ${action} este usuário?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Esta ação afetará o acesso do usuário à plataforma.',
      onOk() {
        updateStatusMutation.mutate({ userId, status: newStatus });
      },
    });
  };
  
  // Função para confirmar redefinição de senha
  const confirmPasswordReset = () => {
    confirm({
      title: 'Enviar link de redefinição de senha?',
      icon: <ExclamationCircleOutlined />,
      content: `Um email será enviado para ${user?.primaryIdentity} com instruções para redefinir a senha.`,
      onOk() {
        resetPasswordMutation.mutate(userId);
      },
    });
  };
  
  // Função para ajustar coins
  const handleAdjustCoins = (values: { amount: number; reason: string }) => {
    adjustCoinsMutation.mutate({
      userId,
      amount: values.amount,
      reason: values.reason,
    });
  };
  
  // Status de carregamento geral
  const isLoading = isLoadingUser || isLoadingKyc || isLoadingSocial || isLoadingEsports || isLoadingTransactions;
  
  // Renderizar estado de carregamento
  if (isLoading && !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}>
        <Spin size="large" tip="Carregando detalhes do usuário..." />
      </div>
    );
  }
  
  // Renderizar erro se não encontrar usuário
  if (!isLoading && !user) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="Usuário não encontrado"
          description="O usuário solicitado não existe ou você não tem permissão para visualizar."
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => navigate('/users')}>
              Voltar para a lista
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/users')}
        >
          Voltar para a lista
        </Button>
      </div>
      
      <Card>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar size={64} icon={<UserOutlined />} src={user?.profile?.avatarUrl} />
            <div>
              <Title level={3} style={{ margin: 0 }}>
                {user?.profile?.displayName || user?.primaryIdentity}
              </Title>
              <Text type="secondary">ID: {user?.id} | {user?.publicId}</Text>
              <div style={{ marginTop: 8 }}>
                <Tag color={user?.status === 'active' ? 'green' : user?.status === 'suspended' ? 'red' : 'default'}>
                  {user?.status?.toUpperCase()}
                </Tag>
                
                {kycInfo && (
                  <Tag color={
                    kycInfo.status === 'verified' ? 'blue' : 
                    kycInfo.status === 'pending' ? 'orange' : 
                    kycInfo.status === 'rejected' ? 'red' : 'default'
                  }>
                    KYC: {kycInfo.status.toUpperCase()}
                  </Tag>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <Space>
              {user?.status === 'active' ? (
                <Button 
                  danger 
                  icon={<StopOutlined />}
                  onClick={() => confirmStatusChange('suspended')}
                >
                  Suspender
                </Button>
              ) : (
                <Button 
                  type="primary" 
                  icon={<CheckCircleOutlined />}
                  onClick={() => confirmStatusChange('active')}
                >
                  Ativar
                </Button>
              )}
              
              <Button 
                icon={<LockOutlined />}
                onClick={confirmPasswordReset}
              >
                Redefinir Senha
              </Button>
              
              <Button 
                icon={<CrownOutlined />}
                onClick={() => setIsAdjustCoinsModalVisible(true)}
              >
                Ajustar Coins
              </Button>
            </Space>
          </div>
        </div>
        
        <Tabs defaultActiveKey="profile">
          <TabPane tab="Perfil" key="profile">
            <Row gutter={[24, 24]}>
              <Col xs={24} md={16}>
                <Card title="Informações Pessoais" bordered={false}>
                  <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                    <Descriptions.Item label="Nome Completo">
                      {user?.profile?.fullName || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Nome de Exibição">
                      {user?.profile?.displayName || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      {user?.primaryIdentity}
                    </Descriptions.Item>
                    <Descriptions.Item label="Data de Nascimento">
                      {user?.profile?.birthDate ? dayjs(user.profile.birthDate).format('DD/MM/YYYY') : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Idioma Preferido">
                      {user?.profile?.preferredLanguage || '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Data de Cadastro">
                      {dayjs(user?.createdAt).format('DD/MM/YYYY HH:mm')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Último Login">
                      {user?.lastLoginAt ? dayjs(user.lastLoginAt).format('DD/MM/YYYY HH:mm') : 'Nunca'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Bio" span={2}>
                      {user?.profile?.bio || '-'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              
              <Col xs={24} md={8}>
                <Card title="Saldo de Coins" bordered={false}>
                  <Statistic
                    value={user?.coinBalance?.amount || 0}
                    prefix={<CrownOutlined />}
                    valueStyle={{ color: '#EF1313' }}
                  />
                  <Divider />
                  <Title level={5}>Detalhes KYC</Title>
                  <div>
                    <p>
                      <Badge 
                        status={
                          kycInfo?.status === 'verified' ? 'success' : 
                          kycInfo?.status === 'pending' ? 'processing' : 
                          kycInfo?.status === 'rejected' ? 'error' : 'default'
                        } 
                        text={
                          kycInfo?.status === 'verified' ? 'Verificado' : 
                          kycInfo?.status === 'pending' ? 'Pendente' : 
                          kycInfo?.status === 'rejected' ? 'Rejeitado' : 'Não iniciado'
                        } 
                      />
                    </p>
                    {kycInfo?.submittedAt && (
                      <p>
                        <Text type="secondary">Enviado em: {dayjs(kycInfo.submittedAt).format('DD/MM/YYYY')}</Text>
                      </p>
                    )}
                    {kycInfo?.verifiedAt && (
                      <p>
                        <Text type="secondary">Verificado em: {dayjs(kycInfo.verifiedAt).format('DD/MM/YYYY')}</Text>
                      </p>
                    )}
                    {kycInfo?.rejectionReason && (
                      <p>
                        <Text type="danger">Motivo da rejeição: {kycInfo.rejectionReason}</Text>
                      </p>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
            
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
              <Col xs={24} md={12}>
                <Card title="Contas Sociais Vinculadas" bordered={false}>
                  {isLoadingSocial ? (
                    <Spin />
                  ) : socialLinks && socialLinks.length > 0 ? (
                    <List
                      itemLayout="horizontal"
                      dataSource={socialLinks}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar icon={<UserOutlined />} />}
                            title={<>
                              {item.platform}
                              {item.isVerified && <Tag color="green" style={{ marginLeft: 8 }}>Verificado</Tag>}
                            </>}
                            description={<a href={item.profileUrl} target="_blank" rel="noopener noreferrer">@{item.username}</a>}
                          />
                          <div>{dayjs(item.addedAt).format('DD/MM/YYYY')}</div>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhuma conta social vinculada" />
                  )}
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card title="Perfis de E-sports" bordered={false}>
                  {isLoadingEsports ? (
                    <Spin />
                  ) : esportsProfiles && esportsProfiles.length > 0 ? (
                    <List
                      itemLayout="horizontal"
                      dataSource={esportsProfiles}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar icon={<UserOutlined />} />}
                            title={<>
                              {item.platform} - {item.primaryGame}
                              {item.isVerified && <Tag color="green" style={{ marginLeft: 8 }}>Verificado</Tag>}
                            </>}
                            description={<a href={item.profileUrl} target="_blank" rel="noopener noreferrer">@{item.username}</a>}
                          />
                          <div>{dayjs(item.addedAt).format('DD/MM/YYYY')}</div>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum perfil de e-sports vinculado" />
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane tab="Transações de Coins" key="transactions">
            <Card bordered={false}>
              <Table
                dataSource={transactions?.data || []}
                loading={isLoadingTransactions}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  total: transactions?.total || 0,
                  showTotal: (total) => `Total: ${total} transações`,
                }}
                columns={[
                  {
                    title: 'ID',
                    dataIndex: 'id',
                    key: 'id',
                    width: 80,
                  },
                  {
                    title: 'Data',
                    dataIndex: 'createdAt',
                    key: 'createdAt',
                    render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
                  },
                  {
                    title: 'Tipo',
                    dataIndex: 'transactionType',
                    key: 'transactionType',
                    render: (type) => {
                      const typeMap: Record<string, { color: string; label: string }> = {
                        earned: { color: 'green', label: 'Ganho' },
                        spent: { color: 'red', label: 'Gasto' },
                        adjusted: { color: 'blue', label: 'Ajuste' },
                        refunded: { color: 'orange', label: 'Reembolso' },
                      };
                      
                      const typeInfo = typeMap[type] || { color: 'default', label: type };
                      return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
                    },
                  },
                  {
                    title: 'Quantidade',
                    dataIndex: 'amount',
                    key: 'amount',
                    render: (amount) => {
                      const isPositive = amount > 0;
                      return (
                        <Text style={{ color: isPositive ? '#52c41a' : '#f5222d' }}>
                          {isPositive ? '+' : ''}{amount}
                        </Text>
                      );
                    },
                  },
                  {
                    title: 'Descrição',
                    dataIndex: 'description',
                    key: 'description',
                    ellipsis: true,
                  },
                  {
                    title: 'Entidade Relacionada',
                    key: 'relatedEntity',
                    render: (_, record) => {
                      if (!record.relatedEntityType) return '-';
                      return `${record.relatedEntityType} #${record.relatedEntityId}`;
                    },
                  },
                ]}
              />
            </Card>
          </TabPane>
          
          <TabPane tab="Resgates" key="redemptions">
            <Card bordered={false}>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum resgate encontrado" />
            </Card>
          </TabPane>
          
          <TabPane tab="Pesquisas" key="surveys">
            <Card bordered={false}>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhuma resposta de pesquisa encontrada" />
            </Card>
          </TabPane>
        </Tabs>
      </Card>
      
      {/* Modal para ajustar coins */}
      <Modal
        title="Ajustar Saldo de Coins"
        open={isAdjustCoinsModalVisible}
        onCancel={() => setIsAdjustCoinsModalVisible(false)}
        footer={null}
      >
        <Form
          form={adjustCoinsForm}
          onFinish={handleAdjustCoins}
          layout="vertical"
        >
          <Form.Item
            name="amount"
            label="Quantidade"
            rules={[
              { required: true, message: 'Por favor, insira a quantidade' },
              { type: 'number', message: 'Por favor, insira um número válido' },
            ]}
            extra="Use valores positivos para adicionar e negativos para remover"
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="reason"
            label="Motivo"
            rules={[{ required: true, message: 'Por favor, insira o motivo do ajuste' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                style={{ marginRight: 8 }}
                onClick={() => setIsAdjustCoinsModalVisible(false)}
                disabled={adjustCoinsMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={adjustCoinsMutation.isPending}
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

export default UserDetailsPage;