'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Building2,
  ArrowRight,
  Home,
  Check,
  Clock,
  CircleX,
  Eye,
  Loader2,
} from 'lucide-react'

// ============ Types ============
interface Stage {
  id: string
  name: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  stageOrder: number
}

interface Apartment {
  id: string
  number: number
  stages: Stage[]
}

interface Property {
  id: string
  name: string
  location: string
  apartments: Apartment[]
}

interface DashboardData {
  totalProperties: number
  totalApartments: number
  completedApartments: number
  inProgressApartments: number
  notStartedApartments: number
  properties: {
    id: string
    name: string
    location: string
    totalApartments: number
    completedApartments: number
    inProgressApartments: number
    notStartedApartments: number
  }[]
}

type View = 'dashboard' | 'property' | 'apartment'

// ============ Helper Functions ============
function getApartmentStatus(stages: Stage[]): 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' {
  if (stages.every(s => s.status === 'COMPLETED')) return 'COMPLETED'
  if (stages.every(s => s.status === 'PENDING')) return 'PENDING'
  return 'IN_PROGRESS'
}

function getRemainingStages(stages: Stage[]): Stage[] {
  return stages.filter(s => s.status !== 'COMPLETED')
}

function StatusIcon({ status, size = 18 }: { status: string; size?: number }) {
  if (status === 'COMPLETED') return <Check className="text-emerald-600" size={size} strokeWidth={3} />
  if (status === 'IN_PROGRESS') return <Clock className="text-amber-500" size={size} strokeWidth={2.5} />
  return <CircleX className="text-red-500" size={size} strokeWidth={2} />
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    COMPLETED: { label: 'مكتمل', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    IN_PROGRESS: { label: 'قيد التنفيذ', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
    PENDING: { label: 'غير مكتمل', bg: 'bg-red-100 text-red-800 border-red-200' },
  }[status] || { label: 'غير مكتمل', bg: 'bg-red-100 text-red-800 border-red-200' }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg}`}>
      <StatusIcon status={status} size={14} />
      {config.label}
    </span>
  )
}

function StatusDot({ status }: { status: string }) {
  const colors = {
    COMPLETED: 'bg-emerald-500',
    IN_PROGRESS: 'bg-amber-500',
    PENDING: 'bg-red-500',
  }
  return <span className={`inline-block w-3 h-3 rounded-full ${colors[status as keyof typeof colors] || 'bg-red-500'}`} />
}

// ============ Main Viewer App ============
export default function HomePage() {
  const [view, setView] = useState<View>('dashboard')
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [selectedApartment, setSelectedApartment] = useState<(Apartment & { property: Property }) | null>(null)
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  // ============ Data Fetching ============
  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard')
      const data = await res.json()
      setDashboard(data)
    } catch {
      // silent
    }
  }, [])

  const fetchProperties = useCallback(async () => {
    try {
      const res = await fetch('/api/properties')
      const data = await res.json()
      setProperties(data)
    } catch {
      // silent
    }
  }, [])

  const fetchProperty = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/properties/${id}`)
      const data = await res.json()
      setSelectedProperty(data)
    } catch {
      // silent
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await Promise.all([fetchDashboard(), fetchProperties()])
      setLoading(false)
    }
    load()
  }, [fetchDashboard, fetchProperties])

  // ============ Navigation ============
  const navigateToProperty = async (property: Property) => {
    setView('property')
    setSelectedProperty(property)
    await fetchProperty(property.id)
  }

  const navigateToApartment = (apartment: Apartment, property: Property) => {
    setView('apartment')
    setSelectedApartment({ ...apartment, property })
  }

  const navigateToDashboard = () => {
    setView('dashboard')
    setSelectedProperty(null)
    setSelectedApartment(null)
  }

  // ============ Loading State ============
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-gray-400" size={40} />
      </div>
    )
  }

  // ============ Dashboard View ============
  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Eye className="text-blue-700" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">متابعة الإنجاز الإنشائي</h1>
              <p className="text-xs text-gray-500">وضع العرض - للقراءة فقط</p>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6">
          {/* Stats Cards */}
          {dashboard && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Building2 className="text-gray-500" size={20} />
                    <span className="text-2xl font-bold text-gray-900">{dashboard.totalProperties}</span>
                  </div>
                  <p className="text-xs text-gray-500">إجمالي العقارات</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Home className="text-gray-500" size={20} />
                    <span className="text-2xl font-bold text-gray-900">{dashboard.totalApartments}</span>
                  </div>
                  <p className="text-xs text-gray-500">إجمالي الشقق</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Check className="text-emerald-600" size={20} />
                    <span className="text-2xl font-bold text-emerald-700">{dashboard.completedApartments}</span>
                  </div>
                  <p className="text-xs text-gray-500">شقق مكتملة</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Clock className="text-amber-500" size={20} />
                    <span className="text-2xl font-bold text-amber-600">{dashboard.inProgressApartments}</span>
                  </div>
                  <p className="text-xs text-gray-500">قيد التنفيذ</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Property List */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">العقارات</h2>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><StatusDot status="COMPLETED" /> مكتمل</span>
              <span className="flex items-center gap-1"><StatusDot status="IN_PROGRESS" /> قيد التنفيذ</span>
              <span className="flex items-center gap-1"><StatusDot status="PENDING" /> غير مكتمل</span>
            </div>
          </div>

          {properties.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Building2 className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-500">لا توجد عقارات بعد</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map(property => {
                const totalApts = property.apartments.length
                const completed = property.apartments.filter(a => getApartmentStatus(a.stages) === 'COMPLETED').length
                const inProgress = property.apartments.filter(a => getApartmentStatus(a.stages) === 'IN_PROGRESS').length
                const notStarted = property.apartments.filter(a => getApartmentStatus(a.stages) === 'PENDING').length

                return (
                  <Card
                    key={property.id}
                    className="hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => navigateToProperty(property)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2.5 rounded-lg group-hover:bg-blue-100 transition-colors">
                          <Building2 className="text-blue-700" size={22} />
                        </div>
                        <div>
                          <CardTitle className="text-base font-bold text-gray-900">{property.name}</CardTitle>
                          <p className="text-xs text-gray-500 mt-0.5">{property.location}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-gray-600">{totalApts} شقة</span>
                        <span className="text-gray-400 flex items-center gap-1">
                          التفاصيل
                          <ArrowLeft size={14} />
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-emerald-50 rounded-lg p-2 text-center">
                          <p className="font-bold text-emerald-700">{completed}</p>
                          <p className="text-emerald-600">مكتمل</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-2 text-center">
                          <p className="font-bold text-amber-700">{inProgress}</p>
                          <p className="text-amber-600">قيد التنفيذ</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-2 text-center">
                          <p className="font-bold text-red-700">{notStarted}</p>
                          <p className="text-red-600">لم يبدأ</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </main>
      </div>
    )
  }

  // ============ Property View ============
  if (view === 'property' && selectedProperty) {
    const totalApts = selectedProperty.apartments.length
    const completed = selectedProperty.apartments.filter(a => getApartmentStatus(a.stages) === 'COMPLETED').length
    const inProgress = selectedProperty.apartments.filter(a => getApartmentStatus(a.stages) === 'IN_PROGRESS').length
    const notStarted = selectedProperty.apartments.filter(a => getApartmentStatus(a.stages) === 'PENDING').length

    // Most remaining stages analysis
    const stageCounts: Record<string, number> = {}
    for (const apt of selectedProperty.apartments) {
      for (const stage of apt.stages) {
        if (stage.status !== 'COMPLETED') {
          stageCounts[stage.name] = (stageCounts[stage.name] || 0) + 1
        }
      }
    }
    const topRemaining = Object.entries(stageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={navigateToDashboard} className="text-gray-600 hover:text-gray-900">
              <ArrowRight size={20} />
            </Button>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Building2 className="text-blue-700" size={22} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{selectedProperty.name}</h1>
                <p className="text-xs text-gray-500">{selectedProperty.location}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6">
          {/* Property Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <span className="text-2xl font-bold text-gray-900">{totalApts}</span>
                <p className="text-xs text-gray-500">إجمالي الشقق</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <span className="text-2xl font-bold text-emerald-700">{completed}</span>
                <p className="text-xs text-gray-500">مكتمل بالكامل</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <span className="text-2xl font-bold text-amber-600">{inProgress}</span>
                <p className="text-xs text-gray-500">قيد التنفيذ</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <span className="text-2xl font-bold text-red-600">{notStarted}</span>
                <p className="text-xs text-gray-500">لم يبدأ</p>
              </CardContent>
            </Card>
          </div>

          {/* Most Remaining Stages */}
          {topRemaining.length > 0 && (
            <Card className="mb-6 border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-bold text-amber-800 flex items-center gap-2">
                  <Clock size={16} />
                  أكثر الأعمال المتبقية
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex flex-wrap gap-2">
                  {topRemaining.map(([name, count]) => (
                    <span key={name} className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">
                      {name} ({count} شقة)
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Apartments Grid */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">الشقق</h2>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><StatusDot status="COMPLETED" /> مكتمل</span>
              <span className="flex items-center gap-1"><StatusDot status="IN_PROGRESS" /> قيد التنفيذ</span>
              <span className="flex items-center gap-1"><StatusDot status="PENDING" /> غير مكتمل</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {selectedProperty.apartments.map(apartment => {
              const status = getApartmentStatus(apartment.stages)
              const remaining = getRemainingStages(apartment.stages).length

              const cardStyles = {
                COMPLETED: 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-300',
                IN_PROGRESS: 'border-amber-200 bg-amber-50/50 hover:border-amber-300',
                PENDING: 'border-red-200 bg-red-50/50 hover:border-red-300',
              }

              return (
                <Card
                  key={apartment.id}
                  className={`cursor-pointer hover:shadow-md transition-all ${cardStyles[status]}`}
                  onClick={() => navigateToApartment(apartment, selectedProperty)}
                >
                  <CardContent className="p-3 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <StatusDot status={status} />
                    </div>
                    <p className="font-bold text-gray-900 text-sm">شقة {apartment.number}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {status === 'COMPLETED' ? 'مكتمل' : `متبقي ${remaining} مرحلة`}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </main>
      </div>
    )
  }

  // ============ Apartment View ============
  if (view === 'apartment' && selectedApartment) {
    const { property, stages } = selectedApartment
    const remaining = getRemainingStages(stages)
    const status = getApartmentStatus(stages)

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigateToProperty(property)} className="text-gray-600 hover:text-gray-900">
              <ArrowRight size={20} />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Home className="text-gray-500" size={18} />
                <h1 className="text-lg font-bold text-gray-900">شقة {selectedApartment.number}</h1>
                <StatusBadge status={status} />
              </div>
              <p className="text-xs text-gray-500">{property.name} - {property.location}</p>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-6">
          {/* Remaining Summary */}
          {remaining.length > 0 && (
            <Card className="mb-6 border-red-200 bg-red-50/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-bold text-red-800 flex items-center gap-2">
                  <CircleX size={16} />
                  المراحل المتبقية ({remaining.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="flex flex-wrap gap-2">
                  {remaining.map(s => (
                    <span key={s.id} className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                      <StatusDot status={s.status} />
                      {s.name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stages List - READ ONLY */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-gray-700">مراحل العمل</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {stages.map(stage => (
                  <div
                    key={stage.id}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-right"
                  >
                    <div className="flex items-center gap-3">
                      <StatusIcon status={stage.status} />
                      <span className={`text-sm ${stage.status === 'COMPLETED' ? 'text-gray-400 line-through' : 'text-gray-800 font-medium'}`}>
                        {stage.name}
                      </span>
                    </div>
                    <StatusBadge status={stage.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return null
}