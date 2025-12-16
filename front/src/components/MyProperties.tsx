import { useState } from "react";
import {
  Home, MapPin, DollarSign, Eye, Edit, Trash2, ToggleLeft, ToggleRight,
  TrendingUp, Calendar, Star, MessageSquare, Plus, Search, Filter,
  Users, Bed, Bath, Square, MoreVertical, AlertCircle
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { useLanguage } from "../context/LanguageContext";

interface MyPropertiesProps {
  onBack?: () => void;
  onNavigateToListProperty?: () => void;
  onViewPropertyDetails?: (propertyId: string) => void;
}

interface Property {
  id: string;
  title: string;
  type: string;
  location: string;
  price: number;
  image: string;
  status: "active" | "inactive" | "pending";
  bedrooms: number;
  bathrooms: number;
  guests: number;
  squareFeet: number;
  totalBookings: number;
  totalRevenue: number;
  rating: number;
  reviews: number;
  viewsThisMonth: number;
}

export function MyProperties({ onBack, onNavigateToListProperty, onViewPropertyDetails }: MyPropertiesProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "pending">("all");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  // Mock data - will be replaced with API call
  const [properties, setProperties] = useState<Property[]>([
    {
      id: "1",
      title: "Modern Downtown Apartment with City Views",
      type: "Apartment",
      location: "New York, NY",
      price: 150,
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnR8ZW58MXx8fHwxNzY0NzkyMjk0fDA&ixlib=rb-4.1.0&q=80&w=1080",
      status: "active",
      bedrooms: 2,
      bathrooms: 2,
      guests: 4,
      squareFeet: 1200,
      totalBookings: 45,
      totalRevenue: 8500,
      rating: 4.8,
      reviews: 32,
      viewsThisMonth: 256
    },
    {
      id: "2",
      title: "Luxury Beach House with Ocean View",
      type: "House",
      location: "Miami, FL",
      price: 350,
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3VzZXxlbnwxfHx8fDE3NjQ3OTIyOTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
      status: "active",
      bedrooms: 4,
      bathrooms: 3,
      guests: 8,
      squareFeet: 2800,
      totalBookings: 28,
      totalRevenue: 12400,
      rating: 4.9,
      reviews: 24,
      viewsThisMonth: 412
    },
    {
      id: "3",
      title: "Cozy Studio in Downtown Area",
      type: "Studio",
      location: "San Francisco, CA",
      price: 95,
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkaW8lMjBhcGFydG1lbnR8ZW58MXx8fHwxNzY0NzkyMjk0fDA&ixlib=rb-4.1.0&q=80&w=1080",
      status: "inactive",
      bedrooms: 0,
      bathrooms: 1,
      guests: 2,
      squareFeet: 450,
      totalBookings: 67,
      totalRevenue: 6800,
      rating: 4.7,
      reviews: 58,
      viewsThisMonth: 89
    },
    {
      id: "4",
      title: "Charming Victorian Townhouse",
      type: "Townhouse",
      location: "Boston, MA",
      price: 225,
      image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3duaG91c2V8ZW58MXx8fHwxNzY0NzkyMjk0fDA&ixlib=rb-4.1.0&q=80&w=1080",
      status: "pending",
      bedrooms: 3,
      bathrooms: 2.5,
      guests: 6,
      squareFeet: 1800,
      totalBookings: 0,
      totalRevenue: 0,
      rating: 0,
      reviews: 0,
      viewsThisMonth: 0
    }
  ]);

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || property.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalRevenue = properties.reduce((sum, p) => sum + p.totalRevenue, 0);
  const totalBookings = properties.reduce((sum, p) => sum + p.totalBookings, 0);
  const activeProperties = properties.filter(p => p.status === "active").length;
  const averageRating = properties.filter(p => p.rating > 0).reduce((sum, p, _, arr) => sum + p.rating / arr.length, 0);

  const handleToggleStatus = (propertyId: string) => {
    setProperties(properties.map(p => {
      if (p.id === propertyId && p.status !== "pending") {
        return { ...p, status: p.status === "active" ? "inactive" : "active" as "active" | "inactive" };
      }
      return p;
    }));
  };

  const handleDeleteClick = (property: Property) => {
    setPropertyToDelete(property);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (propertyToDelete) {
      setProperties(properties.filter(p => p.id !== propertyToDelete.id));
      setShowDeleteDialog(false);
      setPropertyToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            {onBack && (
              <Button variant="ghost" onClick={onBack} className="mb-4">
                ← {t("myProperties.backToHome")}
              </Button>
            )}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-slate-900 mb-2">{t("myProperties.title")}</h1>
              <p className="text-slate-600">
                {t("myProperties.subtitle")}
              </p>
            </motion.div>
          </div>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-cyan-500 gap-2"
            onClick={onNavigateToListProperty}
          >
            <Plus className="h-4 w-4" />
            {t("myProperties.addNewProperty")}
          </Button>
        </div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm mb-1">{t("myProperties.totalRevenue")}</p>
                  <h3 className="text-slate-900">${totalRevenue.toLocaleString()}</h3>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-sm text-green-600">{t("myProperties.revenueGrowth")}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm mb-1">{t("myProperties.totalBookings")}</p>
                  <h3 className="text-slate-900">{totalBookings}</h3>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <TrendingUp className="h-3 w-3 text-blue-600" />
                <span className="text-sm text-blue-600">{t("myProperties.bookingsGrowth")}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm mb-1">{t("myProperties.activeListings")}</p>
                  <h3 className="text-slate-900">{activeProperties}</h3>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                  <Home className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-3">{t("myProperties.ofTotal")} {properties.length} {t("myProperties.total")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm mb-1">{t("myProperties.averageRating")}</p>
                  <h3 className="text-slate-900">{averageRating.toFixed(1)}</h3>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                <span className="text-sm text-slate-500">{t("myProperties.excellentRating")}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder={t("myProperties.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterStatus === "all" ? "default" : "outline"}
                    onClick={() => setFilterStatus("all")}
                    className={filterStatus === "all" ? "bg-gradient-to-r from-blue-600 to-cyan-500" : ""}
                  >
                    {t("myProperties.all")} ({properties.length})
                  </Button>
                  <Button
                    variant={filterStatus === "active" ? "default" : "outline"}
                    onClick={() => setFilterStatus("active")}
                    className={filterStatus === "active" ? "bg-gradient-to-r from-green-600 to-emerald-500" : ""}
                  >
                    {t("myProperties.active")} ({properties.filter(p => p.status === "active").length})
                  </Button>
                  <Button
                    variant={filterStatus === "inactive" ? "default" : "outline"}
                    onClick={() => setFilterStatus("inactive")}
                    className={filterStatus === "inactive" ? "bg-gradient-to-r from-slate-600 to-slate-500" : ""}
                  >
                    {t("myProperties.inactive")} ({properties.filter(p => p.status === "inactive").length})
                  </Button>
                  <Button
                    variant={filterStatus === "pending" ? "default" : "outline"}
                    onClick={() => setFilterStatus("pending")}
                    className={filterStatus === "pending" ? "bg-gradient-to-r from-yellow-600 to-orange-500" : ""}
                  >
                    {t("myProperties.pending")} ({properties.filter(p => p.status === "pending").length})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Properties List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4"
        >
          {filteredProperties.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Home className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-slate-900 mb-2">{t("myProperties.noPropertiesFound")}</h3>
                <p className="text-slate-600 mb-6">
                  {searchQuery ? t("myProperties.tryAdjustingSearch") : t("myProperties.startListingFirst")}
                </p>
                {!searchQuery && (
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 gap-2"
                    onClick={onNavigateToListProperty}
                  >
                    <Plus className="h-4 w-4" />
                    {t("myProperties.listFirstProperty")}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Property Image */}
                      <div className="w-full md:w-64 h-48 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={property.image}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Property Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-slate-900">{property.title}</h3>
                              <Badge
                                className={
                                  property.status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : property.status === "inactive"
                                    ? "bg-slate-100 text-slate-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }
                              >
                                {property.status === "active" && t("myProperties.activeStatus")}
                                {property.status === "inactive" && t("myProperties.inactiveStatus")}
                                {property.status === "pending" && t("myProperties.pendingStatus")}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {property.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Home className="h-4 w-4" />
                                {property.type}
                              </span>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onViewPropertyDetails?.(property.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                {t("myProperties.viewListing")}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                {t("myProperties.editProperty")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(property.id)}>
                                {property.status === "active" ? (
                                  <>
                                    <ToggleLeft className="h-4 w-4 mr-2" />
                                    {t("myProperties.deactivate")}
                                  </>
                                ) : property.status === "inactive" ? (
                                  <>
                                    <ToggleRight className="h-4 w-4 mr-2" />
                                    {t("myProperties.activate")}
                                  </>
                                ) : null}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteClick(property)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t("myProperties.delete")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Property Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Bed className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600">
                              {property.bedrooms === 0 ? t("listProperty.studio") : `${property.bedrooms} ${t("myProperties.bed")}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Bath className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600">{property.bathrooms} {t("myProperties.bath")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600">{property.guests} {t("myProperties.guests")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Square className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600">{property.squareFeet} {t("myProperties.sqft")}</span>
                          </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="flex flex-wrap items-center gap-6 text-sm">
                          <div>
                            <span className="text-slate-600">{t("myProperties.price")}: </span>
                            <span className="text-slate-900">${property.price}{t("myProperties.perNight")}</span>
                          </div>
                          {property.status !== "pending" && (
                            <>
                              <div>
                                <span className="text-slate-600">{t("myProperties.revenue")}: </span>
                                <span className="text-green-600">${property.totalRevenue.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-slate-600">{t("myProperties.bookings")}: </span>
                                <span className="text-slate-900">{property.totalBookings}</span>
                              </div>
                              {property.rating > 0 && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                  <span className="text-slate-900">{property.rating}</span>
                                  <span className="text-slate-600">({property.reviews} {t("myProperties.reviews")})</span>
                                </div>
                              )}
                              <div>
                                <span className="text-slate-600">{t("myProperties.views")}: </span>
                                <span className="text-slate-900">{property.viewsThisMonth} {t("myProperties.thisMonth")}</span>
                              </div>
                            </>
                          )}
                          {property.status === "pending" && (
                            <Alert className="mt-2">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>
                                {t("myProperties.pendingReviewAlert")}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("myProperties.deletePropertyTitle")}</DialogTitle>
            <DialogDescription>
              {t("myProperties.deletePropertyMessage")} "{propertyToDelete?.title}"? {t("myProperties.actionCannotBeUndone")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {t("myProperties.cancel")}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {t("myProperties.deleteProperty")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
