import { useState } from "react";
import {
  Star, MapPin, Home, Users, Bed, Bath, Square, Wifi, Tv, Car, Coffee,
  Wind, Waves, Dumbbell, Shield, Calendar, DollarSign, Clock, X,
  ChevronLeft, ChevronRight, Heart, Share2, Flag, ThumbsUp, MessageSquare,
  CheckCircle, XCircle, AlertCircle, Info, Loader2
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Progress } from "./ui/progress";
import { motion, AnimatePresence } from "motion/react";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import { useProperty, useToggleFavourite } from "../api";

interface PropertyDetailsProps {
  propertyId: string;
  onBack?: () => void;
  onBookNow?: (propertyId: string) => void;
}

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
  images?: string[];
}

export function PropertyDetails({ propertyId, onBack, onBookNow }: PropertyDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [selectedReviewFilter, setSelectedReviewFilter] = useState<"all" | 5 | 4 | 3 | 2 | 1>("all");
  const [newReview, setNewReview] = useState("");
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const { data: propertyData, isLoading } = useProperty(Number(propertyId));
  const toggleFavourite = useToggleFavourite();

  const handleToggleFavourite = () => {
    toggleFavourite.mutate({ property_id: Number(propertyId) });
    setIsLiked(!isLiked);
  };

  const property = {
    id: propertyId,
    title: propertyData?.title || "Loading...",
    type: propertyData?.type || "Property",
    location: propertyData?.location || "",
    shortLocation: propertyData?.location || "",
    price: propertyData?.price_per_night || 0,
    cleaningFee: 50,
    securityDeposit: 200,
    host: {
      name: "Host",
      avatar: "https://i.pravatar.cc/150?img=1",
      joinDate: "January 2020",
      responseRate: 98,
      responseTime: "within an hour",
      verified: true
    },
    images: propertyData?.image ? [propertyData.image] : [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"
    ],
    bedrooms: propertyData?.bedrooms || 0,
    bathrooms: propertyData?.bathrooms || 0,
    guests: propertyData?.guests || 0,
    beds: propertyData?.bedrooms || 0,
    squareFeet: 1200,
    rating: propertyData?.rating || 0,
    reviewCount: propertyData?.reviews || 0,
    description: "Welcome to this stunning property! This beautifully designed space features modern furnishings and all the amenities you need for a comfortable stay.",
    amenities: (propertyData?.amenities || []).map((a) => ({
      id: a.toLowerCase(),
      label: a,
      icon: <Wifi className="h-5 w-5" />,
      available: true,
    })),
    houseRules: [
      "Check-in: 3:00 PM - 9:00 PM",
      "Check-out: 11:00 AM",
      "No smoking",
      "No pets",
      "No parties or events",
      "Quiet hours: 10:00 PM - 8:00 AM"
    ],
    cancellationPolicy: "Flexible - Full refund if cancelled 24 hours before check-in",
    minimumStay: 2,
    maximumStay: 30
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const reviews: Review[] = [
    {
      id: "1",
      userName: "Michael Chen",
      userAvatar: "https://i.pravatar.cc/150?img=12",
      rating: 5,
      date: "November 2024",
      comment: "Absolutely loved this place! The views were stunning, and the apartment was even better than the photos. Sarah was a wonderful host - very responsive and helpful. The location is perfect, within walking distance of everything. Would definitely stay here again!",
      helpful: 12,
      images: []
    },
    {
      id: "2",
      userName: "Emma Rodriguez",
      userAvatar: "https://i.pravatar.cc/150?img=5",
      rating: 5,
      date: "October 2024",
      comment: "This apartment exceeded all our expectations! Spotlessly clean, beautifully decorated, and the kitchen was fully equipped with everything we needed. The beds were incredibly comfortable. Perfect for our family vacation. Highly recommend!",
      helpful: 8,
      images: []
    },
    {
      id: "3",
      userName: "David Thompson",
      userAvatar: "https://i.pravatar.cc/150?img=8",
      rating: 4,
      date: "October 2024",
      comment: "Great apartment in an excellent location. Very modern and clean. The only minor issue was some street noise at night, but the provided earplugs helped. Overall, a fantastic stay and great value for money.",
      helpful: 5,
      images: []
    },
    {
      id: "4",
      userName: "Lisa Anderson",
      userAvatar: "https://i.pravatar.cc/150?img=9",
      rating: 5,
      date: "September 2024",
      comment: "This was our third time staying here and it never disappoints! Sarah is an amazing host who goes above and beyond. The apartment is always immaculate and well-stocked. We love the neighborhood and the convenience of everything nearby.",
      helpful: 15,
      images: []
    },
    {
      id: "5",
      userName: "James Wilson",
      userAvatar: "https://i.pravatar.cc/150?img=13",
      rating: 4,
      date: "September 2024",
      comment: "Very nice apartment with great amenities. Check-in was smooth and the place was exactly as described. The gym in the building was a nice bonus. Would have given 5 stars but the WiFi was a bit slow for remote work.",
      helpful: 3,
      images: []
    },
    {
      id: "6",
      userName: "Sophie Martin",
      userAvatar: "https://i.pravatar.cc/150?img=10",
      rating: 5,
      date: "August 2024",
      comment: "Perfect stay! The apartment is gorgeous and the location couldn't be better. Sarah provided excellent recommendations for restaurants and activities. Everything was seamless from booking to checkout. Can't wait to come back!",
      helpful: 9,
      images: []
    }
  ];

  const ratingDistribution = {
    5: 24,
    4: 6,
    3: 2,
    2: 0,
    1: 0
  };

  const filteredReviews = selectedReviewFilter === "all" 
    ? reviews 
    : reviews.filter(r => r.rating === selectedReviewFilter);

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === property.images.length - 1 ? 0 : prev + 1));
  };

  const handleSubmitReview = () => {
    if (newRating > 0 && newReview.trim()) {
      // Here you would submit to API
      console.log("Submitting review:", { rating: newRating, comment: newReview });
      setNewReview("");
      setNewRating(0);
      alert("Thank you for your review!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Back Button */}
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-6">
            ← Back
          </Button>
        )}

        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8 rounded-2xl overflow-hidden"
        >
          <div className="relative h-[400px] md:h-[600px]">
            <img
              src={property.images[currentImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            
            {/* Image Navigation */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 text-white rounded-full text-sm">
              {currentImageIndex + 1} / {property.images.length}
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full bg-white/90 hover:bg-white"
                onClick={handleToggleFavourite}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full bg-white/90 hover:bg-white"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <div className="flex gap-2 overflow-x-auto">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentImageIndex ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-slate-900 mb-2">{property.title}</h1>
                  <div className="flex items-center gap-4 text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {property.shortLocation}
                    </span>
                    <span className="flex items-center gap-1">
                      <Home className="h-4 w-4" />
                      {property.type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-slate-900">{property.rating}</span>
                  <span className="text-slate-600">({property.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Property Stats */}
              <div className="flex flex-wrap gap-6 py-6 border-t border-b">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-700">{property.guests} Guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-700">
                    {property.bedrooms === 0 ? "Studio" : `${property.bedrooms} Bedroom${property.bedrooms > 1 ? "s" : ""}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-700">{property.bathrooms} Bathroom{property.bathrooms > 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-700">{property.squareFeet} sqft</span>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>About this property</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed">{property.description}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Amenities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(showAllAmenities ? property.amenities : property.amenities.slice(0, 6)).map((amenity) => (
                      <div
                        key={amenity.id}
                        className={`flex items-center gap-3 ${amenity.available ? "text-slate-700" : "text-slate-400 line-through"}`}
                      >
                        {amenity.available ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-slate-400" />
                        )}
                        {amenity.icon}
                        <span>{amenity.label}</span>
                      </div>
                    ))}
                  </div>
                  {property.amenities.length > 6 && (
                    <Button
                      variant="ghost"
                      onClick={() => setShowAllAmenities(!showAllAmenities)}
                      className="mt-4"
                    >
                      {showAllAmenities ? "Show Less" : `Show All ${property.amenities.length} Amenities`}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* House Rules */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>House Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {property.houseRules.map((rule, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{rule}</span>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Minimum Stay</span>
                      <span className="text-slate-900">{property.minimumStay} night{property.minimumStay > 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Maximum Stay</span>
                      <span className="text-slate-900">{property.maximumStay} nights</span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-slate-700">Cancellation Policy</span>
                      <span className="text-slate-900 text-right">{property.cancellationPolicy}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Reviews Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Guest Reviews</CardTitle>
                    <div className="flex items-center gap-2">
                      <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                      <span className="text-2xl text-slate-900">{property.rating}</span>
                      <span className="text-slate-600">({property.reviewCount} reviews)</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Rating Distribution */}
                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <button
                        key={stars}
                        onClick={() => setSelectedReviewFilter(stars as 5 | 4 | 3 | 2 | 1)}
                        className={`w-full flex items-center gap-3 hover:bg-slate-50 p-2 rounded-lg transition-colors ${
                          selectedReviewFilter === stars ? "bg-slate-50" : ""
                        }`}
                      >
                        <span className="text-sm text-slate-600 w-12">{stars} stars</span>
                        <Progress value={(ratingDistribution[stars as keyof typeof ratingDistribution] / property.reviewCount) * 100} className="flex-1" />
                        <span className="text-sm text-slate-600 w-8">{ratingDistribution[stars as keyof typeof ratingDistribution]}</span>
                      </button>
                    ))}
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={selectedReviewFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedReviewFilter("all")}
                      className={selectedReviewFilter === "all" ? "bg-gradient-to-r from-blue-600 to-cyan-500" : ""}
                    >
                      All Reviews
                    </Button>
                    {[5, 4, 3, 2, 1].map((stars) => (
                      ratingDistribution[stars as keyof typeof ratingDistribution] > 0 && (
                        <Button
                          key={stars}
                          variant={selectedReviewFilter === stars ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedReviewFilter(stars as 5 | 4 | 3 | 2 | 1)}
                          className={selectedReviewFilter === stars ? "bg-gradient-to-r from-blue-600 to-cyan-500" : ""}
                        >
                          {stars} ⭐
                        </Button>
                      )
                    ))}
                  </div>

                  <Separator />

                  {/* Reviews List */}
                  <div className="space-y-6">
                    {filteredReviews.map((review) => (
                      <div key={review.id} className="space-y-3">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={review.userAvatar} alt={review.userName} />
                            <AvatarFallback>{review.userName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-slate-900">{review.userName}</h4>
                              <span className="text-sm text-slate-500">{review.date}</span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-slate-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-slate-700 leading-relaxed">{review.comment}</p>
                            <div className="flex items-center gap-4 mt-3">
                              <button className="flex items-center gap-1 text-sm text-slate-600 hover:text-blue-600 transition-colors">
                                <ThumbsUp className="h-4 w-4" />
                                Helpful ({review.helpful})
                              </button>
                              <button className="flex items-center gap-1 text-sm text-slate-600 hover:text-red-600 transition-colors">
                                <Flag className="h-4 w-4" />
                                Report
                              </button>
                            </div>
                          </div>
                        </div>
                        <Separator />
                      </div>
                    ))}
                  </div>

                  {/* Write a Review */}
                  <div className="bg-slate-50 p-6 rounded-lg space-y-4">
                    <h4 className="text-slate-900">Write a Review</h4>
                    <div>
                      <label className="text-sm text-slate-700 mb-2 block">Your Rating</label>
                      <div className="flex gap-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button
                            key={i}
                            onMouseEnter={() => setHoverRating(i + 1)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setNewRating(i + 1)}
                          >
                            <Star
                              className={`h-8 w-8 cursor-pointer transition-colors ${
                                i < (hoverRating || newRating)
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-slate-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 mb-2 block">Your Review</label>
                      <Textarea
                        placeholder="Share your experience staying at this property..."
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <Button
                      onClick={handleSubmitReview}
                      disabled={newRating === 0 || !newReview.trim()}
                      className="bg-gradient-to-r from-blue-600 to-cyan-500"
                    >
                      Submit Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - Booking Card and Host Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Booking Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="sticky top-6"
            >
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl text-slate-900">${property.price}</span>
                    <span className="text-slate-600">/ night</span>
                  </div>

                  <Separator />

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Cleaning fee</span>
                      <span className="text-slate-900">${property.cleaningFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Security deposit</span>
                      <span className="text-slate-900">${property.securityDeposit}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500"
                    size="lg"
                    onClick={() => onBookNow && onBookNow(propertyId)}
                  >
                    Book Now
                  </Button>

                  <p className="text-center text-sm text-slate-500">You won't be charged yet</p>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Free cancellation within 24 hours of booking
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Host Info */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={property.host.avatar} alt={property.host.name} />
                      <AvatarFallback>{property.host.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-slate-900">Hosted by {property.host.name}</h4>
                        {property.host.verified && (
                          <Badge className="bg-blue-100 text-blue-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">Joined {property.host.joinDate}</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Response rate</span>
                      <span className="text-slate-900">{property.host.responseRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Response time</span>
                      <span className="text-slate-900">{property.host.responseTime}</span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full mt-4 gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Contact Host
                  </Button>
                </CardContent>
              </Card>

              {/* Location */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-2 text-sm text-slate-700">
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{property.location}</span>
                  </div>
                  <div className="mt-4 w-full h-48 bg-slate-200 rounded-lg flex items-center justify-center">
                    <span className="text-slate-500">Map View</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}