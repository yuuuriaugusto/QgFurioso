import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConfigProvider } from 'antd';
import ptBR from 'antd/lib/locale/pt_BR';
import App from './App';

import './index.css';

// Configuração do tema do Ant Design
const theme = {
  token: {
    colorPrimary: '#EF1313', // Vermelho FURIA
    borderRadius: 4,
    fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
  components: {
    Layout: {
      siderBg: '#18181B', // Fundo escuro para o sidebar
      headerBg: '#FFFFFF',
    },
    Menu: {
      darkItemBg: '#18181B',
      darkItemSelectedBg: '#27272A',
    },
  },
};

// Cliente do React Query para gerenciar estado e chamadas de API
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={theme} locale={ptBR}>
        <App />
      </ConfigProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);