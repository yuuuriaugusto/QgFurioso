import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: 'calc(100vh - 100px)'
    }}>
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
    </div>
  );
};

export default NotFoundPage;