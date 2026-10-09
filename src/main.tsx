import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { queryClient } from './api/queryClient';
import { worker } from './mocks/browser';

async function startApplication(): Promise<void> {
  try {
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
  } catch {
    // A falha da API simulada não deve impedir jogar.
    console.warn('Mock API unavailable. Ranking and history may fail.');
  }

  const rootElement = document.getElementById('root');

  if (!rootElement) {
    return;
  }

  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  );
}

void startApplication();