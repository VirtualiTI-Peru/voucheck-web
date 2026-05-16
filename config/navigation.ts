import {
  IconReceipt,
} from '@tabler/icons-react';

export interface NavItem {
  label: string;
  href: string;
  icon: any;
  description?: string;
  /** 'superadmin' = superadmin only; 'admin' = superadmin or org:admin; undefined = everyone */
  permission?: 'superadmin' | 'admin';
}

export const navigationItems: NavItem[] = [
  {
    label: 'Vouchers',
    href: '/receipts',
    icon: IconReceipt,
    description: 'Registro de Vouchers.',
  },
];