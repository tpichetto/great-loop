import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import { MapPage } from './components/MapPage/MapPage';

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container">
        <main className="map-page">
          <MapPage />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
