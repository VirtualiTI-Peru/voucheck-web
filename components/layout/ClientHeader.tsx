'use client';

import { Header } from './Header';

interface ClientHeaderProps {
  user: any;
}

export function ClientHeader({ user }: ClientHeaderProps) {
  return <Header user={user} />;
}