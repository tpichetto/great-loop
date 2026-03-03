import { ReactElement, ReactNode } from 'react';
import { render, RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../src/contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      enabled: false, // Disable automatic queries for tests
    },
  },
});

interface WrapperProps {
  children: ReactNode;
  // Router is not included by default - tests should wrap with appropriate router
  useRouter?: boolean;
}

function AllTheProviders({ children, useRouter = true }: WrapperProps): ReactElement {
  const content = (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );

  if (useRouter) {
    return <BrowserRouter>{content}</BrowserRouter>;
  }

  return content;
}

function customRender(ui: ReactElement, options?: Omit<RenderResult, 'container'>): RenderResult {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

export * from '@testing-library/react';
export { customRender as render };
