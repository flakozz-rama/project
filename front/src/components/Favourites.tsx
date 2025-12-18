import { useState } from "react";
import {
  Heart, MapPin, Star, Users, Home as HomeIcon, Bed, Bath,
  Filter, SlidersHorizontal, Trash2, Share2, Calendar, Loader2
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { motion, AnimatePresence } from "motion/react";
import { Alert, AlertDescription } from "./ui/alert";
import { useLanguage } from "../context/LanguageContext";
import { useFavourites, useToggleFavourite } from "../api";

interface FavouritesProps {
  onBack?: () => void;
  onViewProperty?: (propertyId: string) => void;
  onBookNow?: (propertyId: string) => void;
}

interface Property {
  id: number;
  title: string;
  location: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
  bedrooms: number;
  bathrooms: number;
  guests: number;
  type: string;
  amenities: string[];
  available: boolean;
  savedDate: string;
}

export function Favourites({ onBack, onViewProperty, onBookNow }: FavouritesProps) {
  const [sortBy, setSortBy] = useState("recent");
  const [filterType, setFilterType] = useState("all");

  const { data: favoritesData, isLoading, error } = useFavourites();
  const toggleFavourite = useToggleFavourite();

  const favorites: Property[] = (favoritesData || []).map((p) => ({
    id: p.id,
    title: p.title,
    location: p.location,
    image: p.image,
    price: p.price_per_night,
    rating: p.rating,
    reviews: p.reviews,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    guests: p.guests,
    type: p.type,
    amenities: p.amenities,
    available: true,
    savedDate: new Date().toISOString().split("T")[0],
  }));

  const removeFavorite = (id: number) => {
    toggleFavourite.mutate({ property_id: id });
  };

  const getFilteredAndSortedFavorites = () => {
    let filtered = favorites;

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(fav => fav.type === filterType);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "recent":
        default:
          return new Date(b.savedDate).getTime() - new Date(a.savedDate).getTime();
      }
    });

    return sorted;
  };

  const filteredFavorites = getFilteredAndSortedFavorites();

  const { t } = useLanguage();

  const propertyTypes = [
    { value: "all", label: t('favourites.all') },
    { value: "apartment", label: t('favourites.apartment') },
    { value: "house", label: t('favourites.house') },
    { value: "villa", label: t('favourites.villa') },
    { value: "studio", label: t('favourites.studio') },
    { value: "loft", label: t('favourites.loft') }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Back Button */}
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-6">
            ← {t('favourites.backToHome')}
          </Button>
        )}

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-slate-900 mb-2">{t('favourites.title')}</h1>
              <p className="text-slate-600">
                {t('favourites.subtitle')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={t('favourites.sortBy')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">{t('favourites.recent')}</SelectItem>
                  <SelectItem value="price-low">{t('favourites.priceLow')}</SelectItem>
                  <SelectItem value="price-high">{t('favourites.priceHigh')}</SelectItem>
                  <SelectItem value="rating">{t('favourites.rating')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600">Failed to load favourites</p>
          </div>
        ) : /* Favourites Grid */
        filteredFavorites.length > 0 ? (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFavorites.map((property, index) => (
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
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {!property.available && (
                          <Badge variant="secondary" className="bg-red-500 text-white">
                            {t('favourites.notAvailable')}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="bg-white/90">
                          {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                        </Badge>
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="bg-white/90 hover:bg-white"
                          onClick={() => removeFavorite(property.id)}
                        >
                          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-slate-900 line-clamp-1 flex-1">{property.title}</h3>
                      </div>

                      <div className="flex items-center gap-1 text-slate-600 text-sm mb-3">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="line-clamp-1">{property.location}</span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          {property.bedrooms}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          {property.bathrooms}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {property.guests}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 mb-4">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-slate-900">{property.rating}</span>
                        <span className="text-slate-600 text-sm">({property.reviews})</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {property.amenities.slice(0, 3).map((amenity, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {property.amenities.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{property.amenities.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="mt-auto pt-4 border-t">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-slate-900">${property.price}</span>
                            <span className="text-slate-600 text-sm"> {t('favourites.perNight')}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500"
                            disabled={!property.available}
                            onClick={(e) => {
                              e.stopPropagation();
                              onBookNow?.(property.id.toString());
                            }}
                          >
                            {property.available ? (
                              <>
                                <Calendar className="h-4 w-4 mr-1" />
                                {t('favourites.bookNow')}
                              </>
                            ) : (
                              t('favourites.notAvailable')
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFavorite(property.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-slate-400 mb-4">
              <Heart className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-slate-900 mb-2">
              {favorites.length === 0 ? "No favourites yet" : "No properties found"}
            </h3>
            <p className="text-slate-600 mb-6">
              {favorites.length === 0 
                ? "Start exploring and save your favorite properties" 
                : "Try adjusting your filters to see more properties"}
            </p>
            {favorites.length === 0 ? (
              onBack && (
                <Button onClick={onBack} className="bg-gradient-to-r from-blue-600 to-cyan-500">
                  Explore Properties
                </Button>
              )
            ) : (
              <Button onClick={() => setFilterType("all")} variant="outline">
                Clear Filters
              </Button>
            )}
          </motion.div>
        )}

        {/* Info Alert */}
        {filteredFavorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Alert>
              <HomeIcon className="h-4 w-4" />
              <AlertDescription>
                Price and availability may change. Book soon to secure your favorite properties.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </div>
    </div>
  );
}