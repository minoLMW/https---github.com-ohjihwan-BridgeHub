import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminApp from './AdminApp';
import './assets/scss/layout.scss';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('admin-root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AdminApp />
    </QueryClientProvider>
  </React.StrictMode>
);
