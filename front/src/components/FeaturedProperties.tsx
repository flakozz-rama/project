import { Star, MapPin, Users, Bed, Bath, Loader2 } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import { useLanguage } from "../context/LanguageContext";
import { useProperties } from "../api";

interface FeaturedPropertiesProps {
  onViewProperty?: (propertyId: string) => void;
}

export function FeaturedProperties({ onViewProperty }: FeaturedPropertiesProps) {
  const { t } = useLanguage();
  const { data: propertiesData, isLoading } = useProperties();

  const properties = (propertiesData || []).slice(0, 6).map((p) => ({
    id: String(p.id),
    image: p.image,
    title: p.title,
    location: p.location,
    price: p.price.toLocaleString(),
    rating: p.rating,
    reviews: p.reviews,
    beds: p.bedrooms,
    guests: p.guests,
    type: p.type,
    featured: p.rating >= 4.8,
  }));

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl text-slate-900 mb-3">
              {t("featured.title")}
            </h2>
            <p className="text-slate-600 max-w-2xl">
              {t("featured.subtitle")}
            </p>
          </div>
          <Button variant="outline" size="lg">
            {t("common.viewAll")}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className="group overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => onViewProperty?.(property.id)}
              >
                <Badge className="absolute top-3 left-3 bg-white/90 text-blue-600 z-10">
                  Featured
                </Badge>
                <div className="aspect-[4/3] overflow-hidden rounded-t-xl">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-slate-900 line-clamp-1">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1 text-yellow-500 shrink-0 ml-2">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-slate-900">{property.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-slate-600 mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm line-clamp-1">{property.location}</span>
                  </div>

                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Bed className="h-4 w-4" />
                      <span className="text-sm">{property.beds} {t("featured.bedrooms")}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{property.guests} guests</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl text-slate-900">
                        ${property.price_per_night}
                      </span>
                      <span className="text-slate-600 ml-1">{t("featured.perMonth")}</span>
                    </div>
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                      {t("propertyDetails.bookNow")}
                    </Button>
                  </div>

                  <div className="text-sm text-slate-500 mt-2">
                    {property.reviews} {t("propertyDetails.reviews")}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}