"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  MapPin,
  Users,
  Edit,
  Trash2,
  MoreHorizontal,
  Phone,
  Mail,
  Building,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddHeadquarterModal } from "@/components/company/add-headquarter-modal";
import { EditHeadquarterModal } from "@/components/company/edit-headquarter-modal";
import {
  companyAPI,
  type Headquarter,
  type CreateHeadquarterRequest,
} from "@/lib/api/company";
import { employeeAPI } from "@/lib/api/employees";
import { toast } from "sonner";
import { Employee } from "@/components/employees/employee-table";

export function HeadquarterClient() {
  const [headquarters, setHeadquarters] = useState<Headquarter[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHeadquarter, setEditingHeadquarter] =
    useState<Headquarter | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [hqResponse, empResponse] = await Promise.all([
        companyAPI.getHeadquarters({
          keyword: searchTerm || undefined,
          city: selectedCity !== "all" ? selectedCity : undefined,
          country: selectedCountry !== "all" ? selectedCountry : undefined,
          limit: 100,
        }),
        employeeAPI.getEmployees({ limit: 1000 }),
      ]);

      setHeadquarters(hqResponse.data);
      setEmployees(empResponse.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCity, selectedCountry]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddHeadquarter = async (
    headquarterData: CreateHeadquarterRequest
  ) => {
    try {
      await companyAPI.createHeadquarter(headquarterData);
      toast.success("Headquarter created successfully");
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error("Failed to create headquarter:", error);
      toast.error("Failed to create headquarter");
    }
  };

  const handleEditHeadquarter = async (id: number, headquarterData: any) => {
    try {
      await companyAPI.updateHeadquarter(id, headquarterData);
      toast.success("Headquarter updated successfully");
      setShowEditModal(false);
      setEditingHeadquarter(null);
      fetchData();
    } catch (error) {
      console.error("Failed to update headquarter:", error);
      toast.error("Failed to update headquarter");
    }
  };

  const openEditModal = (hq: Headquarter) => {
    setEditingHeadquarter(hq);
    setShowEditModal(true);
  };

  const handleDeleteHeadquarter = async (headquarterId: number) => {
    if (!confirm("Are you sure you want to delete this headquarter?")) {
      return;
    }

    try {
      await companyAPI.deleteHeadquarter(headquarterId);
      toast.success("Headquarter deleted successfully");
      fetchData();
    } catch (error) {
      console.error("Failed to delete headquarter:", error);
      toast.error("Failed to delete headquarter");
    }
  };

  // Get unique cities and countries for filters
  const uniqueCities = useMemo(
    () => [...new Set(headquarters?.map((hq) => hq.city) || [])].sort(),
    [headquarters]
  );
  const uniqueCountries = useMemo(
    () => [...new Set(headquarters?.map((hq) => hq.country) || [])].sort(),
    [headquarters]
  );

  // Calculate stats
  const getStats = (hq: Headquarter) => {
    // Find all department IDs belonging to this HQ
    // Note: Backend response for headquarter includes 'departments' relation if mapped correctly,
    // closely check backend response type. The interface has 'departments?: Department[]'.
    // If not populated, we need to rely on fetching departments separately?
    // The backend service code showed relations: ['departments'], so it should be there.

    const deptIds = hq.departments?.map((d) => d.departmentId) || [];
    const hqEmployees = employees.filter((e) =>
      deptIds.includes(e.departmentId)
    );

    return {
      employeeCount: hqEmployees.length,
      deptCount: deptIds.length,
    };
  };

  const HeadquarterCard = ({ headquarter }: { headquarter: Headquarter }) => {
    const stats = getStats(headquarter);

    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow group">
        <CardHeader className="p-4 bg-slate-50/50 border-b pb-4">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center shadow-sm ${
                  headquarter.isMainHeadquarter
                    ? "bg-blue-600 text-white"
                    : "bg-white border text-slate-600"
                }`}
              >
                <Building className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  {headquarter.headquarterName}
                  {headquarter.isMainHeadquarter && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-5 bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200"
                    >
                      Main
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
                  <MapPin className="h-3 w-3" />
                  {headquarter.city}, {headquarter.country}
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEditModal(headquarter)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() =>
                    handleDeleteHeadquarter(headquarter.headquarterId)
                  }
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-4 space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Employees
              </div>
              <div className="font-semibold text-lg">{stats.employeeCount}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5" />
                Departments
              </div>
              <div className="font-semibold text-lg">{stats.deptCount}</div>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <span className="line-clamp-2">
                {headquarter.headquarterAddress}
              </span>
            </div>

            {(headquarter.headquarterPhone || headquarter.phoneNumber) && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span>
                  {headquarter.headquarterPhone || headquarter.phoneNumber}
                </span>
              </div>
            )}

            {(headquarter.headquarterEmail || headquarter.email) && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  {headquarter.headquarterEmail || headquarter.email}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading headquarters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Headquarters</h1>
          <p className="text-muted-foreground">
            Manage your company office locations
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Headquarter
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {uniqueCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {uniqueCountries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Headquarters List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {headquarters.length === 0 ? (
          <div className="col-span-full">
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
              <MapPin className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No headquarters found
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                Get started by adding your first office location to manage your
                distributed teams effectively.
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Headquarter
              </Button>
            </div>
          </div>
        ) : (
          headquarters.map((headquarter) => (
            <HeadquarterCard
              key={headquarter.headquarterId}
              headquarter={headquarter}
            />
          ))
        )}
      </div>

      {/* Add Headquarter Modal */}
      <AddHeadquarterModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSubmit={handleAddHeadquarter}
      />

      {/* Edit Headquarter Modal */}
      <EditHeadquarterModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSubmit={handleEditHeadquarter}
        headquarter={editingHeadquarter}
      />
    </div>
  );
}
