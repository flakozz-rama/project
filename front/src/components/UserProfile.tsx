import { useState } from "react";
import { 
  User, Mail, Phone, MapPin, Calendar, Edit, Save, X,
  Home, Heart, Star, Settings, CreditCard, Bell, Shield,
  Clock, CheckCircle, XCircle
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { motion } from "motion/react";
import { useLanguage } from "../context/LanguageContext";

interface UserProfileProps {
  onBack?: () => void;
}

export function UserProfile({ onBack }: UserProfileProps) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "John Anderson",
    email: "john.anderson@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    memberSince: "January 2024",
    avatar: "https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwZXJzb24lMjBhdmF0YXJ8ZW58MXx8fHwxNzY0NzY2MDk5fDA&ixlib=rb-4.1.0&q=80&w=1080"
  });

  const [editedData, setEditedData] = useState(profileData);

  const handleSave = () => {
    setProfileData(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData(profileData);
    setIsEditing(false);
  };

  // Mock data for bookings
  const bookings = [
    {
      id: 1,
      property: "Modern Apartment Downtown",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
      checkIn: "Dec 15, 2024",
      checkOut: "Dec 22, 2024",
      status: "confirmed",
      price: "$1,200"
    },
    {
      id: 2,
      property: "Cozy Beach House",
      image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400",
      checkIn: "Jan 10, 2025",
      checkOut: "Jan 17, 2025",
      status: "pending",
      price: "$2,400"
    },
    {
      id: 3,
      property: "Luxury Villa with Pool",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400",
      checkIn: "Nov 5, 2024",
      checkOut: "Nov 12, 2024",
      status: "completed",
      price: "$3,500"
    }
  ];

  // Mock data for user's properties
  const myProperties = [
    {
      id: 1,
      title: "Spacious Loft in Arts District",
      image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
      price: `$180${t('profile.perNight')}`,
      status: "active",
      bookings: 24,
      rating: 4.8
    },
    {
      id: 2,
      title: "Mountain Cabin Retreat",
      image: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=400",
      price: `$250${t('profile.perNight')}`,
      status: "active",
      bookings: 18,
      rating: 4.9
    }
  ];

  // Mock data for favorites
  const favorites = [
    {
      id: 1,
      title: "Elegant City Penthouse",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
      price: `$320${t('profile.perNight')}`,
      rating: 4.7
    },
    {
      id: 2,
      title: "Charming Countryside Home",
      image: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=400",
      price: `$150${t('profile.perNight')}`,
      rating: 4.6
    },
    {
      id: 3,
      title: "Waterfront Apartment",
      image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=400",
      price: `$280${t('profile.perNight')}`,
      rating: 4.9
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusTranslation = (status: string) => {
    return t(`profile.${status}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Back button */}
        {onBack && (
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-6"
          >
            ← {t('profile.backToHome')}
          </Button>
        )}

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-8 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600"></div>
            <CardContent className="pt-0">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-12">
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                  <AvatarImage src={profileData.avatar} alt={profileData.name} />
                  <AvatarFallback>
                    {profileData.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-left mb-4">
                  <h1 className="text-slate-900 mb-1">{profileData.name}</h1>
                  <p className="text-slate-600 mb-2">{t('profile.memberSince')} {profileData.memberSince}</p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <Badge variant="secondary" className="gap-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      {t('profile.verifiedHost')}
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      {t('profile.idVerified')}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="gap-2">
                      <Edit className="h-4 w-4" />
                      {t('profile.editProfile')}
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleSave} className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-500">
                        <Save className="h-4 w-4" />
                        {t('profile.save')}
                      </Button>
                      <Button onClick={handleCancel} variant="outline" className="gap-2">
                        <X className="h-4 w-4" />
                        {t('profile.cancel')}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profile Tabs */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
            <TabsTrigger value="personal" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{t('profile.personalInfoTab')}</span>
              <span className="sm:hidden">{t('profile.info')}</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">{t('profile.myBookingsTab')}</span>
              <span className="sm:hidden">{t('profile.bookings')}</span>
            </TabsTrigger>
            <TabsTrigger value="properties" className="gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">{t('profile.myPropertiesTab')}</span>
              <span className="sm:hidden">{t('profile.properties')}</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">{t('profile.favoritesTab')}</span>
              <span className="sm:hidden">{t('profile.saved')}</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              {t('profile.settingsTab')}
            </TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{t('profile.personalInfoTitle')}</CardTitle>
                  <CardDescription>
                    {t('profile.personalInfoDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('profile.fullName')}</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="name"
                          value={isEditing ? editedData.name : profileData.name}
                          onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{t('profile.emailAddress')}</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          value={isEditing ? editedData.email : profileData.email}
                          onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('profile.phoneNumber')}</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="phone"
                          value={isEditing ? editedData.phone : profileData.phone}
                          onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">{t('profile.location')}</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="location"
                          value={isEditing ? editedData.location : profileData.location}
                          onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-slate-900 mb-4">{t('profile.accountStatsTitle')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-blue-600 mb-2">42</div>
                            <p className="text-slate-600 text-sm">{t('profile.totalBookings')}</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-green-600 mb-2">2</div>
                            <p className="text-slate-600 text-sm">{t('profile.propertiesListed')}</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-purple-600 mb-2">28</div>
                            <p className="text-slate-600 text-sm">{t('profile.reviewsGiven')}</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-orange-50 to-yellow-50">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-orange-600 mb-2">4.8</div>
                            <p className="text-slate-600 text-sm">{t('profile.averageRating')}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{t('profile.myBookingsTitle')}</CardTitle>
                  <CardDescription>
                    {t('profile.myBookingsDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings.map((booking, index) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="flex flex-col md:flex-row">
                            <div className="w-full md:w-48 h-48 md:h-auto">
                              <img
                                src={booking.image}
                                alt={booking.property}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 p-6">
                              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                                <div>
                                  <h3 className="text-slate-900 mb-2">{booking.property}</h3>
                                  <div className="flex items-center gap-4 text-slate-600 text-sm">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      {t('profile.checkIn')}: {booking.checkIn}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      {t('profile.checkOut')}: {booking.checkOut}
                                    </span>
                                  </div>
                                </div>
                                <Badge className={getStatusColor(booking.status)}>
                                  <span className="flex items-center gap-1">
                                    {getStatusIcon(booking.status)}
                                    {getStatusTranslation(booking.status)}
                                  </span>
                                </Badge>
                              </div>
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                  <span className="text-slate-900">{booking.price}</span>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm">{t('profile.viewDetails')}</Button>
                                  {booking.status === "confirmed" && (
                                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                      {t('profile.cancelBooking')}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* My Properties Tab */}
          <TabsContent value="properties">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{t('profile.myPropertiesTitle')}</CardTitle>
                      <CardDescription>
                        {t('profile.myPropertiesDesc')}
                      </CardDescription>
                    </div>
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-500">
                      + {t('profile.addNewProperty')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myProperties.map((property, index) => (
                      <motion.div
                        key={property.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="relative h-48">
                            <img
                              src={property.image}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                            <Badge className="absolute top-4 right-4 bg-green-500">
                              {t(`profile.${property.status}`)}
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="text-slate-900 mb-2">{property.title}</h3>
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-blue-600">{property.price}</span>
                              <div className="flex items-center gap-1 text-slate-600">
                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                <span>{property.rating}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-slate-600 text-sm mb-4">
                              <span>{property.bookings} {t('profile.bookings')}</span>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1">
                                {t('profile.edit')}
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1">
                                {t('profile.viewStats')}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{t('profile.favoritesTitle')}</CardTitle>
                  <CardDescription>
                    {t('profile.favoritesDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {favorites.map((property, index) => (
                      <motion.div
                        key={property.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                          <div className="relative h-48">
                            <img
                              src={property.image}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                            <Button
                              size="icon"
                              variant="secondary"
                              className="absolute top-4 right-4 bg-white/90 hover:bg-white"
                            >
                              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                            </Button>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="text-slate-900 mb-2">{property.title}</h3>
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-blue-600">{property.price}</span>
                              <div className="flex items-center gap-1 text-slate-600">
                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                <span>{property.rating}</span>
                              </div>
                            </div>
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500">
                              {t('profile.bookNow')}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Notifications Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    {t('profile.notificationPreferences')}
                  </CardTitle>
                  <CardDescription>
                    {t('profile.notificationPreferencesDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-900">{t('profile.emailNotifications')}</p>
                      <p className="text-slate-600 text-sm">{t('profile.emailNotificationsDesc')}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-900">{t('profile.smsNotifications')}</p>
                      <p className="text-slate-600 text-sm">{t('profile.smsNotificationsDesc')}</p>
                    </div>
                    <Switch />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-900">{t('profile.marketingEmails')}</p>
                      <p className="text-slate-600 text-sm">{t('profile.marketingEmailsDesc')}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-900">{t('profile.reviewReminders')}</p>
                      <p className="text-slate-600 text-sm">{t('profile.reviewRemindersDesc')}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {t('profile.paymentMethods')}
                  </CardTitle>
                  <CardDescription>
                    {t('profile.paymentMethodsDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-3 rounded">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-slate-900">•••• •••• •••• 4242</p>
                        <p className="text-slate-600 text-sm">{t('profile.expires')} 12/25</p>
                      </div>
                    </div>
                    <Badge>{t('profile.default')}</Badge>
                  </div>
                  <Button variant="outline" className="w-full">
                    + {t('profile.addPaymentMethod')}
                  </Button>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    {t('profile.securityPrivacy')}
                  </CardTitle>
                  <CardDescription>
                    {t('profile.securityPrivacyDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    {t('profile.changePassword')}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    {t('profile.twoFactorAuth')}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    {t('profile.privacySettings')}
                  </Button>
                  <Separator />
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                    {t('profile.deleteAccount')}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
