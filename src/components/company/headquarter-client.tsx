"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, MapPin, Users, Edit, Trash2, MoreHorizontal, Phone, Mail } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AddHeadquarterModal } from "@/components/company/add-headquarter-modal"
import { companyAPI, type Headquarter } from "@/lib/api/company"
import { toast } from "sonner"

export function HeadquarterClient() {
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCity, setSelectedCity] = useState<string>("all")
  const [selectedCountry, setSelectedCountry] = useState<string>("all")
  const [showAddModal, setShowAddModal] = useState(false)

  console.log("HEADQUARTERS", headquarters);

  const fetchHeadquarters = async () => {
    try {
      setLoading(true)
      const response = await companyAPI.getHeadquarters({
        keyword: searchTerm || undefined,
        city: selectedCity !== "all" ? selectedCity : undefined,
        country: selectedCountry !== "all" ? selectedCountry : undefined,
        limit: 100,
      })

      setHeadquarters(response.data)
    } catch (error) {
      console.error('Failed to fetch headquarters:', error)
      toast.error('Failed to load headquarters')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHeadquarters()
  }, [searchTerm, selectedCity, selectedCountry])

  const handleAddHeadquarter = async (headquarterData: any) => {
    try {
      await companyAPI.createHeadquarter(headquarterData)
      toast.success('Headquarter created successfully')
      setShowAddModal(false)
      fetchHeadquarters()
    } catch (error) {
      console.error('Failed to create headquarter:', error)
      toast.error('Failed to create headquarter')
    }
  }

  const handleDeleteHeadquarter = async (headquarterId: number) => {
    if (!confirm('Are you sure you want to delete this headquarter?')) {
      return
    }

    try {
      await companyAPI.deleteHeadquarter(headquarterId)
      toast.success('Headquarter deleted successfully')
      fetchHeadquarters()
    } catch (error) {
      console.error('Failed to delete headquarter:', error)
      toast.error('Failed to delete headquarter')
    }
  }

  // Get unique cities and countries for filters
  const uniqueCities = [...new Set(headquarters?.map(hq => hq.city) || [])].sort()
  const uniqueCountries = [...new Set(headquarters?.map(hq => hq.country) || [])].sort()

  const HeadquarterCard = ({ headquarter }: { headquarter: Headquarter }) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <MapPin className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{headquarter.headquarterName}</CardTitle>
              <CardDescription>{headquarter.city}, {headquarter.country}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={headquarter.isActive ? "default" : "secondary"}>
              {headquarter.isActive ? "Active" : "Inactive"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => handleDeleteHeadquarter(headquarter.headquarterId)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Address */}
          <div>
            <p className="text-sm text-muted-foreground">Address</p>
            <p className="font-medium">{headquarter.address}</p>
            {headquarter.state && (
              <p className="text-sm text-muted-foreground">{headquarter.state}</p>
            )}
            {headquarter.postalCode && (
              <p className="text-sm text-muted-foreground">Postal Code: {headquarter.postalCode}</p>
            )}
          </div>

          {/* Contact Information */}
          {(headquarter.phoneNumber || headquarter.email) && (
            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground mb-2">Contact Information</p>
              <div className="space-y-1">
                {headquarter.phoneNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{headquarter.phoneNumber}</span>
                  </div>
                )}
                {headquarter.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{headquarter.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Employee Count */}
          <div className="pt-3 border-t">
            <p className="text-sm text-muted-foreground">Employee Count</p>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="font-medium">{headquarter.employeeCount || 0}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading headquarters...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Headquarters Management</h1>
          <p className="text-muted-foreground">
            Manage your company's office locations and regional headquarters
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Headquarter
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search headquarters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {uniqueCities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All countries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            {uniqueCountries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Headquarters List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {headquarters.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No headquarters found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Get started by adding your first office location
                </p>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Headquarter
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          headquarters.map((headquarter) => (
            <HeadquarterCard key={headquarter.headquarterId} headquarter={headquarter} />
          ))
        )}
      </div>

      {/* Add Headquarter Modal */}
      <AddHeadquarterModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSubmit={handleAddHeadquarter}
      />
    </div>
  )
}
