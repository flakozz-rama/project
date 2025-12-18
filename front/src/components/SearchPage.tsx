import { useState } from "react";
import {
  Search, SlidersHorizontal, MapPin, Calendar, Users, Star,
  Wifi, Car, Wind, Waves, Trees, Coffee, Dumbbell, X, ChevronDown, Loader2
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Checkbox } from "./ui/checkbox";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../context/LanguageContext";
import { useProperties } from "../api";

interface SearchPageProps {
  onBack?: () => void;
  onViewProperty?: (propertyId: string) => void;
}

export function SearchPage({ onBack, onViewProperty }: SearchPageProps) {
  const { t } = useLanguage();
  const [location, setLocation] = useState("");
  const [guests, setGuests] = useState(2);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("recommended");
  const [showFilters, setShowFilters] = useState(false);

  const { data: propertiesData, isLoading } = useProperties({ location: location || undefined });

  const propertyTypes = [
    { id: "apartment", label: t("search.apartment") },
    { id: "house", label: t("search.house") },
    { id: "villa", label: t("search.villa") },
    { id: "studio", label: t("search.studio") },
    { id: "loft", label: t("search.loft") },
    { id: "condo", label: t("search.condo") }
  ];

  const amenities = [
    { id: "wifi", label: t("search.wifi"), icon: Wifi },
    { id: "parking", label: t("search.parking"), icon: Car },
    { id: "ac", label: t("search.airConditioning"), icon: Wind },
    { id: "pool", label: t("search.pool"), icon: Waves },
    { id: "garden", label: t("search.garden"), icon: Trees },
    { id: "kitchen", label: t("search.kitchen"), icon: Coffee },
    { id: "gym", label: t("search.gym"), icon: Dumbbell }
  ];

  // Properties from API
  const properties = (propertiesData || []).map((p) => ({
    id: p.id,
    title: p.title,
    location: p.location,
    price: p.price_per_night,
    rating: p.rating,
    reviews: p.reviews,
    guests: p.guests,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    image: p.image,
    type: p.type,
    amenities: p.amenities.map((a) => a.toLowerCase()),
    featured: p.rating >= 4.8,
  }));

  // Filter properties based on selected criteria
  const filteredProperties = properties.filter(property => {
    const matchesPrice = property.price >= priceRange[0] && property.price <= priceRange[1];
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(property.type);
    const matchesGuests = property.guests >= guests;
    const matchesRating = property.rating >= minRating;
    const matchesAmenities = selectedAmenities.length === 0 || 
      selectedAmenities.every(amenity => property.amenities.includes(amenity));
    const matchesLocation = !location || 
      property.location.toLowerCase().includes(location.toLowerCase());

    return matchesPrice && matchesType && matchesGuests && matchesRating && matchesAmenities && matchesLocation;
  });

  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "reviews":
        return b.reviews - a.reviews;
      default:
        return b.featured ? 1 : -1;
    }
  });

  const togglePropertyType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setLocation("");
    setGuests(2);
    setPriceRange([0, 1000]);
    setSelectedTypes([]);
    setSelectedAmenities([]);
    setMinRating(0);
  };

  const activeFiltersCount = selectedTypes.length + selectedAmenities.length + 
    (minRating > 0 ? 1 : 0) + (location ? 1 : 0);

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Location */}
      <div className="space-y-2">
        <Label>{t("search.location")}</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder={t("search.locationPlaceholder")}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Guests */}
      <div className="space-y-2">
        <Label>{t("search.guests")}</Label>
        <div className="relative">
          <Users className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            type="number"
            min="1"
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <Label>{t("search.priceRange")}</Label>
        <div className="px-2">
          <Slider
            min={0}
            max={1000}
            step={10}
            value={priceRange}
            onValueChange={setPriceRange}
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-slate-600">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}+</span>
          </div>
        </div>
      </div>

      {/* Property Type */}
      <div className="space-y-3">
        <Label>{t("search.propertyType")}</Label>
        <div className="grid grid-cols-2 gap-2">
          {propertyTypes.map(type => (
            <Button
              key={type.id}
              variant={selectedTypes.includes(type.id) ? "default" : "outline"}
              size="sm"
              onClick={() => togglePropertyType(type.id)}
              className={selectedTypes.includes(type.id) 
                ? "bg-gradient-to-r from-blue-600 to-cyan-500" 
                : ""}
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-3">
        <Label>{t("search.amenities")}</Label>
        <div className="space-y-2">
          {amenities.map(amenity => {
            const Icon = amenity.icon;
            return (
              <div key={amenity.id} className="flex items-center space-x-2">
                <Checkbox
                  id={amenity.id}
                  checked={selectedAmenities.includes(amenity.id)}
                  onCheckedChange={() => toggleAmenity(amenity.id)}
                />
                <Label htmlFor={amenity.id} className="flex items-center gap-2 cursor-pointer">
                  <Icon className="h-4 w-4 text-slate-600" />
                  {amenity.label}
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-3">
        <Label>{t("search.minimumRating")}</Label>
        <div className="flex gap-2">
          {[0, 3, 4, 4.5].map(rating => (
            <Button
              key={rating}
              variant={minRating === rating ? "default" : "outline"}
              size="sm"
              onClick={() => setMinRating(rating)}
              className={minRating === rating 
                ? "bg-gradient-to-r from-blue-600 to-cyan-500" 
                : ""}
            >
              {rating === 0 ? t("search.any") : `${rating}+`}
              {rating > 0 && <Star className="h-3 w-3 ml-1 fill-yellow-500 text-yellow-500" />}
            </Button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          {t("search.clearAllFilters")} ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="ghost" onClick={onBack}>
                ← {t("search.back")}
              </Button>
            )}
            <div className="flex-1 flex items-center gap-4">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input
                  placeholder={t("search.searchPlaceholder")}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              
              {/* Mobile Filter Toggle */}
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2 md:hidden">
                    <SlidersHorizontal className="h-4 w-4" />
                    {t("search.filters")}
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>{t("search.filters")}</SheetTitle>
                    <SheetDescription>
                      {t("search.refineResults")}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FiltersContent />
                  </div>
                </SheetContent>
              </Sheet>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("search.sortBy")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">{t("search.recommended")}</SelectItem>
                  <SelectItem value="price-low">{t("search.priceLowToHigh")}</SelectItem>
                  <SelectItem value="price-high">{t("search.priceHighToLow")}</SelectItem>
                  <SelectItem value="rating">{t("search.highestRated")}</SelectItem>
                  <SelectItem value="reviews">{t("search.mostReviewed")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden md:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-slate-900">{t("search.filters")}</h2>
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary">{activeFiltersCount} {t("search.filtersActive")}</Badge>
                    )}
                  </div>
                  <FiltersContent />
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-slate-900 mb-2">
                {sortedProperties.length} {t("search.propertiesAvailable")}
              </h1>
              <p className="text-slate-600">
                {t("search.perfectStayDescription")}
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedProperties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card 
                      className="group hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => onViewProperty?.(property.id)}
                    >
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={property.image}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {property.featured && (
                          <Badge className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-cyan-500">
                            {t("search.featured")}
                          </Badge>
                        )}
                        <Button
                          size="icon"
                          variant="secondary"
                          className="absolute top-4 right-4 bg-white/90 hover:bg-white"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-slate-900 line-clamp-1">{property.title}</h3>
                        </div>
                        <div className="flex items-center gap-1 text-slate-600 text-sm mb-3">
                          <MapPin className="h-4 w-4" />
                          <span>{property.location}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                          <span>{property.bedrooms} {t("search.bed")}</span>
                          <span>•</span>
                          <span>{property.bathrooms} {t("search.bath")}</span>
                          <span>•</span>
                          <span>{property.guests} {t("search.guestsLabel")}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-4">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span className="text-slate-900">{property.rating}</span>
                          <span className="text-slate-600 text-sm">({property.reviews} {t("search.reviews")})</span>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div>
                            <span className="text-slate-900">${property.price}</span>
                            <span className="text-slate-600 text-sm">{t("search.perNight")}</span>
                          </div>
                          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-500">
                            {t("search.viewDetails")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
            )}

            {!isLoading && sortedProperties.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="text-slate-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-slate-900 mb-2">{t("search.noPropertiesFound")}</h3>
                <p className="text-slate-600 mb-6">
                  {t("search.adjustFilters")}
                </p>
                <Button onClick={clearFilters} variant="outline">
                  {t("search.clearAllFilters")}
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}