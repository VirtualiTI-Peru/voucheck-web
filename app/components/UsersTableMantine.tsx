'use client';
import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Select,
  Tabs,
  Alert,
  Loader,
  Group,
  Text,
  Modal,
  Checkbox,
} from '@mantine/core';
import { IconTrash, IconMail } from '@tabler/icons-react';
import * as XLSX from 'xlsx';

type Member = {
  id: string;
  username?: string;
  email?: string;
  role?: string;
  status?: string;
  lastSignInAt?: string;
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
};

type Org = { id: string; name: string };

type BulkUserRow = {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  role?: string;
};

type BulkCreateSummary = {
  total: number;
  created: number;
  failed: number;
  emailSent: number;
  emailFailed: number;
};

type BulkCreateResultRow = {
  row: number;
  email: string;
  role?: string;
  success: boolean;
  emailSent: boolean;
  generatedPassword?: string;
  error?: string;
};

const AVAILABLE_ROLES = [
  { value: 'org:transportista', label: 'Transportista' },
  { value: 'org:sistema', label: 'Administrador del Sistema' },
  { value: 'org:verificador', label: 'Verificador' },
];

type InviteFormProps = {
  orgId: string;
  members: Member[];
  onInvited: () => void;
};

function InviteForm({ orgId, members, onInvited }: InviteFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('org:transportista');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInvite = async () => {
    setMessage('');
    if (!email || !orgId) return;

    const normalizedEmail = email.trim().toLowerCase();
    const exists = members.some((member) => (member.email ?? '').toLowerCase() === normalizedEmail);
    if (exists) {
      setMessage('El usuario ya existe en la organización.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, orgId, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage('Invitación enviada.');
        setEmail('');
        onInvited();
      } else {
        setMessage(data?.error || 'Error al enviar la invitación');
      }
    } catch {
      setMessage('Error al enviar la invitación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Group align="end" wrap="wrap" gap="sm">
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={loading}
        placeholder="Correo electrónico"
        className="border rounded px-3 py-2 min-w-[240px]"
      />
      <select
        value={role}
        onChange={(event) => setRole(event.target.value)}
        disabled={loading}
        className="border rounded px-3 py-2"
      >
        {AVAILABLE_ROLES.map((availableRole) => (
          <option key={availableRole.value} value={availableRole.value}>
            {availableRole.label}
          </option>
        ))}
      </select>
      <Button onClick={() => void handleInvite()} disabled={loading || !email || !orgId}>
        {loading ? 'Enviando...' : 'Enviar invitación'}
      </Button>
      {message && <Text size="sm" c="dimmed">{message}</Text>}
    </Group>
  );
}

type CreateUserModalProps = {
  open: boolean;
  orgId: string;
  onClose: () => void;
  onCompleted: () => void;
  onMessage: (message: string) => void;
};

function CreateUserModal({ open, orgId, onClose, onCompleted, onMessage }: CreateUserModalProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('org:transportista');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setEmail('');
    setFirstName('');
    setLastName('');
    setPassword('');
    setConfirmPassword('');
    setRole('org:transportista');
    setError('');
  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !firstName.trim() || !lastName.trim()) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (!password || password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          password,
          orgId,
          role,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? 'No se pudo crear el usuario.');
        return;
      }

      if (data?.emailSent === false) {
        onMessage(data?.emailError ?? 'Usuario creado, pero fallo el correo de bienvenida.');
      } else {
        onMessage('Usuario creado y correo de bienvenida enviado.');
      }
      onCompleted();
      resetForm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={open} onClose={handleClose} title="Crear Usuario" centered>
      <form onSubmit={handleCreate} className="flex flex-col gap-3">
        <input
          type="text"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          placeholder="Nombre"
          disabled={loading}
          className="border rounded px-3 py-2"
        />
        <input
          type="text"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          placeholder="Apellido"
          disabled={loading}
          className="border rounded px-3 py-2"
        />
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Correo electronico"
          disabled={loading}
          className="border rounded px-3 py-2"
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Contraseña"
          disabled={loading}
          className="border rounded px-3 py-2"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Confirmar contraseña"
          disabled={loading}
          className="border rounded px-3 py-2"
        />

        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          disabled={loading}
          className="border rounded px-3 py-2"
        >
          {AVAILABLE_ROLES.map((availableRole) => (
            <option key={availableRole.value} value={availableRole.value}>
              {availableRole.label}
            </option>
          ))}
        </select>

        {error && <Text c="red">{error}</Text>}

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Crear Usuario
          </Button>
        </Group>
      </form>
    </Modal>
  );
}

