import { Container, Title, Text } from '@mantine/core';

export function Home() {
  return (
    <Container size="lg">
      <Title order={2} mb="md">Welcome to Clothes Shop</Title>
      <Text>Discover our latest collection of trendy clothes.</Text>
    </Container>
  );
}
