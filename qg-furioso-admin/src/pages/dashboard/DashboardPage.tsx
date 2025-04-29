import { useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Select, Spin, DatePicker, Empty } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, UserOutlined, ShopOutlined, FormOutlined, CrownOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardMetrics, fetchDashboardChart } from '@api/dashboard';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Cores para gráficos
const CHART_COLORS = ['#EF1313', '#1890ff', '#52c41a', '#faad14', '#722ed1'];

// Tipos de períodos para seleção
type PeriodType = '24h' | '7d' | '30d' | 'all';

const DashboardPage: React.FC = () => {
  const [period, setPeriod] = useState<PeriodType>('30d');

  // Buscar métricas do dashboard
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['dashboard-metrics', period],
    queryFn: () => fetchDashboardMetrics(period),
  });

  // Buscar dados para o gráfico de registros
  const { data: registrationsChart, isLoading: isLoadingRegistrationsChart } = useQuery({
    queryKey: ['dashboard-chart', 'registrations', period],
    queryFn: () => fetchDashboardChart('registrations', period === '24h' ? '7d' : period),
  });

  // Buscar dados para o gráfico de moedas
  const { data: coinsChart, isLoading: isLoadingCoinsChart } = useQuery({
    queryKey: ['dashboard-chart', 'coins', period],
    queryFn: () => fetchDashboardChart('coins', period === '24h' ? '7d' : period),
  });

  // Mock para o gráfico de distribuição KYC
  const kycDistribution = metrics ? [
    { name: 'Verificados', value: metrics.kycStats.verified },
    { name: 'Pendentes', value: metrics.kycStats.pending },
    { name: 'Não iniciados', value: metrics.kycStats.notStarted },
    { name: 'Rejeitados', value: metrics.kycStats.rejected },
  ] : [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Dashboard</Title>
        
        <div>
          <Select
            defaultValue="30d"
            style={{ width: 120, marginRight: 16 }}
            onChange={(value) => setPeriod(value as PeriodType)}
            options={[
              { value: '24h', label: 'Últimas 24h' },
              { value: '7d', label: 'Últimos 7 dias' },
              { value: '30d', label: 'Últimos 30 dias' },
              { value: 'all', label: 'Todo período' },
            ]}
          />
          
          <RangePicker
            placeholder={['Data inicial', 'Data final']}
            disabled // Temporariamente desativado
          />
        </div>
      </div>
      
      {/* Cards de métricas principais */}
      <Spin spinning={isLoadingMetrics}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card className="card-metric">
              <Statistic
                title="Total de Usuários"
                value={metrics?.totalUsers || 0}
                prefix={<UserOutlined />}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  <ArrowUpOutlined style={{ color: '#52c41a' }} />
                  {metrics?.newRegistrations.last24h || 0} novos hoje
                </Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card className="card-metric">
              <Statistic
                title="Usuários Ativos (30d)"
                value={metrics?.activeUsers.last30d || 0}
                prefix={<UserOutlined />}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  {metrics?.activeUsers.last24h || 0} ativos hoje
                </Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card className="card-metric">
              <Statistic
                title="Coins em Circulação"
                value={metrics?.totalCoins.inCirculation || 0}
                prefix={<CrownOutlined />}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  {metrics?.totalCoins.earned || 0} ganhos / {metrics?.totalCoins.spent || 0} gastos
                </Text>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <Card className="card-metric">
              <Statistic
                title="Resgates Pendentes"
                value={metrics?.pendingRedemptions || 0}
                prefix={<ShopOutlined />}
              />
              <div style={{ marginTop: 8 }}>
                <Text type={metrics?.pendingRedemptions ? 'warning' : 'secondary'}>
                  {metrics?.pendingRedemptions ? 'Requer atenção' : 'Nenhum pendente'}
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
      
      {/* Gráficos */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Novos Registros" className="card-metric">
            <Spin spinning={isLoadingRegistrationsChart}>
              {registrationsChart && registrationsChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={registrationsChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="registrations" stroke="#EF1313" name="Registros" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="Sem dados disponíveis" style={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} />
              )}
            </Spin>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Movimentação de Coins" className="card-metric">
            <Spin spinning={isLoadingCoinsChart}>
              {coinsChart && coinsChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={coinsChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="earned" name="Ganhos" fill="#52c41a" />
                    <Bar dataKey="spent" name="Gastos" fill="#EF1313" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="Sem dados disponíveis" style={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} />
              )}
            </Spin>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Distribuição KYC" className="card-metric">
            <Spin spinning={isLoadingMetrics}>
              {kycDistribution && kycDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={kycDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {kycDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Usuários']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Empty description="Sem dados disponíveis" style={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} />
              )}
            </Spin>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Pesquisas Ativas" className="card-metric">
            <Spin spinning={isLoadingMetrics}>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Statistic
                  title="Total de Pesquisas Ativas"
                  value={metrics?.activeSurveys || 0}
                  prefix={<FormOutlined />}
                  style={{ margin: '0 auto', maxWidth: 200 }}
                />
                
                <div style={{ marginTop: 24 }}>
                  <Statistic
                    title="Taxa de Resposta"
                    value={metrics?.surveyResponseRate || 0}
                    suffix="%"
                    precision={1}
                    valueStyle={{ color: metrics?.surveyResponseRate && metrics.surveyResponseRate > 50 ? '#3f8600' : '#cf1322' }}
                    style={{ margin: '0 auto', maxWidth: 200 }}
                  />
                </div>
              </div>
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;