import { MantineProvider, AppShell, Box, Title } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <Router>
          <AppShell
            header={{ height: 60 }}
          >
            <AppShell.Header p="md">
              <Title order={1}>Clothes Shop</Title>
            </AppShell.Header>

            <AppShell.Main p="md">
              <Routes>
                <Route path="/" element={<div>Welcome to Clothes Shop</div>} />
              </Routes>
            </AppShell.Main>
          </AppShell>
        </Router>
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;
