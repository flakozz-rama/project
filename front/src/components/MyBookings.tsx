import { useState } from "react";
import {
  Calendar, MapPin, Users, Clock, CheckCircle, XCircle,
  AlertCircle, Star, MessageSquare, Download, Phone, Mail,
  Home, ArrowRight, Edit, Trash2, Eye, Loader2
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../context/LanguageContext";
import { useBookings, useProperties } from "../api";

interface MyBookingsProps {
  onBack?: () => void;
  onNavigateToMessages?: () => void;
}

interface Booking {
  id: number;
  bookingCode: string;
  property: string;
  location: string;
  image: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  pricePerNight: number;
  totalPrice: number;
  status: "upcoming" | "confirmed" | "pending" | "completed" | "cancelled";
  host: {
    name: string;
    phone: string;
    email: string;
  };
  amenities: string[];
  bedrooms: number;
  bathrooms: number;
  hasReview?: boolean;
}

export function MyBookings({ onBack, onNavigateToMessages }: MyBookingsProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const { data: bookingsData, isLoading, error } = useBookings();
  const { data: propertiesData } = useProperties();

  const calculateNights = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const bookings: Booking[] = (bookingsData || []).map((b) => {
    const property = propertiesData?.find((p) => p.id === b.property_id);
    const nights = calculateNights(b.start_date, b.end_date);
    return {
      id: b.id,
      bookingCode: `GR-${b.id}`,
      property: property?.title || "Property",
      location: property?.location || "Location",
      image: property?.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
      checkIn: b.start_date,
      checkOut: b.end_date,
      guests: b.guests,
      nights,
      pricePerNight: property?.price || 0,
      totalPrice: (property?.price || 0) * nights,
      status: b.status as Booking["status"],
      host: {
        name: "Host",
        phone: "+1 (555) 000-0000",
        email: "host@example.com",
      },
      amenities: property?.amenities || [],
      bedrooms: property?.bedrooms || 0,
      bathrooms: property?.bathrooms || 0,
      hasReview: false,
    };
  });

  const getFilteredBookings = () => {
    switch (activeTab) {
      case "upcoming":
        return bookings.filter(b => b.status === "upcoming" || b.status === "confirmed");
      case "pending":
        return bookings.filter(b => b.status === "pending");
      case "completed":
        return bookings.filter(b => b.status === "completed");
      case "cancelled":
        return bookings.filter(b => b.status === "cancelled");
      default:
        return bookings;
    }
  };

  const filteredBookings = getFilteredBookings();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "confirmed":
      case "upcoming":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          className: "bg-green-100 text-green-700",
          label: t("myBookings.confirmed")
        };
      case "pending":
        return {
          icon: <Clock className="h-4 w-4" />,
          className: "bg-yellow-100 text-yellow-700",
          label: t("myBookings.pending")
        };
      case "completed":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          className: "bg-blue-100 text-blue-700",
          label: t("myBookings.completed")
        };
      case "cancelled":
        return {
          icon: <XCircle className="h-4 w-4" />,
          className: "bg-red-100 text-red-700",
          label: t("myBookings.cancelled")
        };
      default:
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          className: "bg-slate-100 text-slate-700",
          label: status
        };
    }
  };

  const handleCancelBooking = () => {
    // Handle booking cancellation
    setShowCancelDialog(false);
    setSelectedBooking(null);
  };

  const handleSubmitReview = () => {
    // Handle review submission
    setShowReviewDialog(false);
    setSelectedBooking(null);
    setReviewText("");
    setReviewRating(5);
  };

  const calculateDaysUntil = (checkIn: string) => {
    const today = new Date();
    const checkInDate = new Date(checkIn);
    const diffTime = checkInDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const bookingStats = {
    total: bookings.length,
    upcoming: bookings.filter(b => b.status === "upcoming" || b.status === "confirmed").length,
    pending: bookings.filter(b => b.status === "pending").length,
    completed: bookings.filter(b => b.status === "completed").length
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Back Button */}
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-6">
            ← {t("myBookings.backToHome")}
          </Button>
        )}

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-slate-900 mb-2">{t("myBookings.title")}</h1>
          <p className="text-slate-600">
            {t("myBookings.subtitle")}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-blue-600 mb-2">{bookingStats.total}</div>
                <p className="text-slate-600 text-sm">{t("myBookings.totalBookings")}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-green-600 mb-2">{bookingStats.upcoming}</div>
                <p className="text-slate-600 text-sm">{t("myBookings.upcoming")}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-yellow-600 mb-2">{bookingStats.pending}</div>
                <p className="text-slate-600 text-sm">{t("myBookings.pending")}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-purple-600 mb-2">{bookingStats.completed}</div>
                <p className="text-slate-600 text-sm">{t("myBookings.completed")}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600">Failed to load bookings</p>
          </div>
        ) : (
        /* Bookings Tabs */
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="all">
              {t("myBookings.all")}
              <Badge variant="secondary" className="ml-2">
                {bookingStats.total}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              {t("myBookings.upcoming")}
              {bookingStats.upcoming > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {bookingStats.upcoming}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending">
              {t("myBookings.pending")}
              {bookingStats.pending > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {bookingStats.pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">{t("myBookings.completed")}</TabsTrigger>
            <TabsTrigger value="cancelled">{t("myBookings.cancelled")}</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking, index) => {
                  const statusConfig = getStatusConfig(booking.status);
                  const daysUntil = calculateDaysUntil(booking.checkIn);
                  const isUpcoming = booking.status === "upcoming" || booking.status === "confirmed";

                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      layout
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="flex flex-col lg:flex-row">
                          {/* Property Image */}
                          <div className="w-full lg:w-80 h-64 lg:h-auto relative">
                            <img
                              src={booking.image}
                              alt={booking.property}
                              className="w-full h-full object-cover"
                            />
                            <Badge className={`absolute top-4 right-4 ${statusConfig.className}`}>
                              <span className="flex items-center gap-1">
                                {statusConfig.icon}
                                {statusConfig.label}
                              </span>
                            </Badge>
                          </div>

                          {/* Booking Details */}
                          <div className="flex-1 p-6">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="text-slate-900 mb-1">{booking.property}</h3>
                                    <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
                                      <MapPin className="h-4 w-4" />
                                      <span>{booking.location}</span>
                                    </div>
                                    <p className="text-slate-600 text-sm">
                                      {t("myBookings.bookingCode")}: <span className="text-slate-900">{booking.bookingCode}</span>
                                    </p>
                                  </div>
                                </div>

                                {isUpcoming && daysUntil > 0 && daysUntil <= 30 && (
                                  <Alert className="mb-4">
                                    <Clock className="h-4 w-4" />
                                    <AlertDescription>
                                      {t("myBookings.checkInIn")} {daysUntil} {daysUntil === 1 ? t("myBookings.day") : t("myBookings.days")}
                                    </AlertDescription>
                                  </Alert>
                                )}

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                  <div>
                                    <p className="text-slate-600 text-sm mb-1">{t("myBookings.checkIn")}</p>
                                    <p className="text-slate-900">{formatDate(booking.checkIn)}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-600 text-sm mb-1">{t("myBookings.checkOut")}</p>
                                    <p className="text-slate-900">{formatDate(booking.checkOut)}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-600 text-sm mb-1">{t("myBookings.guests")}</p>
                                    <p className="text-slate-900 flex items-center gap-1">
                                      <Users className="h-4 w-4" />
                                      {booking.guests}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-slate-600 text-sm mb-1">{t("myBookings.nights")}</p>
                                    <p className="text-slate-900">{booking.nights}</p>
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                  <span className="text-slate-600 text-sm">
                                    {booking.bedrooms} {t("myBookings.bed")} • {booking.bathrooms} {t("myBookings.bath")}
                                  </span>
                                  <span className="text-slate-400">•</span>
                                  {booking.amenities.slice(0, 3).map((amenity, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {amenity}
                                    </Badge>
                                  ))}
                                  {booking.amenities.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{booking.amenities.length - 3} {t("myBookings.more")}
                                    </Badge>
                                  )}
                                </div>

                                <Separator className="my-4" />

                                {/* Host Contact */}
                                <div className="mb-4">
                                  <p className="text-slate-600 text-sm mb-2">{t("myBookings.hostContact")}</p>
                                  <div className="flex flex-col gap-1 text-sm">
                                    <span className="text-slate-900">{booking.host.name}</span>
                                    <div className="flex items-center gap-2 text-slate-600">
                                      <Phone className="h-3 w-3" />
                                      <span>{booking.host.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                      <Mail className="h-3 w-3" />
                                      <span>{booking.host.email}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Price and Actions */}
                              <div className="md:ml-6 md:text-right">
                                <div className="mb-4">
                                  <p className="text-slate-600 text-sm mb-1">{t("myBookings.totalPrice")}</p>
                                  <p className="text-slate-900">${booking.totalPrice}</p>
                                  <p className="text-slate-600 text-sm">
                                    ${booking.pricePerNight}{t("myBookings.perNight")}
                                  </p>
                                </div>

                                <div className="flex flex-col gap-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm" className="gap-2">
                                        <Eye className="h-4 w-4" />
                                        {t("myBookings.viewDetails")}
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle>{booking.property}</DialogTitle>
                                        <DialogDescription>
                                          {t("myBookings.bookingDetails")}
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <img
                                          src={booking.image}
                                          alt={booking.property}
                                          className="w-full h-64 object-cover rounded-lg"
                                        />
                                        <div>
                                          <h4 className="text-slate-900 mb-2">{t("myBookings.bookingInformation")}</h4>
                                          <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                              <p className="text-slate-600">{t("myBookings.bookingCode")}</p>
                                              <p className="text-slate-900">{booking.bookingCode}</p>
                                            </div>
                                            <div>
                                              <p className="text-slate-600">{t("myBookings.status")}</p>
                                              <Badge className={statusConfig.className}>
                                                {statusConfig.label}
                                              </Badge>
                                            </div>
                                            <div>
                                              <p className="text-slate-600">{t("myBookings.checkIn")}</p>
                                              <p className="text-slate-900">{formatDate(booking.checkIn)}</p>
                                            </div>
                                            <div>
                                              <p className="text-slate-600">{t("myBookings.checkOut")}</p>
                                              <p className="text-slate-900">{formatDate(booking.checkOut)}</p>
                                            </div>
                                            <div>
                                              <p className="text-slate-600">{t("myBookings.guests")}</p>
                                              <p className="text-slate-900">{booking.guests}</p>
                                            </div>
                                            <div>
                                              <p className="text-slate-600">{t("myBookings.totalPrice")}</p>
                                              <p className="text-slate-900">${booking.totalPrice}</p>
                                            </div>
                                          </div>
                                        </div>
                                        <Separator />
                                        <div>
                                          <h4 className="text-slate-900 mb-2">{t("myBookings.hostInformation")}</h4>
                                          <div className="space-y-2 text-sm">
                                            <p className="text-slate-900">{booking.host.name}</p>
                                            <p className="text-slate-600">{booking.host.phone}</p>
                                            <p className="text-slate-600">{booking.host.email}</p>
                                          </div>
                                        </div>
                                        <Separator />
                                        <div>
                                          <h4 className="text-slate-900 mb-2">{t("myBookings.propertyAmenities")}</h4>
                                          <div className="flex flex-wrap gap-2">
                                            {booking.amenities.map((amenity, i) => (
                                              <Badge key={i} variant="secondary">
                                                {amenity}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>

                                  {(booking.status === "confirmed" || booking.status === "upcoming") && (
                                    <>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="gap-2"
                                        onClick={onNavigateToMessages}
                                      >
                                        <MessageSquare className="h-4 w-4" />
                                        {t("myBookings.contactHost")}
                                      </Button>
                                    </>
                                  )}

                                  {booking.status === "completed" && !booking.hasReview && (
                                    <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                                      <DialogTrigger asChild>
                                        <Button
                                          size="sm"
                                          className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-500"
                                          onClick={() => setSelectedBooking(booking)}
                                        >
                                          <Star className="h-4 w-4" />
                                          {t("myBookings.leaveReview")}
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>{t("myBookings.leaveReviewTitle")}</DialogTitle>
                                          <DialogDescription>
                                            {t("myBookings.shareExperience")} {selectedBooking?.property}
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div>
                                            <Label>{t("myBookings.rating")}</Label>
                                            <div className="flex gap-2 mt-2">
                                              {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                  key={star}
                                                  onClick={() => setReviewRating(star)}
                                                  className="transition-transform hover:scale-110"
                                                >
                                                  <Star
                                                    className={`h-8 w-8 ${
                                                      star <= reviewRating
                                                        ? "fill-yellow-500 text-yellow-500"
                                                        : "text-slate-300"
                                                    }`}
                                                  />
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                          <div>
                                            <Label htmlFor="review">{t("myBookings.yourReview")}</Label>
                                            <Textarea
                                              id="review"
                                              placeholder={t("myBookings.reviewPlaceholder")}
                                              value={reviewText}
                                              onChange={(e) => setReviewText(e.target.value)}
                                              rows={5}
                                              className="mt-2"
                                            />
                                          </div>
                                        </div>
                                        <DialogFooter>
                                          <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                                            {t("myBookings.cancel")}
                                          </Button>
                                          <Button
                                            className="bg-gradient-to-r from-blue-600 to-cyan-500"
                                            onClick={handleSubmitReview}
                                          >
                                            {t("myBookings.submitReview")}
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  )}

                                  {booking.status === "completed" && (
                                    <Button variant="outline" size="sm" className="gap-2">
                                      <Download className="h-4 w-4" />
                                      {t("myBookings.downloadInvoice")}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div className="text-slate-400 mb-4">
                    <Calendar className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-slate-900 mb-2">{t("myBookings.noBookingsFound")}</h3>
                  <p className="text-slate-600 mb-6">
                    {t("myBookings.noBookingsDesc")} {activeTab !== "all" ? activeTab : ""} {t("myBookings.bookingsYet")}.
                  </p>
                  {onBack && (
                    <Button onClick={onBack} className="bg-gradient-to-r from-blue-600 to-cyan-500">
                      {t("myBookings.browseProperties")}
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
        )}
      </div>
    </div>
  );
}
