
"use client";
import React, { useState, useEffect } from "react";
import CustomersTable from "@/app/components/CustomersTable";
import { fetchCustomersServerAction } from "./fetch-action";
import { createBrowserClient } from "@supabase/ssr";

export default function SuperAdminPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');

  const superAdmins = (process.env.NEXT_PUBLIC_SUPERADMIN_EMAILS ?? '')
    .split(';')
    .map(s => s.trim())
    .filter(Boolean);

  const isSuperAdmin = !!userEmail && superAdmins.some(e => e.toLowerCase() === userEmail.toLowerCase());
  const isOrgAdmin = userRole === 'org:admin';
  
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email ?? '');
      setUserRole(session?.user?.app_metadata?.role ?? '');
    });
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    setLoading(true);
    fetchCustomersServerAction().then((res) => {
      if (res.success) setCustomers(res.customers);
      else alert(res.message);
    }).finally(() => setLoading(false));
  }, []);

  if (!isSuperAdmin && !isOrgAdmin) {
    return <div>Acceso denegado.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded border bg-white p-4">
        <div className="flex items-center mb-2">
          <div className="font-medium mr-4">Lista de Clientes</div>
        </div>
        {loading ? (
          <div>Estamos preparando los datos...</div>
        ) : (
          <CustomersTable customers={customers}></CustomersTable>
        )}
      </div>
    </div>
  );
}
