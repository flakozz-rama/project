import { useState } from "react";
import {
  Calendar, MapPin, Users, Star, CreditCard, Lock, Check,
  ChevronLeft, AlertCircle, Info, Home, Bed, Bath, Loader2
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Alert, AlertDescription } from "./ui/alert";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../context/LanguageContext";
import { useProperty, useCreateBooking } from "../api";

interface BookingPageProps {
  propertyId: string;
  onBack?: () => void;
  onBookingComplete?: () => void;
}

export function BookingPage({ propertyId, onBack, onBookingComplete }: BookingPageProps) {
  const { t } = useLanguage();
  const [checkInDate, setCheckInDate] = useState("2024-12-15");
  const [checkOutDate, setCheckOutDate] = useState("2024-12-22");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const { data: propertyData, isLoading } = useProperty(Number(propertyId));
  const createBooking = useCreateBooking();

  const property = {
    id: propertyId,
    title: propertyData?.title || "Loading...",
    location: propertyData?.location || "",
    image: propertyData?.image || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
    price: propertyData?.price_per_night || 0,
    cleaningFee: 50,
    serviceFee: 35,
    rating: propertyData?.rating || 0,
    reviewCount: propertyData?.reviews || 0,
    bedrooms: propertyData?.bedrooms || 0,
    bathrooms: propertyData?.bathrooms || 0,
    guests: propertyData?.guests || 0,
    host: {
      name: "Host",
      avatar: "https://i.pravatar.cc/150?img=1"
    }
  };

  const calculateNights = () => {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const nights = calculateNights();
  const subtotal = property.price * nights;
  const taxes = subtotal * 0.12; // 12% tax
  const total = subtotal + property.cleaningFee + property.serviceFee + taxes;

  const handleConfirmBooking = () => {
    // Validate form
    if (!cardNumber || !expiryDate || !cvv || !cardholderName || !agreeToTerms) {
      alert("Please fill in all required fields and agree to the terms");
      return;
    }

    createBooking.mutate(
      {
        property_id: Number(propertyId),
        start_date: checkInDate,
        end_date: checkOutDate,
        guests: adults + children,
      },
      {
        onSuccess: () => {
          setBookingConfirmed(true);
          setTimeout(() => {
            if (onBookingComplete) {
              onBookingComplete();
            }
          }, 3000);
        },
        onError: (error) => {
          alert(error.message || "Failed to create booking");
        },
      }
    );
  };

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-slate-900 mb-2">{t('bookingPage.bookingSuccess')}</h1>
            <p className="text-slate-600 mb-2">
              {t('bookingPage.bookingConfirmation')}
            </p>
            <p className="text-sm text-slate-500">
              {t('bookingPage.confirmationSent')}
            </p>
          </div>

          <Card className="text-left mb-6">
            <CardContent className="p-4">
              <div className="flex gap-3 mb-3">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-slate-900 text-sm mb-1">{property.title}</h3>
                  <p className="text-xs text-slate-600 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {property.location}
                  </p>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">{t('bookingPage.checkIn')}:</span>
                  <span className="text-slate-900">{checkInDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">{t('bookingPage.checkOut')}:</span>
                  <span className="text-slate-900">{checkOutDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">{t('bookingPage.total')}:</span>
                  <span className="text-slate-900 font-semibold">${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              {t('bookingPage.continueExploring')}
            </Button>
            <Button
              onClick={onBookingComplete}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500"
            >
              {t('bookingPage.viewMyBookings')}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Back Button */}
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-6">
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t('bookingPage.backToProperty')}
          </Button>
        )}

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-slate-900 mb-2">{t('bookingPage.title')}</h1>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    {t('bookingPage.propertyInfo')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-32 h-32 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-slate-900 mb-2">{property.title}</h3>
                      <p className="text-slate-600 text-sm flex items-center gap-1 mb-2">
                        <MapPin className="h-4 w-4" />
                        {property.location}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          {property.bedrooms} bed
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          {property.bathrooms} bath
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {property.guests} guests
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-slate-900">{property.rating}</span>
                        </div>
                        <span className="text-sm text-slate-500">
                          ({property.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Dates and Guests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {t('bookingPage.bookingDetails')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="checkIn">{t('bookingPage.checkIn')}</Label>
                      <Input
                        id="checkIn"
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="checkOut">{t('bookingPage.checkOut')}</Label>
                      <Input
                        id="checkOut"
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="mb-3 block">{t('bookingPage.guests')}</Label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-900">{t('bookingPage.adults')}</span>
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{adults}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setAdults(adults + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-900">{t('bookingPage.children')}</span>
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setChildren(Math.max(0, children - 1))}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{children}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setChildren(children + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-900">{t('bookingPage.infants')}</span>
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setInfants(Math.max(0, infants - 1))}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{infants}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setInfants(infants + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {t('bookingPage.paymentMethod')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">{t('bookingPage.cardNumber')}</Label>
                    <Input
                      id="cardNumber"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={19}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">{t('bookingPage.expiryDate')}</Label>
                      <Input
                        id="expiry"
                        type="text"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        maxLength={5}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">{t('bookingPage.cvv')}</Label>
                      <Input
                        id="cvv"
                        type="text"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        maxLength={4}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cardholderName">{t('bookingPage.cardholderName')}</Label>
                    <Input
                      id="cardholderName"
                      type="text"
                      placeholder="John Doe"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {t('bookingPage.securePayment')}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </motion.div>

            {/* Terms and Conditions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer">
                  {t('bookingPage.agreeToTerms')}
                </Label>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Price Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="sticky top-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>{t('bookingPage.priceBreakdown')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">
                        ${property.price} × {nights} {nights === 1 ? t('bookingPage.nightCount').replace('{count}', nights.toString()) : t('bookingPage.nightCountPlural').replace('{count}', nights.toString())}
                      </span>
                      <span className="text-slate-900">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{t('bookingPage.cleaningFee')}</span>
                      <span className="text-slate-900">${property.cleaningFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{t('bookingPage.serviceFee')}</span>
                      <span className="text-slate-900">${property.serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{t('bookingPage.taxes')}</span>
                      <span className="text-slate-900">${taxes.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between">
                    <span className="text-slate-900">{t('bookingPage.total')}</span>
                    <span className="text-slate-900 text-xl">${total.toFixed(2)}</span>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500"
                    size="lg"
                    onClick={handleConfirmBooking}
                    disabled={!agreeToTerms}
                  >
                    {t('bookingPage.confirmAndPay')}
                  </Button>

                  <p className="text-center text-sm text-slate-500">
                    {t('bookingPage.youWontBeCharged')}
                  </p>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {t('bookingPage.cancellationPolicy')}: Free cancellation within 24 hours
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
