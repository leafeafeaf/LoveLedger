import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      // ... 기존 앱 컴포넌트 내용 ...
    </QueryClientProvider>
  );
} 