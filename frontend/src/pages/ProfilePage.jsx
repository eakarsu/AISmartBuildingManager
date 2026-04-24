import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Shield, Key, Save, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { apiGet, apiPut } from '../api'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Edit profile form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  // Change password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await apiGet('/profile')
      setProfile(data)
      setName(data.name || '')
      setEmail(data.email || '')
    } catch (err) {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      setSavingProfile(true)
      const data = await apiPut('/profile', { name, email })
      setProfile(data)
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    try {
      setSavingPassword(true)
      await apiPut('/profile/password', {
        current_password: currentPassword,
        new_password: newPassword
      })
      toast.success('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error('Failed to change password')
    } finally {
      setSavingPassword(false)
    }
  }

  const inputClass = 'w-full bg-dark-900 border border-dark-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500'
  const btnClass = 'px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors'

  return (
    <div className="min-h-screen bg-dark-950">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 bg-dark-800 border border-dark-700 rounded-lg text-dark-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-white">User Profile</h1>
        </div>

        {loading ? (
          <div className="text-center text-dark-400 py-20">Loading...</div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{profile.name}</h2>
                  <p className="text-dark-400 flex items-center gap-2 mt-1">
                    <Mail size={14} />
                    {profile.email}
                  </p>
                  <p className="text-dark-400 flex items-center gap-2 mt-1">
                    <Shield size={14} />
                    <span className="capitalize">{profile.role}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Edit Profile */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <User size={20} />
                Edit Profile
              </h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <button type="submit" disabled={savingProfile} className={btnClass + ' flex items-center gap-2'}>
                  <Save size={16} />
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Key size={20} />
                Change Password
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <button type="submit" disabled={savingPassword} className={btnClass + ' flex items-center gap-2'}>
                  <Key size={16} />
                  {savingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="text-center text-dark-400 py-20">Failed to load profile</div>
        )}
      </div>
    </div>
  )
}
