import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="404"
      subTitle="Desculpe, a página que você visitou não existe."
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          Voltar para o Dashboard
        </Button>
      }
    />
  );
};

export default NotFoundPage;