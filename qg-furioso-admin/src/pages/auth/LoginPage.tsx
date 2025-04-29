import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Card, Typography, message, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { AdminLoginCredentials } from '@types';
import { loginAdmin } from '@api/auth';
import { useAuthStore } from '@store/authStore';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { setAdmin } = useAuthStore();

  // Mutation para fazer login
  const loginMutation = useMutation({
    mutationFn: (credentials: AdminLoginCredentials) => loginAdmin(credentials),
    onSuccess: (data) => {
      setAdmin(data);
      message.success('Login realizado com sucesso!');
      navigate('/');
    },
    onError: (error: Error) => {
      setError(error.message || 'Credenciais inválidas. Por favor, tente novamente.');
    },
  });

  const onFinish = (values: AdminLoginCredentials) => {
    setError(null);
    loginMutation.mutate(values);
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-logo">
          <img src="/furia-logo.svg" alt="FURIA QG Furioso" height={60} />
        </div>
        
        <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>
          Painel Administrativo
        </Title>
        
        {error && (
          <Alert
            message="Erro de autenticação"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}
        
        <Form
          form={form}
          name="admin_login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Por favor, insira seu email' },
              { type: 'email', message: 'Email inválido' },
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Email" 
              size="large" 
              disabled={loginMutation.isPending}
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="Senha"
            rules={[{ required: true, message: 'Por favor, insira sua senha' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Senha" 
              size="large" 
              disabled={loginMutation.isPending}
            />
          </Form.Item>
          
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox disabled={loginMutation.isPending}>Lembrar-me</Checkbox>
              </Form.Item>
              
              <Button type="link" style={{ padding: 0 }} disabled={loginMutation.isPending}>
                Esqueci minha senha
              </Button>
            </div>
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block 
              loading={loginMutation.isPending}
            >
              Entrar
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Text type="secondary">
            Acesso restrito à equipe da FURIA
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;