type BulkCreateModalProps = {
  open: boolean;
  orgId: string;
  onClose: () => void;
  onCompleted: () => void;
  onMessage: (message: string) => void;
};

function getFieldValue(row: Record<string, unknown>, aliases: string[]) {
  for (const alias of aliases) {
    if (row[alias] != null) {
      return String(row[alias]).trim();
    }
  }
  return '';
}

async function parseCsvUsers(file: File) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheet = workbook.SheetNames[0];
  if (!firstSheet) {
    return [] as BulkUserRow[];
  }

  const sheet = workbook.Sheets[firstSheet];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

  return rows.map((row) => ({
    email: getFieldValue(row, ['email', 'correo']),
    firstName: getFieldValue(row, ['first_name', 'first', 'firstname', 'nombre']),
    lastName: getFieldValue(row, ['last_name', 'last', 'lastname', 'apellido']),
    password: getFieldValue(row, ['password', 'contraseña']),
    role: getFieldValue(row, ['role', 'rol']),
  }));
}

function BulkCreateModal({ open, orgId, onClose, onCompleted, onMessage }: BulkCreateModalProps) {
  const [role, setRole] = useState('org:transportista');
  const [autoGeneratePassword, setAutoGeneratePassword] = useState(true);
  const [rows, setRows] = useState<BulkUserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [creationCompleted, setCreationCompleted] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<BulkCreateSummary | null>(null);
  const [results, setResults] = useState<BulkCreateResultRow[]>([]);

  const resetForm = () => {
    setRole('org:transportista');
    setAutoGeneratePassword(true);
    setRows([]);
    setCreationCompleted(false);
    setError('');
    setSummary(null);
    setResults([]);
  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError('');
    setCreationCompleted(false);
    setSummary(null);
    setResults([]);

    if (!file) {
      setRows([]);
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Solo se permite archivo CSV.');
      setRows([]);
      return;
    }

    try {
      const parsedRows = await parseCsvUsers(file);
      if (parsedRows.length === 0) {
        setError('El archivo no contiene filas.');
      }
      setRows(parsedRows);
    } catch {
      setError('No se pudo leer el archivo CSV.');
      setRows([]);
    }
  };

  const downloadTemplate = () => {
    const content = 'email,first_name,last_name,password,role\nusuario@correo.com,Nombre,Apellido,,org:transportista';
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla-usuarios.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBulkCreate = async () => {
    setError('');
    if (rows.length === 0) {
      setError('Selecciona un CSV con al menos una fila.');
      return;
    }

    setLoading(true);
    try {
      const payloadRows = rows
        .map((row) => ({
          email: row.email.trim().toLowerCase(),
          firstName: row.firstName.trim(),
          lastName: row.lastName.trim(),
          password: row.password?.trim(),
          role: row.role?.trim() || role,
        }))
        .filter((row) => row.email || row.firstName || row.lastName || row.password || row.role);

      const res = await fetch('/api/users/bulk-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          role,
          autoGeneratePassword,
          users: payloadRows,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? 'No se pudo completar la carga masiva.');
        return;
      }

      setSummary(data?.summary ?? null);
      setResults(Array.isArray(data?.results) ? data.results : []);
      setCreationCompleted(true);
      onMessage('Carga masiva finalizada. Revisa el resumen y resultados.');
      onCompleted();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal opened={open} onClose={handleClose} title="Carga Masiva CSV" centered size="lg">
      <div className="flex flex-col gap-3">
        <Text size="sm" c="dimmed">
          CSV esperado: email, first_name, last_name, password, role (opcional)
        </Text>

        <Group gap="sm">
          <Button variant="default" onClick={downloadTemplate}>
            Descargar plantilla
          </Button>
          <input type="file" accept=".csv" onChange={handleFileChange} disabled={loading} />
        </Group>

        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          disabled={loading}
          className="border rounded px-3 py-2"
        >
          {AVAILABLE_ROLES.map((availableRole) => (
            <option key={availableRole.value} value={availableRole.value}>
              {availableRole.label}
            </option>
          ))}
        </select>

        <Checkbox
          label="Autogenerar password para filas sin password"
          checked={autoGeneratePassword}
          onChange={(event) => setAutoGeneratePassword(event.currentTarget.checked)}
          disabled={loading}
        />

        <Text size="sm">Filas detectadas: {rows.length}</Text>

        {rows.length > 0 && (
          <Table withTableBorder striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Email</Table.Th>
                <Table.Th>Nombre</Table.Th>
                <Table.Th>Apellido</Table.Th>
                <Table.Th>Password</Table.Th>
                <Table.Th>Rol</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.slice(0, 5).map((row, index) => (
                <Table.Tr key={`${row.email}-${index}`}>
                  <Table.Td>{row.email}</Table.Td>
                  <Table.Td>{row.firstName}</Table.Td>
                  <Table.Td>{row.lastName}</Table.Td>
                  <Table.Td>{row.password ? 'Provisto' : '-'}</Table.Td>
                  <Table.Td>{row.role || role}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}

        {error && <Text c="red">{error}</Text>}

        {summary && (
          <Alert color="blue">
            Total: {summary.total} | Creados: {summary.created} | Fallidos: {summary.failed} | Correos enviados:{' '}
            {summary.emailSent} | Correos fallidos: {summary.emailFailed}
          </Alert>
        )}

        {results.length > 0 && (
          <Table withTableBorder striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Fila</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Rol</Table.Th>
                <Table.Th>Estado</Table.Th>
                <Table.Th>Correo</Table.Th>
                <Table.Th>Password generado</Table.Th>
                <Table.Th>Detalle</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {results.map((result) => (
                <Table.Tr key={`${result.row}-${result.email}`}>
                  <Table.Td>{result.row}</Table.Td>
                  <Table.Td>{result.email}</Table.Td>
                  <Table.Td>{result.role ?? '-'}</Table.Td>
                  <Table.Td>{result.success ? 'Creado' : 'Error'}</Table.Td>
                  <Table.Td>{result.emailSent ? 'Enviado' : 'No enviado'}</Table.Td>
                  <Table.Td>{result.generatedPassword ?? '-'}</Table.Td>
                  <Table.Td>{result.error ?? '-'}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={handleClose} disabled={loading}>
            Cerrar
          </Button>
          <Button
            onClick={() => void handleBulkCreate()}
            loading={loading}
            disabled={rows.length === 0 || creationCompleted}
          >
            Crear usuarios
          </Button>
        </Group>
      </div>
    </Modal>
  );
}

export default function UsersTable({
  organizations,
  showOrganizationSelector = true,
  isSuperAdmin = false,
}: {
  organizations: Org[];
  showOrganizationSelector?: boolean;
  isSuperAdmin?: boolean;
}) {
  const [selectedOrg, setSelectedOrg] = useState(organizations[0]?.id ?? '');
  const [activeTab, setActiveTab] = useState<'users' | 'invitations'>('users');
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [resettingUserId, setResettingUserId] = useState('');
  const [deletingUserId, setDeletingUserId] = useState('');
  const [membersMessage, setMembersMessage] = useState('');
  const [invitationMessage, setInvitationMessage] = useState('');
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [bulkCreateModalOpen, setBulkCreateModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; member: Member | null }>({
    open: false,
    member: null,
  });

  const loadMembers = async (orgId: string) => {
    setLoadingMembers(true);
    try {
      const res = await fetch(`/api/org-members?orgId=${orgId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMembers(data);
      } else {
        setMembers([]);
      }
    } catch (error) {
      console.error('Error loading members:', error);
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadInvitations = async (orgId: string) => {
    setLoadingInvitations(true);
    try {
      const res = await fetch(`/api/invitations?orgId=${orgId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setInvitations(data);
      } else {
        setInvitations([]);
      }
    } catch (error) {
      console.error('Error loading invitations:', error);
      setInvitations([]);
    } finally {
      setLoadingInvitations(false);
    }
  };

  useEffect(() => {
    if (selectedOrg) {
      void loadMembers(selectedOrg);
      void loadInvitations(selectedOrg);
    }
  }, [selectedOrg]);

  const handleResetPassword = async (member: Member) => {
    setMembersMessage('');
    if (!member.id || !member.email) {
      setMembersMessage('No se pudo preparar el restablecimiento de contraseña.');
      return;
    }

    setResettingUserId(member.id);
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: member.id, orgId: selectedOrg }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMembersMessage(data?.error ?? 'No se pudo reenviar el correo.');
        return;
      }

      setMembersMessage(`Se envió un nuevo enlace de configuración a ${member.email}.`);
    } finally {
      setResettingUserId('');
    }
  };

  const handleDeleteUser = async (member: Member) => {
    setMembersMessage('');
    if (!member.id || !member.email || !selectedOrg) {
      setMembersMessage('No se pudo preparar la eliminación del usuario.');
      return;
    }

    setDeleteModal({ open: true, member });
  };

  const confirmDeleteUser = async () => {
    const member = deleteModal.member;
    if (!member) return;

    setDeleteModal({ open: false, member: null });
    setDeletingUserId(member.id);

    try {
      const res = await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: member.id, orgId: selectedOrg }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMembersMessage(data?.error ?? 'No se pudo eliminar el usuario.');
        return;
      }

      setMembersMessage(`Usuario ${member.email} eliminado.`);
      await loadMembers(selectedOrg);
    } finally {
      setDeletingUserId('');
    }
  };

  const filteredMembers = members.filter((member: any) => {
    if (isSuperAdmin) return true;
    if ((member as any).is_super_admin === true) return false;
    if (member.role && member.role.toLowerCase() === 'superadmin') return false;
    return true;
  });

  return (
    <>
      {showOrganizationSelector && (
        <Group mb="md">
          <Select
            data={organizations.map((org) => ({ value: org.id, label: org.name }))}
            value={selectedOrg}
            onChange={(value) => value && setSelectedOrg(value)}
            disabled={organizations.length <= 1}
            placeholder="Seleccionar organización"
            style={{ minWidth: 200 }}
          />
        </Group>
      )}

      {membersMessage && (
        <Alert color="blue" mb="md">
          {membersMessage}
        </Alert>
      )}

      {invitationMessage && (
        <Alert color="green" mb="md">
          {invitationMessage}
        </Alert>
      )}

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value as 'users' | 'invitations')}>
        <Tabs.List>
          <Tabs.Tab value="users">Usuarios</Tabs.Tab>
          <Tabs.Tab value="invitations">Invitaciones</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="users" pt="md">
          <Group mb="md" justify="flex-end">
            <Button onClick={() => setCreateUserModalOpen(true)} disabled={!selectedOrg}>
              Crear Usuario
            </Button>
            <Button variant="light" onClick={() => setBulkCreateModalOpen(true)} disabled={!selectedOrg}>
              Carga masiva CSV
            </Button>
          </Group>

          <Alert color="gray" mb="md">
            <Text fw={600} mb={4}>Invitar usuario</Text>
            <InviteForm
              orgId={selectedOrg}
              members={members}
              onInvited={() => selectedOrg && void loadInvitations(selectedOrg)}
            />
          </Alert>

          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Usuario</Table.Th>
                <Table.Th>Correo Electrónico</Table.Th>
                <Table.Th>Rol</Table.Th>
                <Table.Th>Estado</Table.Th>
                <Table.Th>Último Acceso</Table.Th>
                <Table.Th>Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loadingMembers ? (
                <Table.Tr>
                  <Table.Td colSpan={6} ta="center" py="xl">
                    <Group justify="center">
                      <Loader size="sm" />
                      <Text>Cargando usuarios...</Text>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ) : filteredMembers.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={6} ta="center" py="xl" c="dimmed">
                    No se encontraron usuarios.
                  </Table.Td>
                </Table.Tr>
              ) : (
                filteredMembers.map((member) => (
                  <Table.Tr key={member.id}>
                    <Table.Td>{member.username}</Table.Td>
                    <Table.Td>{member.email}</Table.Td>
                    <Table.Td>{member.role}</Table.Td>
                    <Table.Td>{member.status ?? <Text c="dimmed">Desconocido</Text>}</Table.Td>
                    <Table.Td>
                      {member.lastSignInAt ? (
                        new Date(member.lastSignInAt).toLocaleString()
                      ) : (
                        <Text c="dimmed">-</Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Button
                          size="xs"
                          variant="light"
                          leftSection={<IconMail size={14} />}
                          onClick={() => void handleResetPassword(member)}
                          disabled={resettingUserId === member.id || deletingUserId === member.id}
                          loading={resettingUserId === member.id}
                        >
                          Restablecer
                        </Button>
                        <Button
                          size="xs"
                          variant="light"
                          color="red"
                          leftSection={<IconTrash size={14} />}
                          onClick={() => void handleDeleteUser(member)}
                          disabled={deletingUserId === member.id || resettingUserId === member.id}
                          loading={deletingUserId === member.id}
                        >
                          Eliminar
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="invitations" pt="md">
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Correo Electrónico</Table.Th>
                <Table.Th>Rol</Table.Th>
                <Table.Th>Fecha de Creación</Table.Th>
                <Table.Th>Expira</Table.Th>
                <Table.Th>Estado</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loadingInvitations ? (
                <Table.Tr>
                  <Table.Td colSpan={5} ta="center" py="xl">
                    <Group justify="center">
                      <Loader size="sm" />
                      <Text>Cargando invitaciones...</Text>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ) : invitations.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={5} ta="center" py="xl" c="dimmed">
                    No se encontraron invitaciones.
                  </Table.Td>
                </Table.Tr>
              ) : (
                invitations.map((invitation) => (
                  <Table.Tr key={invitation.id}>
                    <Table.Td>{invitation.email}</Table.Td>
                    <Table.Td>{invitation.role}</Table.Td>
                    <Table.Td>{new Date(invitation.created_at).toLocaleString()}</Table.Td>
                    <Table.Td>{new Date(invitation.expires_at).toLocaleString()}</Table.Td>
                    <Table.Td>
                      {invitation.accepted_at ? (
                        <Text c="green">Aceptada</Text>
                      ) : (
                        <Text c="orange">Pendiente</Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>
      </Tabs>

      <CreateUserModal
        open={createUserModalOpen}
        orgId={selectedOrg}
        onClose={() => setCreateUserModalOpen(false)}
        onCompleted={() => {
          if (selectedOrg) {
            void loadMembers(selectedOrg);
          }
        }}
        onMessage={(message) => setMembersMessage(message)}
      />

      <BulkCreateModal
        open={bulkCreateModalOpen}
        orgId={selectedOrg}
        onClose={() => setBulkCreateModalOpen(false)}
        onCompleted={() => {
          if (selectedOrg) {
            void loadMembers(selectedOrg);
          }
        }}
        onMessage={(message) => setMembersMessage(message)}
      />

      <Modal
        opened={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, member: null })}
        title="Confirmar eliminación"
        centered
      >
        <Text>
          Esta acción eliminará al usuario {deleteModal.member?.email}. ¿Deseas continuar?
        </Text>
        <Group justify="flex-end" mt="md">
          <Button
            variant="default"
            onClick={() => setDeleteModal({ open: false, member: null })}
          >
            Cancelar
          </Button>
          <Button
            color="red"
            onClick={confirmDeleteUser}
            loading={deletingUserId === deleteModal.member?.id}
          >
            Eliminar
          </Button>
        </Group>
      </Modal>
    </>
  );
}