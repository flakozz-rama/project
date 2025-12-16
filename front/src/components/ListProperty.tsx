import { useState } from "react";
import {
  Home, MapPin, DollarSign, Image as ImageIcon, Upload, X, Plus,
  Wifi, Tv, Car, Coffee, Wind, Waves, Dumbbell, Shield, Users,
  Bed, Bath, Square, Check, ChevronRight, ChevronLeft, Info
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Separator } from "./ui/separator";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../context/LanguageContext";

interface ListPropertyProps {
  onBack?: () => void;
  onNavigateToMyProperties?: () => void;
}

interface PropertyFormData {
  // Basic Info
  title: string;
  description: string;
  propertyType: string;
  
  // Location
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Details
  bedrooms: string;
  bathrooms: string;
  guests: string;
  beds: string;
  squareFeet: string;
  
  // Pricing
  pricePerNight: string;
  cleaningFee: string;
  securityDeposit: string;
  
  // Amenities
  amenities: string[];
  
  // Rules
  checkInTime: string;
  checkOutTime: string;
  minimumStay: string;
  maximumStay: string;
  cancellationPolicy: string;
  houseRules: string;
  
  // Photos
  photos: string[];
}

export function ListProperty({ onBack, onNavigateToMyProperties }: ListPropertyProps) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    propertyType: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    bedrooms: "",
    bathrooms: "",
    guests: "",
    beds: "",
    squareFeet: "",
    pricePerNight: "",
    cleaningFee: "",
    securityDeposit: "",
    amenities: [],
    checkInTime: "",
    checkOutTime: "",
    minimumStay: "1",
    maximumStay: "",
    cancellationPolicy: "",
    houseRules: "",
    photos: []
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalSteps = 5;

  const amenitiesList = [
    { id: "wifi", label: t("listProperty.wifi"), icon: <Wifi className="h-4 w-4" /> },
    { id: "tv", label: t("listProperty.tv"), icon: <Tv className="h-4 w-4" /> },
    { id: "parking", label: t("listProperty.freeParking"), icon: <Car className="h-4 w-4" /> },
    { id: "kitchen", label: t("listProperty.kitchen"), icon: <Coffee className="h-4 w-4" /> },
    { id: "ac", label: t("listProperty.airConditioning"), icon: <Wind className="h-4 w-4" /> },
    { id: "pool", label: t("listProperty.pool"), icon: <Waves className="h-4 w-4" /> },
    { id: "gym", label: t("listProperty.gym"), icon: <Dumbbell className="h-4 w-4" /> },
    { id: "security", label: t("listProperty.securitySystem"), icon: <Shield className="h-4 w-4" /> },
  ];

  const propertyTypes = [
    { value: "apartment", label: t("listProperty.apartment") },
    { value: "house", label: t("listProperty.house") },
    { value: "condo", label: t("listProperty.condo") },
    { value: "villa", label: t("listProperty.villa") },
    { value: "studio", label: t("listProperty.studioType") },
    { value: "loft", label: t("listProperty.loft") },
    { value: "townhouse", label: t("listProperty.townhouse") },
    { value: "cabin", label: t("listProperty.cabin") },
  ];

  const handleInputChange = (field: keyof PropertyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAmenityToggle = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }));
  };

  const handlePhotoUpload = () => {
    // Simulate photo upload with placeholder images
    const placeholderPhotos = [
      "https://images.unsplash.com/photo-1594873604892-b599f847e859?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBpbnRlcmlvcnxlbnwxfHx8fDE3NjQ3OTIyOTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1638282504303-46f10708366b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob21lJTIwYmVkcm9vbXxlbnwxfHx8fDE3NjQ3Njg3Njl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3VzZSUyMGV4dGVyaW9yfGVufDF8fHx8MTc2NDc4MTI4MXww&ixlib=rb-4.1.0&q=80&w=1080"
    ];
    
    const randomPhoto = placeholderPhotos[Math.floor(Math.random() * placeholderPhotos.length)];
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, randomPhoto]
    }));
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    // Here you would send data to backend
    console.log("Property listing submitted:", formData);
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.propertyType && !!formData.title && !!formData.description;
      case 2:
        return !!formData.address && !!formData.city && !!formData.country;
      case 3:
        return !!formData.bedrooms && !!formData.bathrooms && !!formData.guests;
      case 4:
        return !!formData.pricePerNight;
      case 5:
        return formData.photos.length > 0;
      default:
        return false;
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4 md:px-6 py-8">
          {onBack && (
            <Button variant="ghost" onClick={onBack} className="mb-6">
              ← {t("listProperty.backToHome")}
            </Button>
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto text-center py-12"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-slate-900 mb-4">{t("listProperty.successTitle")}</h1>
            <p className="text-slate-600 mb-8 text-lg">
              {t("listProperty.successMessage")}
            </p>

            <Card className="text-left mb-8">
              <CardHeader>
                <CardTitle>{t("listProperty.whatsNext")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    1
                  </div>
                  <div>
                    <h4 className="text-slate-900 mb-1">{t("listProperty.reviewProcess")}</h4>
                    <p className="text-slate-600 text-sm">
                      {t("listProperty.reviewProcessDesc")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    2
                  </div>
                  <div>
                    <h4 className="text-slate-900 mb-1">{t("listProperty.approvalGoLive")}</h4>
                    <p className="text-slate-600 text-sm">
                      {t("listProperty.approvalGoLiveDesc")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    3
                  </div>
                  <div>
                    <h4 className="text-slate-900 mb-1">{t("listProperty.startReceivingBookings")}</h4>
                    <p className="text-slate-600 text-sm">
                      {t("listProperty.startReceivingBookingsDesc")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={onBack}>
                {t("listProperty.backToHome")}
              </Button>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-cyan-500"
                onClick={() => setIsSubmitted(false)}
              >
                {t("listProperty.listAnotherProperty")}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Back Button */}
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-6">
            ← {t("listProperty.backToHome")}
          </Button>
        )}

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-slate-900 mb-2">{t("listProperty.title")}</h1>
              <p className="text-slate-600">
                {t("listProperty.subtitle")}
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={onNavigateToMyProperties}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              {t("listProperty.myProperties")}
            </Button>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      step < currentStep
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                        : step === currentStep
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white ring-4 ring-blue-200"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {step < currentStep ? <Check className="h-5 w-5" /> : step}
                  </div>
                  <span className={`text-xs mt-2 ${step === currentStep ? "text-slate-900" : "text-slate-500"}`}>
                    {step === 1 && t("listProperty.basicInfo")}
                    {step === 2 && t("listProperty.location")}
                    {step === 3 && t("listProperty.details")}
                    {step === 4 && t("listProperty.pricing")}
                    {step === 5 && t("listProperty.photos")}
                  </span>
                </div>
                {step < totalSteps && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      step < currentStep ? "bg-gradient-to-r from-blue-600 to-cyan-500" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <Card>
            <CardContent className="p-8">
              <AnimatePresence mode="wait">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-slate-900 mb-2">{t("listProperty.basicInfoTitle")}</h2>
                      <p className="text-slate-600">
                        {t("listProperty.basicInfoSubtitle")}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="propertyType">{t("listProperty.propertyType")}</Label>
                      <Select value={formData.propertyType} onValueChange={(value) => handleInputChange("propertyType", value)}>
                        <SelectTrigger id="propertyType" className="mt-2">
                          <SelectValue placeholder={t("listProperty.selectPropertyType")} />
                        </SelectTrigger>
                        <SelectContent>
                          {propertyTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="title">{t("listProperty.propertyTitle")}</Label>
                      <Input
                        id="title"
                        type="text"
                        placeholder={t("listProperty.propertyTitlePlaceholder")}
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">{t("listProperty.description")}</Label>
                      <Textarea
                        id="description"
                        placeholder={t("listProperty.descriptionPlaceholder")}
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        rows={6}
                        className="mt-2"
                      />
                      <p className="text-sm text-slate-500 mt-2">
                        {formData.description.length} {t("listProperty.characters")}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Location */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-slate-900 mb-2">{t("listProperty.locationTitle")}</h2>
                      <p className="text-slate-600">
                        {t("listProperty.locationSubtitle")}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="address">{t("listProperty.streetAddress")}</Label>
                      <Input
                        id="address"
                        type="text"
                        placeholder={t("listProperty.streetAddressPlaceholder")}
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="city">{t("listProperty.city")}</Label>
                        <Input
                          id="city"
                          type="text"
                          placeholder={t("listProperty.cityPlaceholder")}
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="state">{t("listProperty.state")}</Label>
                        <Input
                          id="state"
                          type="text"
                          placeholder={t("listProperty.statePlaceholder")}
                          value={formData.state}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="zipCode">{t("listProperty.zipCode")}</Label>
                        <Input
                          id="zipCode"
                          type="text"
                          placeholder={t("listProperty.zipCodePlaceholder")}
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange("zipCode", e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="country">{t("listProperty.country")}</Label>
                        <Input
                          id="country"
                          type="text"
                          placeholder={t("listProperty.countryPlaceholder")}
                          value={formData.country}
                          onChange={(e) => handleInputChange("country", e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        {t("listProperty.addressPrivacyNote")}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {/* Step 3: Property Details */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-slate-900 mb-2">{t("listProperty.detailsTitle")}</h2>
                      <p className="text-slate-600">
                        {t("listProperty.detailsSubtitle")}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="bedrooms">{t("listProperty.bedrooms")}</Label>
                        <Select value={formData.bedrooms} onValueChange={(value) => handleInputChange("bedrooms", value)}>
                          <SelectTrigger id="bedrooms" className="mt-2">
                            <SelectValue placeholder={t("listProperty.select")} />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num === 0 ? t("listProperty.studio") : `${num} ${num > 1 ? t("listProperty.bedroomPlural") : t("listProperty.bedroom")}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="bathrooms">{t("listProperty.bathrooms")}</Label>
                        <Select value={formData.bathrooms} onValueChange={(value) => handleInputChange("bathrooms", value)}>
                          <SelectTrigger id="bathrooms" className="mt-2">
                            <SelectValue placeholder={t("listProperty.select")} />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num > 1 ? t("listProperty.bathroomPlural") : t("listProperty.bathroom")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="guests">{t("listProperty.maxGuests")}</Label>
                        <Select value={formData.guests} onValueChange={(value) => handleInputChange("guests", value)}>
                          <SelectTrigger id="guests" className="mt-2">
                            <SelectValue placeholder={t("listProperty.select")} />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num > 1 ? t("listProperty.guestPlural") : t("listProperty.guest")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="beds">{t("listProperty.beds")}</Label>
                        <Select value={formData.beds} onValueChange={(value) => handleInputChange("beds", value)}>
                          <SelectTrigger id="beds" className="mt-2">
                            <SelectValue placeholder={t("listProperty.select")} />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num > 1 ? t("listProperty.bedPlural") : t("listProperty.bed")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="squareFeet">{t("listProperty.squareFeet")}</Label>
                      <Input
                        id="squareFeet"
                        type="number"
                        placeholder={t("listProperty.squareFeetPlaceholder")}
                        value={formData.squareFeet}
                        onChange={(e) => handleInputChange("squareFeet", e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-slate-900 mb-4">{t("listProperty.amenities")}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {amenitiesList.map((amenity) => (
                          <div
                            key={amenity.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              formData.amenities.includes(amenity.id)
                                ? "border-blue-600 bg-blue-50"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                            onClick={() => handleAmenityToggle(amenity.id)}
                          >
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={formData.amenities.includes(amenity.id)}
                                onCheckedChange={() => handleAmenityToggle(amenity.id)}
                              />
                              {amenity.icon}
                              <span className="text-sm text-slate-700">{amenity.label}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Pricing & Rules */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-slate-900 mb-2">{t("listProperty.pricingTitle")}</h2>
                      <p className="text-slate-600">
                        {t("listProperty.pricingSubtitle")}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="pricePerNight">{t("listProperty.pricePerNight")}</Label>
                        <div className="relative mt-2">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="pricePerNight"
                            type="number"
                            placeholder={t("listProperty.pricePerNightPlaceholder")}
                            value={formData.pricePerNight}
                            onChange={(e) => handleInputChange("pricePerNight", e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="cleaningFee">{t("listProperty.cleaningFee")}</Label>
                        <div className="relative mt-2">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="cleaningFee"
                            type="number"
                            placeholder={t("listProperty.cleaningFeePlaceholder")}
                            value={formData.cleaningFee}
                            onChange={(e) => handleInputChange("cleaningFee", e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="securityDeposit">{t("listProperty.securityDeposit")}</Label>
                        <div className="relative mt-2">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="securityDeposit"
                            type="number"
                            placeholder={t("listProperty.securityDepositPlaceholder")}
                            value={formData.securityDeposit}
                            onChange={(e) => handleInputChange("securityDeposit", e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="checkInTime">{t("listProperty.checkInTime")}</Label>
                        <Input
                          id="checkInTime"
                          type="time"
                          value={formData.checkInTime}
                          onChange={(e) => handleInputChange("checkInTime", e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="checkOutTime">{t("listProperty.checkOutTime")}</Label>
                        <Input
                          id="checkOutTime"
                          type="time"
                          value={formData.checkOutTime}
                          onChange={(e) => handleInputChange("checkOutTime", e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="minimumStay">{t("listProperty.minimumStay")}</Label>
                        <Input
                          id="minimumStay"
                          type="number"
                          placeholder={t("listProperty.minimumStayPlaceholder")}
                          value={formData.minimumStay}
                          onChange={(e) => handleInputChange("minimumStay", e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="maximumStay">{t("listProperty.maximumStay")}</Label>
                        <Input
                          id="maximumStay"
                          type="number"
                          placeholder={t("listProperty.maximumStayPlaceholder")}
                          value={formData.maximumStay}
                          onChange={(e) => handleInputChange("maximumStay", e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cancellationPolicy">{t("listProperty.cancellationPolicy")}</Label>
                      <Select value={formData.cancellationPolicy} onValueChange={(value) => handleInputChange("cancellationPolicy", value)}>
                        <SelectTrigger id="cancellationPolicy" className="mt-2">
                          <SelectValue placeholder={t("listProperty.selectCancellationPolicy")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flexible">{t("listProperty.flexiblePolicy")}</SelectItem>
                          <SelectItem value="moderate">{t("listProperty.moderatePolicy")}</SelectItem>
                          <SelectItem value="strict">{t("listProperty.strictPolicy")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="houseRules">{t("listProperty.houseRules")}</Label>
                      <Textarea
                        id="houseRules"
                        placeholder={t("listProperty.houseRulesPlaceholder")}
                        value={formData.houseRules}
                        onChange={(e) => handleInputChange("houseRules", e.target.value)}
                        rows={4}
                        className="mt-2"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 5: Photos */}
                {currentStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-slate-900 mb-2">{t("listProperty.photosTitle")}</h2>
                      <p className="text-slate-600">
                        {t("listProperty.photosSubtitle")}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.photos.map((photo, index) => (
                        <div key={index} className="relative group aspect-[4/3] rounded-lg overflow-hidden">
                          <img
                            src={photo}
                            alt={`Property ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleRemovePhoto(index)}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {index === 0 && (
                            <Badge className="absolute bottom-2 left-2 bg-blue-600">
                              {t("listProperty.coverPhoto")}
                            </Badge>
                          )}
                        </div>
                      ))}

                      <button
                        onClick={handlePhotoUpload}
                        className="aspect-[4/3] border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-2"
                      >
                        <Upload className="h-8 w-8 text-slate-400" />
                        <span className="text-sm text-slate-600">{t("listProperty.uploadPhoto")}</span>
                      </button>
                    </div>

                    <Alert>
                      <ImageIcon className="h-4 w-4" />
                      <AlertDescription>
                        {t("listProperty.photoQualityNote")}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("listProperty.previous")}
                </Button>

                <div className="text-sm text-slate-600">
                  {t("listProperty.stepOf")} {currentStep} {t("listProperty.of")} {totalSteps}
                </div>

                {currentStep < totalSteps ? (
                  <Button
                    onClick={handleNext}
                    disabled={!isStepValid(currentStep)}
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 gap-2"
                  >
                    {t("listProperty.next")}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!isStepValid(currentStep)}
                    className="bg-gradient-to-r from-green-600 to-emerald-500 gap-2"
                  >
                    {t("listProperty.submitListing")}
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
