'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import { Camera, Save, LogOut, Mail, User, Shield, Eye, EyeOff } from 'lucide-react'

interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url: string
}

export default function ProfilPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [fullName, setFullName] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)
  const [savedPwd, setSavedPwd] = useState(false)
  const [pwdError, setPwdError] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const p: UserProfile = {
        id: user.id,
        email: user.email ?? '',
        full_name: (user.user_metadata?.full_name as string) ?? '',
        avatar_url: (user.user_metadata?.avatar_url as string) ?? '',
      }
      setProfile(p)
      setFullName(p.full_name)
      setLoading(false)
    }
    loadProfile()
  }, [router])

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!profile) return
    setSaving(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      let avatar_url = profile.avatar_url

      // Upload photo si nouvelle sélectionnée
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `avatars/${profile.id}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true })
        if (!uploadError) {
          const { data } = supabase.storage.from('avatars').getPublicUrl(path)
          avatar_url = data.publicUrl
        }
      }

      // Mise à jour des métadonnées utilisateur
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName, avatar_url },
      })
      if (error) throw error

      setProfile(prev => prev ? { ...prev, full_name: fullName, avatar_url } : null)
      setAvatarFile(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  async function handleSavePassword() {
    setPwdError('')
    if (newPassword.length < 6) { setPwdError('Le mot de passe doit faire au moins 6 caractères.'); return }
    if (newPassword !== confirmPassword) { setPwdError('Les mots de passe ne correspondent pas.'); return }
    setSavingPwd(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setNewPassword('')
      setConfirmPassword('')
      setSavedPwd(true)
      setTimeout(() => setSavedPwd(false), 3000)
    } catch (err) {
      setPwdError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
    } finally {
      setSavingPwd(false)
    }
  }

  async function handleLogout() {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const currentAvatar = avatarPreview ?? profile?.avatar_url ?? null
  const initiales = fullName
    ? fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : profile?.email?.[0].toUpperCase() ?? '?'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <Header title="Mon profil" subtitle="Gérez vos informations personnelles et votre compte" />

      <div className="p-6 max-w-2xl space-y-5">

        {/* Photo de profil */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Camera size={15} className="text-indigo-500" />
            Photo de profil
          </h2>
          <div className="flex items-center gap-5">
            <div className="relative group">
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-gray-200">
                  {initiales}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Camera size={20} className="text-white" />
              </button>
            </div>
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
              >
                Changer la photo
              </button>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG · max 2 MB</p>
              {avatarFile && (
                <p className="text-xs text-green-600 mt-1">{avatarFile.name} sélectionné</p>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        {/* Infos personnelles */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User size={15} className="text-indigo-500" />
            Informations personnelles
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Nom complet
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Prénom Nom"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Adresse email
              </label>
              <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-100 rounded-lg bg-gray-50">
                <Mail size={14} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-500">{profile?.email}</span>
                <span className="ml-auto text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded">Vérifié</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">L'email ne peut pas être modifié ici.</p>
            </div>
          </div>
        </div>

        {/* Sécurité */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield size={15} className="text-indigo-500" />
            Mot de passe
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  type={showNewPwd ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                />
                <button type="button" onClick={() => setShowNewPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNewPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  type={showConfirmPwd ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                />
                <button type="button" onClick={() => setShowConfirmPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirmPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            {pwdError && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{pwdError}</p>}
            <button
              onClick={handleSavePassword}
              disabled={savingPwd || !newPassword}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-40"
            >
              <Shield size={13} />
              {savingPwd ? 'Mise à jour...' : savedPwd ? 'Mot de passe mis à jour ✓' : 'Mettre à jour le mot de passe'}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
          >
            <LogOut size={15} />
            Se déconnecter
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            <Save size={14} />
            {saving ? 'Sauvegarde...' : saved ? 'Sauvegardé ✓' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  )
}
