import { Card, Group, Title, Text, SimpleGrid, Skeleton } from '@mantine/core';

export default function DashboardPage() {
  return (
    <>
      <Title order={2} mb="md">Dashboard</Title>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="lg" fw={500}>Total Vouchers</Text>
            <Skeleton height={24} width={60} radius="sm" />
          </Group>
          <Text c="dimmed" size="sm">Cantidad total de vouchers registrados</Text>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="lg" fw={500}>Vouchers Hoy</Text>
            <Skeleton height={24} width={60} radius="sm" />
          </Group>
          <Text c="dimmed" size="sm">Vouchers capturados en las últimas 24h</Text>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="lg" fw={500}>Monto Total</Text>
            <Skeleton height={24} width={80} radius="sm" />
          </Group>
          <Text c="dimmed" size="sm">Suma de importes de todos los vouchers</Text>
        </Card>
      </SimpleGrid>
      <Card mt="xl" padding="xl" radius="md" withBorder>
        <Title order={4} mb="sm">Resumen de actividad</Title>
        <Skeleton height={120} radius="md" />
      </Card>
    </>
  );
}
