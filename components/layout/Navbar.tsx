'use client';

import { NavLink, Stack } from '@mantine/core';
import { usePathname, useRouter } from 'next/navigation';
import { navigationItems } from '../../config/navigation';

interface AppNavbarProps {
  canSeeAdmin?: boolean;
  canSeeSuper?: boolean;
}

export function AppNavbar({ canSeeAdmin = false, canSeeSuper = false }: AppNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const visibleItems = navigationItems.filter((item) => {
    if (item.permission === 'superadmin') return canSeeSuper;
    if (item.permission === 'admin') return canSeeAdmin;
    return true;
  });

  return (
    <div style={{ width: 300, padding: 16 }}>
      <Stack gap="xs">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href === '/' && pathname === '/') ||
            (item.href !== '/' && pathname.startsWith(item.href));

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