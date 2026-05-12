'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Modal, Button, Group, Text, TextInput, Loader } from '@mantine/core'
import { Header } from '../../components/layout/Header'

function ProfileModal({ open, user, onClose }: { open: boolean; user: any; onClose: () => void }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setMessage('')
    setError('')
    setLoadingProfile(true)
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        setFirstName(data?.firstName ?? '')
        setLastName(data?.lastName ?? '')
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false))
  }, [open])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')
    if (!firstName.trim() || !lastName.trim()) {
      setError('Nombre y apellido son obligatorios.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error ?? 'No se pudo actualizar el perfil.')
        return
      }
      setMessage('Perfil actualizado correctamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async () => {
    setMessage('')
    setError('')
    setResetting(true)
    try {
      const res = await fetch('/api/profile/reset-password', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error ?? 'No se pudo enviar el correo de restablecimiento.')
        return
      }
      setMessage('Se envió un enlace para restablecer tu contraseña a tu correo.')
    } finally {
      setResetting(false)
    }
  }

  const handleClose = () => {
    if (saving || resetting) return
    setFirstName('')
    setLastName('')
    setMessage('')
    setError('')
    setLoadingProfile(false)
    onClose()
  }

  return (
    <Modal opened={open} onClose={handleClose} title="Mi Perfil" centered>
      <form onSubmit={handleSave} className="flex flex-col gap-3">
        <Text size="sm" c="dimmed">{user?.email}</Text>

        {loadingProfile ? (
          <Group justify="center" py="md"><Loader size="sm" /></Group>
        ) : (
          <>
            <TextInput
              label="Nombre"
              placeholder="Tu nombre"
              value={firstName}
              onChange={(e) => setFirstName(e.currentTarget.value)}
              disabled={saving || resetting}
            />
            <TextInput
              label="Apellido"
              placeholder="Tu apellido"
              value={lastName}
              onChange={(e) => setLastName(e.currentTarget.value)}
              disabled={saving || resetting}
            />
          </>
        )}

        {error && <Text c="red" size="sm">{error}</Text>}
        {message && <Text c="teal" size="sm">{message}</Text>}

        <Group justify="space-between" mt="sm">
          <Button
            variant="light"
            onClick={() => void handleResetPassword()}
            loading={resetting}
            disabled={saving}
            type="button"
          >
            Restablecer contraseña
          </Button>
          <Group gap="xs">
            <Button variant="default" onClick={handleClose} disabled={saving || resetting} type="button">
              Cancelar
            </Button>
            <Button type="submit" loading={saving} disabled={resetting}>
              Guardar
            </Button>
          </Group>
        </Group>
      </form>
    </Modal>
  )
}

export default function MainShell({ user, children }: { user: any, children: React.ReactNode }) {
  const router = useRouter()
  const [profileOpen, setProfileOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <>
      <Header user={user} onSignOut={handleSignOut} onProfileClick={() => setProfileOpen(true)} />
      <ProfileModal open={profileOpen} user={user} onClose={() => setProfileOpen(false)} />
      {children}
    </>
  )
}
