import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Tabs, 
  DatePicker, 
  Button, 
  Spin, 
  Select, 
  Divider, 
  Typography, 
  message 
} from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  ReadOutlined, 
  FileTextOutlined, 
  ShoppingOutlined, 
  BulbOutlined, 
  GlobalOutlined, 
  VideoCameraOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { 
  analyticsService, 
  DashboardMetrics, 
  DateRange, 
  TimeGranularity 
} from '../../api/analytics';
import moment from 'moment';
import 'moment/locale/pt-br';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Option } = Select;

// Cores para gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const AnalyticsDashboardPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: moment().subtract(30, 'days').toDate(),
    endDate: moment().toDate()
  });
  const [granularity, setGranularity] = useState<TimeGranularity>('day');
  const [loading, setLoading] = useState<boolean>(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Carregar dados do dashboard
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getDashboard(dateRange);
        setMetrics(data);
      } catch (error) {
        console.error('Erro ao carregar métricas:', error);
        message.error('Não foi possível carregar as métricas. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  // Manipular mudança de período
  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setDateRange({
        startDate: dates[0].toDate(),
        endDate: dates[1].toDate()
      });
    }
  };

  // Manipular mudança de granularidade
  const handleGranularityChange = (value: TimeGranularity) => {
    setGranularity(value);
  };

  // Exportar dados
  const handleExportData = async (format: 'json' | 'csv') => {
    try {
      setLoading(true);
      const blob = await analyticsService.exportData(dateRange, format);
      
      // Criar URL para download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qg_furioso_analytics_${moment().format('YYYY-MM-DD')}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      message.success(`Dados exportados com sucesso no formato ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      message.error('Não foi possível exportar os dados. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analytics-dashboard">
      <Title level={2}>Dashboard de Analytics</Title>
      <Text type="secondary">
        Visualize métricas e insights sobre o engajamento e interações dos usuários na plataforma QG FURIOSO.
      </Text>

      <div style={{ marginTop: 24, marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Text strong>Período:</Text>
          </Col>
          <Col>
            <RangePicker
              value={[moment(dateRange.startDate), moment(dateRange.endDate)]}
              onChange={handleDateRangeChange}
              allowClear={false}
              style={{ marginRight: 16 }}
            />
          </Col>
          <Col>
            <Text strong>Granularidade:</Text>
          </Col>
          <Col>
            <Select 
              value={granularity} 
              onChange={handleGranularityChange}
              style={{ width: 120, marginRight: 16 }}
            >
              <Option value="day">Diário</Option>
              <Option value="week">Semanal</Option>
              <Option value="month">Mensal</Option>
            </Select>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />} 
              onClick={() => handleExportData('json')}
              style={{ marginRight: 8 }}
            >
              Exportar JSON
            </Button>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={() => handleExportData('csv')}
            >
              Exportar CSV
            </Button>
          </Col>
        </Row>
      </div>

      <Spin spinning={loading} tip="Carregando métricas...">
        {metrics && (
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab={<span><TeamOutlined /> Visão Geral</span>} key="overview">
              <OverviewTab metrics={metrics} />
            </TabPane>
            <TabPane tab={<span><UserOutlined /> Usuários</span>} key="users">
              <UsersTab 
                userActivity={metrics.userActivity} 
                demographics={metrics.demographics} 
              />
            </TabPane>
            <TabPane tab={<span><ReadOutlined /> Conteúdo</span>} key="content">
              <ContentTab contentMetrics={metrics.content} />
            </TabPane>
            <TabPane tab={<span><FileTextOutlined /> Pesquisas</span>} key="surveys">
              <SurveysTab surveyMetrics={metrics.survey} />
            </TabPane>
            <TabPane tab={<span><ShoppingOutlined /> Loja</span>} key="shop">
              <ShopTab 
                shopMetrics={metrics.shop} 
                economyMetrics={metrics.economy} 
                granularity={granularity}
              />
            </TabPane>
            <TabPane tab={<span><BulbOutlined /> Engajamento</span>} key="engagement">
              <EngagementTab 
                engagementMetrics={metrics.engagement} 
                granularity={granularity}
              />
            </TabPane>
            <TabPane tab={<span><VideoCameraOutlined /> Transmissões</span>} key="streams">
              <StreamsTab streamMetrics={metrics.streams} />
            </TabPane>
          </Tabs>
        )}
      </Spin>
    </div>
  );
};

// Componentes de abas
const OverviewTab: React.FC<{ metrics: DashboardMetrics }> = ({ metrics }) => {
  const { userActivity, content, survey, economy, shop } = metrics;

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Usuários Ativos"
              value={userActivity.activeUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Novos Usuários"
              value={userActivity.newUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Taxa de Retenção"
              value={userActivity.retentionRate}
              suffix="%"
              precision={1}
              valueStyle={{ color: userActivity.retentionRate > 50 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Visualizações de Conteúdo"
              value={content.totalViews}
              prefix={<ReadOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Respostas de Pesquisas"
              value={survey.totalResponses}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Pedidos na Loja"
              value={shop.totalOrders}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Receita (Moedas)"
              value={shop.totalRevenue}
              prefix={<span style={{ marginRight: 8 }}>🪙</span>}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Moedas em Circulação"
              value={economy.activeCoinBalance}
              prefix={<span style={{ marginRight: 8 }}>🪙</span>}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Divider>Principais Métricas</Divider>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Categorias Populares">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={content.popularCategories}
                  dataKey="views"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={(entry) => entry.category}
                >
                  {content.popularCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} views`, 'Views']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Demográficos de Usuários">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={metrics.demographics.ageDistribution}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} usuários`, 'Usuários']} />
                <Legend />
                <Bar dataKey="count" name="Usuários" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Distribuição de Pesquisas">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={survey.surveyDistribution}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="title" type="category" width={150} />
                <Tooltip formatter={(value) => [`${value} respostas`, 'Respostas']} />
                <Legend />
                <Bar dataKey="responses" name="Respostas" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Tendência de Pedidos">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={shop.orderTrend}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="orders"
                  name="Pedidos"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  name="Receita (Moedas)"
                  stroke="#82ca9d"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </>
  );
};

const UsersTab: React.FC<{ 
  userActivity: DashboardMetrics['userActivity'],
  demographics: DashboardMetrics['demographics']
}> = ({ userActivity, demographics }) => {
  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total de Usuários"
              value={userActivity.totalUsers}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Usuários Ativos"
              value={userActivity.activeUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Novos Usuários"
              value={userActivity.newUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Taxa de Retenção"
              value={userActivity.retentionRate}
              suffix="%"
              precision={1}
              valueStyle={{ color: userActivity.retentionRate > 50 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card title="Distribuição por Idade">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={demographics.ageDistribution}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip formatter={(value, name, props) => [`${value} usuários (${props.payload.percentage}%)`, 'Usuários']} />
                <Legend />
                <Bar dataKey="count" name="Usuários" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Distribuição por Gênero">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={demographics.genderDistribution}
                  dataKey="count"
                  nameKey="gender"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={(entry) => `${entry.gender}: ${entry.percentage}%`}
                >
                  {demographics.genderDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value} usuários (${props.payload.percentage}%)`, props.payload.gender]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24}>
          <Card title="Distribuição por Localização">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={demographics.locationDistribution}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="location" type="category" width={150} />
                <Tooltip formatter={(value, name, props) => [`${value} usuários (${props.payload.percentage}%)`, 'Usuários']} />
                <Legend />
                <Bar dataKey="count" name="Usuários" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </>
  );
};

const ContentTab: React.FC<{ contentMetrics: DashboardMetrics['content'] }> = ({ contentMetrics }) => {
  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Total de Visualizações"
              value={contentMetrics.totalViews}
              prefix={<ReadOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Visualizações Únicas"
              value={contentMetrics.uniqueViews}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Taxa de Engajamento"
              value={contentMetrics.avgEngagementRate}
              suffix="%"
              precision={1}
              valueStyle={{ color: contentMetrics.avgEngagementRate > 25 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Categorias Populares" style={{ marginTop: 24 }}>
        <Row>
          <Col xs={24} md={12}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contentMetrics.popularCategories}
                  dataKey="views"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={(entry) => entry.category}
                >
                  {contentMetrics.popularCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} views`, 'Views']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Col>
          <Col xs={24} md={12}>
            <Table
              dataSource={contentMetrics.popularCategories}
              rowKey="category"
              pagination={false}
              columns={[
                { 
                  title: 'Categoria', 
                  dataIndex: 'category',
                  key: 'category',
                  sorter: (a, b) => a.category.localeCompare(b.category)
                },
                { 
                  title: 'Visualizações', 
                  dataIndex: 'views',
                  key: 'views',
                  sorter: (a, b) => a.views - b.views,
                  defaultSortOrder: 'descend'
                },
                {
                  title: 'Percentual',
                  key: 'percentage',
                  render: (_, record) => {
                    const total = contentMetrics.popularCategories.reduce((sum, item) => sum + item.views, 0);
                    const percentage = total > 0 ? (record.views / total * 100).toFixed(1) : '0.0';
                    return `${percentage}%`;
                  }
                }
              ]}
            />
          </Col>
        </Row>
      </Card>
    </>
  );
};

const SurveysTab: React.FC<{ surveyMetrics: DashboardMetrics['survey'] }> = ({ surveyMetrics }) => {
  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total de Pesquisas"
              value={surveyMetrics.totalSurveys}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total de Respostas"
              value={surveyMetrics.totalResponses}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Taxa de Conclusão"
              value={surveyMetrics.avgCompletionRate}
              suffix="%"
              precision={1}
              valueStyle={{ color: surveyMetrics.avgCompletionRate > 50 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tempo Médio Resposta"
              value={surveyMetrics.avgResponseTime}
              suffix="seg"
            />
          </Card>
        </Col>
      </Row>

      <Card title="Distribuição de Pesquisas" style={{ marginTop: 24 }}>
        <Row>
          <Col xs={24} md={12}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={surveyMetrics.surveyDistribution}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="title" type="category" width={150} />
                <Tooltip formatter={(value) => [`${value} respostas`, 'Respostas']} />
                <Legend />
                <Bar dataKey="responses" name="Respostas" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Col>
          <Col xs={24} md={12}>
            <Table
              dataSource={surveyMetrics.surveyDistribution}
              rowKey="surveyId"
              pagination={false}
              columns={[
                { 
                  title: 'ID', 
                  dataIndex: 'surveyId',
                  key: 'surveyId',
                  width: 80
                },
                { 
                  title: 'Título', 
                  dataIndex: 'title',
                  key: 'title'
                },
                { 
                  title: 'Respostas', 
                  dataIndex: 'responses',
                  key: 'responses',
                  sorter: (a, b) => a.responses - b.responses,
                  defaultSortOrder: 'descend'
                }
              ]}
            />
          </Col>
        </Row>
      </Card>
    </>
  );
};

const ShopTab: React.FC<{ 
  shopMetrics: DashboardMetrics['shop'],
  economyMetrics: DashboardMetrics['economy'],
  granularity: TimeGranularity
}> = ({ shopMetrics, economyMetrics, granularity }) => {
  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total de Pedidos"
              value={shopMetrics.totalOrders}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Receita Total (Moedas)"
              value={shopMetrics.totalRevenue}
              prefix={<span style={{ marginRight: 8 }}>🪙</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Moedas em Circulação"
              value={economyMetrics.activeCoinBalance}
              prefix={<span style={{ marginRight: 8 }}>🪙</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Saldo Médio por Usuário"
              value={economyMetrics.avgUserBalance}
              precision={2}
              prefix={<span style={{ marginRight: 8 }}>🪙</span>}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Tendência de Pedidos" style={{ marginTop: 24 }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={shopMetrics.orderTrend}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              label={{ 
                value: `Data (${granularity === 'day' ? 'Diário' : granularity === 'week' ? 'Semanal' : 'Mensal'})`, 
                position: 'insideBottomRight', 
                offset: -10 
              }} 
            />
            <YAxis yAxisId="left" label={{ value: 'Pedidos', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" label={{ value: 'Receita', angle: 90, position: 'insideRight' }} />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="orders"
              name="Pedidos"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              name="Receita (Moedas)"
              stroke="#82ca9d"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card title="Itens Mais Populares">
            <Table
              dataSource={shopMetrics.popularItems}
              rowKey="itemId"
              pagination={false}
              columns={[
                { 
                  title: 'ID', 
                  dataIndex: 'itemId',
                  key: 'itemId',
                  width: 80
                },
                { 
                  title: 'Nome', 
                  dataIndex: 'name',
                  key: 'name'
                },
                { 
                  title: 'Pedidos', 
                  dataIndex: 'orders',
                  key: 'orders',
                  sorter: (a, b) => a.orders - b.orders,
                  defaultSortOrder: 'descend'
                }
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Economia de Moedas">
            <Tabs defaultActiveKey="topEarners">
              <TabPane tab="Top Ganhadores" key="topEarners">
                <Table
                  dataSource={economyMetrics.topEarners}
                  rowKey="userId"
                  pagination={false}
                  columns={[
                    { 
                      title: 'Usuário', 
                      dataIndex: 'username',
                      key: 'username'
                    },
                    { 
                      title: 'Moedas Ganhas', 
                      dataIndex: 'earned',
                      key: 'earned',
                      sorter: (a, b) => a.earned - b.earned,
                      defaultSortOrder: 'descend'
                    }
                  ]}
                />
              </TabPane>
              <TabPane tab="Top Gastadores" key="topSpenders">
                <Table
                  dataSource={economyMetrics.topSpenders}
                  rowKey="userId"
                  pagination={false}
                  columns={[
                    { 
                      title: 'Usuário', 
                      dataIndex: 'username',
                      key: 'username'
                    },
                    { 
                      title: 'Moedas Gastas', 
                      dataIndex: 'spent',
                      key: 'spent',
                      sorter: (a, b) => a.spent - b.spent,
                      defaultSortOrder: 'descend'
                    }
                  ]}
                />
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </>
  );
};

const EngagementTab: React.FC<{ 
  engagementMetrics: DashboardMetrics['engagement'],
  granularity: TimeGranularity
}> = ({ engagementMetrics, granularity }) => {
  // Converter o objeto de interações por tipo em um array para o gráfico
  const interactionsByTypeArray = Object.entries(engagementMetrics.interactionsByType).map(
    ([type, count]) => ({ type, count })
  );

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total de Interações"
              value={engagementMetrics.totalInteractions}
              prefix={<BulbOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={18}>
          <Card title="Interações por Tipo">
            <ResponsiveContainer width="100%" height={100}>
              <BarChart
                data={interactionsByTypeArray}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="type" type="category" />
                <Tooltip formatter={(value) => [`${value} interações`, 'Interações']} />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="Tendência de Engajamento">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={engagementMetrics.engagementTrend}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  label={{ 
                    value: `Data (${granularity === 'day' ? 'Diário' : granularity === 'week' ? 'Semanal' : 'Mensal'})`, 
                    position: 'insideBottomRight', 
                    offset: -10 
                  }} 
                />
                <YAxis label={{ value: 'Interações', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="interactions"
                  name="Interações"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Usuários Mais Engajados">
            <Table
              dataSource={engagementMetrics.topEngagers}
              rowKey="userId"
              pagination={false}
              columns={[
                { 
                  title: 'Usuário', 
                  dataIndex: 'username',
                  key: 'username'
                },
                { 
                  title: 'Interações', 
                  dataIndex: 'interactions',
                  key: 'interactions',
                  sorter: (a, b) => a.interactions - b.interactions,
                  defaultSortOrder: 'descend'
                }
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Distribuição de Interações">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={interactionsByTypeArray}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={(entry) => entry.type}
                >
                  {interactionsByTypeArray.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value} interações`, props.payload.type]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </>
  );
};

const StreamsTab: React.FC<{ streamMetrics: DashboardMetrics['streams'] }> = ({ streamMetrics }) => {
  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total de Transmissões"
              value={streamMetrics.totalStreams}
              prefix={<VideoCameraOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total de Espectadores"
              value={streamMetrics.totalViewers}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Média de Espectadores"
              value={streamMetrics.avgViewerCount}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pico de Espectadores"
              value={streamMetrics.peakViewers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Duração Média (minutos)"
              value={streamMetrics.streamDuration}
              prefix={<span style={{ marginRight: 8 }}>⏱️</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Taxa de Retenção"
              value={streamMetrics.viewerRetention}
              suffix="%"
              precision={1}
              valueStyle={{ color: streamMetrics.viewerRetention > 50 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Métricas de Transmissão" style={{ marginTop: 24 }}>
        <p>
          <strong>Análise de Desempenho:</strong> As transmissões ao vivo têm atraído em média 
          {' '}{streamMetrics.avgViewerCount} espectadores, com picos de até {streamMetrics.peakViewers} visualizações
          simultâneas. A duração média das transmissões é de {streamMetrics.streamDuration} minutos, com uma
          taxa de retenção de {streamMetrics.viewerRetention}% dos espectadores assistindo até o final.
        </p>
        <p>
          <strong>Sugestões de Melhoria:</strong>
        </p>
        <ul>
          <li>Programar transmissões em horários de maior engajamento</li>
          <li>Criar alertas e notificações prévias para aumentar a audiência inicial</li>
          <li>Implementar interações exclusivas durante as transmissões para aumentar a retenção</li>
          <li>Oferecer recompensas em moedas para espectadores que assistirem por mais tempo</li>
        </ul>
      </Card>
    </>
  );
};

export default AnalyticsDashboardPage;