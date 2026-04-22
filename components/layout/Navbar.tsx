'use client';

import { NavLink, Stack } from '@mantine/core';
import { usePathname, useRouter } from 'next/navigation';
import { navigationItems } from '../../config/navigation';

export function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div style={{ width: 300, padding: 16 }}>
      <Stack gap="xs">
        {navigationItems.map((item) => {
          let isActive = false;
          if (item.href === '/dashboard') {
            isActive = pathname === '/dashboard';
          } else {
            isActive = pathname === item.href;
          }
          return (
            <NavLink
              key={item.href}
              label={item.label}
              description={item.description}
              leftSection={<item.icon size={16} />}
              active={isActive}
              onClick={() => router.push(item.href)}
              variant={isActive ? 'filled' : 'light'}
            />
          );
        })}
      </Stack>
    </div>
  );
}