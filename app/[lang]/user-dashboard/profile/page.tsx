'use client'

import React, { useState, useEffect } from 'react'
import {
  User, Phone, Mail, Lock, Eye, EyeOff, Save, Loader2,
  Calendar as CalendarIcon, Briefcase, AlertCircle, Camera,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { getMe, updateUser, updatePassword, getAllStaffs, updateStaff, uploadGeneralImage } from '@/lib/api'
import { useLanguage } from '@/context/LanguageContext'
import { translations } from '@/language/translations'
import { Select } from 'antd'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { getImageUrl } from '@/utils/baseURL'

// ---------------------------------------------------------------------------
// CustomDatePicker
// ---------------------------------------------------------------------------
interface CustomDatePickerProps {
  label: string
  value: string | null
  onChange: (isoDate: string) => void
}

const CustomDatePicker = ({ label, value, onChange }: CustomDatePickerProps) => {
  const [date, setDate] = React.useState<Date | null>(value ? new Date(value) : null)

  React.useEffect(() => {
    if (value && (!date || new Date(value).getTime() !== date.getTime())) {
      setDate(new Date(value))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const handleSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return
    setDate(selectedDate)
    onChange(selectedDate.toISOString())
  }

  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-between text-left font-normal border border-gray-200 rounded-lg px-4 py-2.5 h-auto hover:bg-gray-50 focus:ring-2 focus:ring-[#41398B] ${!date ? 'text-muted-foreground' : ''}`}
          >
            {date ? format(date, 'dd/MM/yyyy') : <span>Select date</span>}
            <CalendarIcon className="h-4 w-4 text-gray-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date ?? undefined}
            onSelect={handleSelect}
            initialFocus={false}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

// ---------------------------------------------------------------------------
// UserProfile page
// ---------------------------------------------------------------------------
interface UserData {
  _id?: string
  id?: string
  name?: string
  phone?: string
  mobile?: string
  email?: string
  employeeId?: string
  profileImage?: string
  role?: string
}

interface StaffData {
  _id: string
  staffsEmail?: string
  staffsImage?: string
  staffsName?: { en?: string; vi?: string }
  staffsId?: string
  staffsNumbers?: string[]
  staffsRole?: { en?: string }
  staffsDepartment?: { en?: string; vi?: string }
  staffsDesignation?: { en?: string; vi?: string }
  staffsDob?: string | null
  staffsGender?: string | null
  staffsJoiningDate?: string | null
  status?: string
}

interface BilingualField {
  en: string
  vi: string
}

export default function ProfilePage() {
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations] as Record<string, string>

  const [user, setUser] = useState<UserData | null>(null)
  const [staffData, setStaffData] = useState<StaffData | null>(null)
  const [isStaff, setIsStaff] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)

  const [userForm, setUserForm] = useState({
    name: '',
    mobile: '',
    email: '',
    employeeId: '',
    profileImage: '',
  })

  const [staffForm, setStaffForm] = useState({
    profileImage: '',
    firstName: { en: '', vi: '' } as BilingualField,
    middleName: { en: '', vi: '' } as BilingualField,
    lastName: { en: '', vi: '' } as BilingualField,
    email: '',
    employeeId: '',
    phone: '',
    role: '',
    department: { en: '', vi: '' } as BilingualField,
    designation: { en: '', vi: '' } as BilingualField,
    dob: null as string | null,
    gender: null as string | null,
    joiningDate: null as string | null,
    status: 'Active',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  useEffect(() => {
    fetchUserData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchUserData = async () => {
    setLoading(true)
    try {
      const res = await getMe()
      if (res.data) {
        const userData: UserData = res.data.data || res.data.user
        setUser(userData)

        setUserForm({
          name: userData.name || '',
          mobile: userData.phone || userData.mobile || '',
          email: userData.email || '',
          employeeId: userData.employeeId || '',
          profileImage: userData.profileImage || '',
        })

        if (userData.role === 'user') {
          setIsStaff(false)
          localStorage.setItem('userImage', userData.profileImage || '')
          window.dispatchEvent(new Event('userProfileUpdated'))
        } else {
          setIsStaff(true)
          const staffRes = await getAllStaffs()
          const allStaffs: StaffData[] = staffRes.data.data || []
          const foundStaff = allStaffs.find(
            (s) => s.staffsEmail?.toLowerCase() === userData.email?.toLowerCase()
          )

          if (foundStaff) {
            setStaffData(foundStaff)
            const nameEn = foundStaff.staffsName?.en || ''
            const nameVi = foundStaff.staffsName?.vi || ''
            const partsEn = nameEn.split(' ')
            const partsVi = nameVi.split(' ')

            setStaffForm({
              profileImage: foundStaff.staffsImage || '',
              firstName: { en: partsEn[0] || '', vi: partsVi[0] || '' },
              middleName: { en: partsEn.length > 2 ? partsEn[1] : '', vi: partsVi.length > 2 ? partsVi[1] : '' },
              lastName: { en: partsEn[partsEn.length - 1] || '', vi: partsVi[partsVi.length - 1] || '' },
              email: foundStaff.staffsEmail || '',
              employeeId: foundStaff.staffsId || '',
              phone: foundStaff.staffsNumbers?.[0] || '',
              role: foundStaff.staffsRole?.en || '',
              department: { en: foundStaff.staffsDepartment?.en || '', vi: foundStaff.staffsDepartment?.vi || '' },
              designation: { en: foundStaff.staffsDesignation?.en || '', vi: foundStaff.staffsDesignation?.vi || '' },
              dob: foundStaff.staffsDob || null,
              gender: foundStaff.staffsGender || null,
              joiningDate: foundStaff.staffsJoiningDate || null,
              status: foundStaff.status || 'Active',
            })
            localStorage.setItem('userImage', foundStaff.staffsImage || '')
            window.dispatchEvent(new Event('userProfileUpdated'))
          } else {
            console.warn('Staff record not found linked to this account.')
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Failed to load user profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Max image size 5MB')
      return
    }

    try {
      const res = await uploadGeneralImage(file)
      if (res.data.success) {
        const imageUrl: string = res.data.url
        setUserForm((prev) => ({ ...prev, profileImage: imageUrl }))
        if (isStaff) {
          setStaffForm((prev) => ({ ...prev, profileImage: imageUrl }))
        }

        const userId = user?._id || user?.id
        if (isStaff && staffData?._id) {
          const fullNameEn = [staffForm.firstName.en, staffForm.middleName.en, staffForm.lastName.en].filter(Boolean).join(' ')
          const fullNameVi = [staffForm.firstName.vi, staffForm.middleName.vi, staffForm.lastName.vi].filter(Boolean).join(' ')

          await updateStaff(staffData._id, {
            staffsImage: imageUrl,
            staffsName_en: fullNameEn,
            staffsName_vi: fullNameVi,
            staffsId: staffForm.employeeId,
            staffsRole_en: staffForm.role,
            staffsRole_vi: staffForm.role,
            staffsEmail: staffForm.email,
            staffsNumbers: [staffForm.phone],
            staffsGender: staffForm.gender,
            staffsDob: staffForm.dob,
            staffsJoiningDate: staffForm.joiningDate,
            status: staffForm.status,
          })
        } else if (userId) {
          await updateUser(userId, {
            profileImage: imageUrl,
            name: userForm.name,
            email: userForm.email,
            phone: userForm.mobile,
            employeeId: userForm.employeeId,
          })
        }

        toast.success(t?.profilePictureUpdated || 'Profile picture updated and saved!')
        fetchUserData()
      }
    } catch (error) {
      console.error('Error uploading/saving image:', error)
      toast.error('Failed to save image')
    }
  }

  const handleUserUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const userId = user?._id || user?.id
      const payload = {
        name: userForm.name,
        email: userForm.email,
        phone: userForm.mobile,
        mobile: userForm.mobile,
        employeeId: userForm.employeeId,
        profileImage: userForm.profileImage,
      }
      if (userId) await updateUser(userId, payload)
      toast.success(t?.profileUpdatedSuccess || 'Profile updated successfully!')
      fetchUserData()
    } catch (error: unknown) {
      console.error('Error updating profile:', error)
      const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to update profile'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleStaffUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    if (!staffData?._id) {
      console.warn('No staff record found.')
      setSaving(false)
      return
    }

    const fullNameEn = [staffForm.firstName.en, staffForm.middleName.en, staffForm.lastName.en].filter(Boolean).join(' ')
    const fullNameVi = [staffForm.firstName.vi, staffForm.middleName.vi, staffForm.lastName.vi].filter(Boolean).join(' ')

    const payload = {
      staffsImage: staffForm.profileImage,
      staffsName_en: fullNameEn,
      staffsName_vi: fullNameVi,
      staffsId: staffForm.employeeId,
      staffsRole_en: staffForm.role,
      staffsRole_vi: staffForm.role,
      staffsDepartment_en: staffForm.department.en,
      staffsDepartment_vi: staffForm.department.vi,
      staffsDesignation_en: staffForm.designation.en,
      staffsDesignation_vi: staffForm.designation.vi,
      staffsEmail: staffForm.email,
      staffsNumbers: [staffForm.phone],
      staffsGender: staffForm.gender,
      staffsDob: staffForm.dob,
      staffsJoiningDate: staffForm.joiningDate,
      status: staffForm.status,
    }

    try {
      await updateStaff(staffData._id, payload)
      toast.success(t?.staffProfileUpdatedSuccess || 'Staff profile updated successfully!')
      fetchUserData()
    } catch (error: unknown) {
      console.error('Error updating staff profile:', error)
      const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to update staff profile'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value })
  }

  const toggleShowPassword = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const { currentPassword, newPassword, confirmPassword } = passwordData

    if (newPassword !== confirmPassword) {
      toast.error(t?.passwordsDoNotMatch || 'Passwords do not match!')
      return
    }

    setPasswordSaving(true)
    try {
      await updatePassword({ currentPassword, newPassword })
      toast.success(t?.passwordUpdatedSuccess || 'Password updated successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: unknown) {
      console.error('Change password error:', error)
      const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to update password'
      toast.error(msg)
    } finally {
      setPasswordSaving(false)
    }
  }

  const staffT = {
    firstName: language === 'vi' ? 'Tên' : 'First Name',
    middleName: language === 'vi' ? 'Tên Đệm' : 'Middle Name',
    lastName: language === 'vi' ? 'Họ' : 'Last Name',
    department: language === 'vi' ? 'Phòng Ban' : 'Department',
    designation: language === 'vi' ? 'Chức Vụ' : 'Designation',
    phone: language === 'vi' ? 'Số Điện Thoại' : 'Phone Number',
    dob: language === 'vi' ? 'Ngày Sinh' : 'Date of Birth',
    gender: language === 'vi' ? 'Giới Tính' : 'Gender',
    male: language === 'vi' ? 'Nam' : 'Male',
    female: language === 'vi' ? 'Nữ' : 'Female',
    email: language === 'vi' ? 'Email (Tên Đăng Nhập)' : 'Email (Login ID)',
    employeeId: language === 'vi' ? 'Mã Nhân Viên' : 'Employee ID',
    other: language === 'vi' ? 'Khác' : 'Other',
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-[#41398B]" size={40} />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10 animate-slideUpFade">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {isStaff ? (language === 'vi' ? 'Hồ Sơ Nhân Viên' : 'Staff Profile') : (t?.myProfile || 'My Profile')}
        </h1>
        <p className="text-gray-500">
          {isStaff
            ? (language === 'vi' ? 'Quản lý thông tin và mật khẩu của bạn.' : 'Manage your account settings and password.')
            : (t?.manageAccount || 'Manage your account settings and password.')}
        </p>
      </div>

      {/* Warning if Staff Record Not Found */}
      {isStaff && !staffData && !loading && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-2xl flex items-start gap-3">
          <AlertCircle className="mt-1 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-lg">Staff Profile Not Found</h3>
            <p className="opacity-90 mt-1">
              Your account has the role <strong>{user?.role}</strong>, but no linked Staff Profile was found for email{' '}
              <strong>{user?.email}</strong>.
              <br />
              Please contact your administrator to create a Staff entry for this email address.
            </p>
          </div>
        </div>
      )}

      {/* --- USER FORM --- */}
      {!isStaff && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <User className="text-[#41398B]" size={20} />
            {t?.personalInfo || 'Personal Information'}
          </h2>
          <form onSubmit={handleUserUpdate} className="space-y-6">

            {/* Profile Image */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div
                className="relative group cursor-pointer"
                onClick={() => document.getElementById('userPhoto')?.click()}
              >
                <div className="w-28 h-28 rounded-full border-4 border-gray-50 shadow-sm overflow-hidden bg-white relative flex items-center justify-center transition-all group-hover:ring-4 group-hover:ring-[#41398B]/20">
                  {userForm.profileImage ? (
                    <img
                      src={getImageUrl(userForm.profileImage)}
                      alt="Profile"
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-300" />
                  )}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
                  <Camera className="text-white w-8 h-8 drop-shadow-md" />
                </div>
                <input
                  id="userPhoto"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {language === 'vi' ? 'Nhấp để thay đổi ảnh' : 'Click to change photo'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t?.fullName || 'Full Name'}</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="name"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B]/20 focus:border-[#41398B] outline-none transition-all text-[#000]"
                    placeholder={t?.enterName || 'Enter your name'}
                  />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t?.mobileNumber || 'Mobile Number'}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="mobile"
                    value={userForm.mobile}
                    onChange={(e) => setUserForm({ ...userForm, mobile: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B]/20 focus:border-[#41398B] outline-none transition-all text-[#000]"
                    placeholder={t?.enterMobile || 'Enter your mobile'}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t?.emailAddress || 'Email Address'}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    readOnly
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none cursor-not-allowed text-[#000]"
                    placeholder={t?.enterEmail || 'Enter your email'}
                  />
                </div>
              </div>

              {/* Employee ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t?.userEmployeeId || 'User/Employee ID'}</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="employeeId"
                    value={userForm.employeeId}
                    readOnly
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none cursor-not-allowed text-[#000]"
                    placeholder="ID"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#41398B] hover:bg-[#352e7a] text-white rounded-full font-medium transition-colors disabled:opacity-70 shadow-lg shadow-[#41398B]/20"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {t?.saveChanges || 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- STAFF FORM --- */}
      {isStaff && staffData && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <User className="text-[#41398B]" size={20} />
              {language === 'vi' ? 'Chi Tiết Nhân Viên' : 'Staff Details'}
            </h2>
          </div>

          <form onSubmit={handleStaffUpdate} className="space-y-6">

            {/* Profile Image */}
            <div className="flex flex-col items-center justify-center mb-8">
              <div
                className="relative group cursor-pointer"
                onClick={() => document.getElementById('staffPhoto')?.click()}
              >
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white relative flex items-center justify-center transition-all group-hover:ring-4 group-hover:ring-[#41398B]/20">
                  {staffForm.profileImage ? (
                    <img
                      src={getImageUrl(staffForm.profileImage)}
                      alt="Profile"
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-gray-300 select-none">
                      {staffForm.firstName?.en ? staffForm.firstName.en.charAt(0).toUpperCase() : ''}
                      {staffForm.lastName?.en ? staffForm.lastName.en.charAt(0).toUpperCase() : ''}
                    </span>
                  )}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
                  <Camera className="text-white w-8 h-8 drop-shadow-md" />
                </div>
                <input
                  id="staffPhoto"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {language === 'vi' ? 'Nhấp để thay đổi ảnh' : 'Click to change photo'}
              </p>
            </div>

            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{staffT.email}</label>
                <input
                  type="email"
                  value={staffForm.email}
                  readOnly
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed outline-none text-[#000]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{staffT.employeeId}</label>
                <input
                  type="text"
                  value={staffForm.employeeId}
                  readOnly
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed outline-none text-[#000]"
                />
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{staffT.firstName}</label>
                <input
                  type="text"
                  value={staffForm.firstName[language as keyof BilingualField] || ''}
                  onChange={(e) => setStaffForm({ ...staffForm, firstName: { ...staffForm.firstName, [language]: e.target.value } })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{staffT.middleName}</label>
                <input
                  type="text"
                  value={staffForm.middleName[language as keyof BilingualField] || ''}
                  onChange={(e) => setStaffForm({ ...staffForm, middleName: { ...staffForm.middleName, [language]: e.target.value } })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{staffT.lastName}</label>
                <input
                  type="text"
                  value={staffForm.lastName[language as keyof BilingualField] || ''}
                  onChange={(e) => setStaffForm({ ...staffForm, lastName: { ...staffForm.lastName, [language]: e.target.value } })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{staffT.department}</label>
                <input
                  type="text"
                  value={staffForm.department[language as keyof BilingualField] || ''}
                  onChange={(e) => setStaffForm({ ...staffForm, department: { ...staffForm.department, [language]: e.target.value } })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{staffT.designation}</label>
                <input
                  type="text"
                  value={staffForm.designation[language as keyof BilingualField] || ''}
                  onChange={(e) => setStaffForm({ ...staffForm, designation: { ...staffForm.designation, [language]: e.target.value } })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{staffT.phone}</label>
                <input
                  type="text"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B] outline-none"
                />
              </div>
              <CustomDatePicker
                label={staffT.dob}
                value={staffForm.dob}
                onChange={(date) => setStaffForm({ ...staffForm, dob: date })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{staffT.gender}</label>
                <Select
                  value={staffForm.gender}
                  onChange={(val) => setStaffForm({ ...staffForm, gender: val })}
                  className="w-full h-[42px]"
                  options={[
                    { value: 'Male', label: staffT.male },
                    { value: 'Female', label: staffT.female },
                    { value: 'Other', label: staffT.other },
                  ]}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#41398B] hover:bg-[#352e7a] text-white rounded-full font-medium transition-colors disabled:opacity-70 shadow-lg shadow-[#41398B]/20"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {language === 'vi' ? 'Cập Nhật Hồ Sơ' : 'Update Staff Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Change Password Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Lock className="text-[#41398B]" size={20} />
          {t?.changePassword || 'Change Password'}
        </h2>
        <form onSubmit={handlePasswordUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t?.currentPassword || 'Current Password'}</label>
              <div className="relative">
                <input
                  type={showPassword.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B]/20 focus:border-[#41398B] outline-none transition-all text-[#000]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('current')}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-[#41398B] transition-colors"
                >
                  {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t?.newPassword || 'New Password'}</label>
              <div className="relative">
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B]/20 focus:border-[#41398B] outline-none transition-all text-[#000]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('new')}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-[#41398B] transition-colors"
                >
                  {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t?.confirmPassword || 'Confirm Password'}</label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#41398B]/20 focus:border-[#41398B] outline-none transition-all text-[#000]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('confirm')}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-[#41398B] transition-colors"
                >
                  {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={passwordSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#41398B] hover:bg-[#352e7a] text-white rounded-full font-medium transition-colors disabled:opacity-70 shadow-lg shadow-[#41398B]/20"
            >
              {passwordSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {t?.updatePassword || 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
