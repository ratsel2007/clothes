import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Inter, sans-serif',
  defaultRadius: 'sm',
  components: {
    AppShell: {
      styles: {
        main: {
          background: '#f8f9fa',
        },
      },
    },
  },
});
