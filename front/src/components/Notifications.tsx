import { useState } from "react";
import {
  Bell, CheckCircle, XCircle, AlertCircle, Info, Star,
  Home, Calendar, CreditCard, MessageSquare, Settings,
  Clock, Trash2, Check, Eye, EyeOff
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "../context/LanguageContext";

interface NotificationsProps {
  onBack?: () => void;
}

interface Notification {
  id: number;
  type: "booking" | "payment" | "review" | "message" | "system" | "reminder";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: "low" | "medium" | "high";
  actionLabel?: string;
  actionUrl?: string;
}

export function Notifications({ onBack }: NotificationsProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "booking",
      title: "Booking Confirmed",
      message: "Your booking at Modern Downtown Apartment has been confirmed for Dec 15-22, 2024.",
      timestamp: "2024-12-04T10:30:00",
      read: false,
      priority: "high",
      actionLabel: "View Booking",
      actionUrl: "/bookings/1"
    },
    {
      id: 2,
      type: "payment",
      title: "Payment Successful",
      message: "Payment of $1,260 for booking GR-2024-001234 has been processed successfully.",
      timestamp: "2024-12-04T10:25:00",
      read: false,
      priority: "high",
      actionLabel: "View Receipt",
      actionUrl: "/payments/1"
    },
    {
      id: 3,
      type: "reminder",
      title: "Upcoming Check-in",
      message: "Your check-in at Modern Downtown Apartment is in 11 days. Don't forget to prepare your documents.",
      timestamp: "2024-12-04T09:00:00",
      read: false,
      priority: "medium",
      actionLabel: "View Details",
      actionUrl: "/bookings/1"
    },
    {
      id: 4,
      type: "message",
      title: "New Message from Host",
      message: "Sarah Johnson sent you a message about your upcoming stay.",
      timestamp: "2024-12-03T18:45:00",
      read: true,
      priority: "medium",
      actionLabel: "Read Message",
      actionUrl: "/messages/1"
    },
    {
      id: 5,
      type: "review",
      title: "Leave a Review",
      message: "How was your stay at Spacious Mountain Cabin? Share your experience with other travelers.",
      timestamp: "2024-12-03T14:20:00",
      read: true,
      priority: "low",
      actionLabel: "Write Review",
      actionUrl: "/reviews/new"
    },
    {
      id: 6,
      type: "booking",
      title: "Booking Request Pending",
      message: "Your booking request for Cozy Studio in Arts District is awaiting host approval.",
      timestamp: "2024-12-03T11:15:00",
      read: true,
      priority: "medium",
      actionLabel: "View Request",
      actionUrl: "/bookings/3"
    },
    {
      id: 7,
      type: "system",
      title: "Profile Verification Complete",
      message: "Your identity verification has been successfully completed. You can now book properties instantly.",
      timestamp: "2024-12-02T16:30:00",
      read: true,
      priority: "high",
      actionLabel: "View Profile",
      actionUrl: "/profile"
    },
    {
      id: 8,
      type: "payment",
      title: "Payment Method Added",
      message: "A new payment method ending in 4242 has been added to your account.",
      timestamp: "2024-12-02T15:10:00",
      read: true,
      priority: "low",
      actionLabel: "Manage Payments",
      actionUrl: "/settings/payments"
    },
    {
      id: 9,
      type: "review",
      title: "New Review Received",
      message: "You received a 5-star review from Michael Chen for your property Spacious Loft in Arts District.",
      timestamp: "2024-12-01T20:45:00",
      read: true,
      priority: "medium",
      actionLabel: "View Review",
      actionUrl: "/reviews/9"
    },
    {
      id: 10,
      type: "system",
      title: "Special Offer Available",
      message: "Get 15% off your next booking! Limited time offer for verified users.",
      timestamp: "2024-12-01T12:00:00",
      read: true,
      priority: "low",
      actionLabel: "View Offer",
      actionUrl: "/offers/winter"
    },
    {
      id: 11,
      type: "reminder",
      title: "Check-out Reminder",
      message: "Your check-out from Luxury Beachfront Villa is tomorrow at 11:00 AM.",
      timestamp: "2024-11-30T09:00:00",
      read: true,
      priority: "high",
      actionLabel: "View Booking",
      actionUrl: "/bookings/2"
    },
    {
      id: 12,
      type: "message",
      title: "Host Response",
      message: "David Williams responded to your inquiry about Mountain Cabin availability.",
      timestamp: "2024-11-29T17:30:00",
      read: true,
      priority: "medium",
      actionLabel: "Read Response",
      actionUrl: "/messages/4"
    }
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking":
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case "payment":
        return <CreditCard className="h-5 w-5 text-green-600" />;
      case "review":
        return <Star className="h-5 w-5 text-yellow-600" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-purple-600" />;
      case "reminder":
        return <Clock className="h-5 w-5 text-orange-600" />;
      case "system":
        return <Settings className="h-5 w-5 text-slate-600" />;
      default:
        return <Bell className="h-5 w-5 text-slate-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-4 border-l-red-500";
      case "medium":
        return "border-l-4 border-l-yellow-500";
      case "low":
        return "border-l-4 border-l-blue-500";
      default:
        return "";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes <= 1 ? "Just now" : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const getFilteredNotifications = () => {
    if (activeTab === "all") return notifications;
    if (activeTab === "unread") return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === activeTab);
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  const notificationStats = {
    all: notifications.length,
    unread: unreadCount,
    booking: notifications.filter(n => n.type === "booking").length,
    payment: notifications.filter(n => n.type === "payment").length,
    message: notifications.filter(n => n.type === "message").length,
    review: notifications.filter(n => n.type === "review").length
  };

  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Back Button */}
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-6">
            ← {t('notifications.backToHome')}
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
              <h1 className="text-slate-900 mb-2 flex items-center gap-3">
                {t('notifications.title')}
                {unreadCount > 0 && (
                  <Badge className="bg-gradient-to-r from-blue-600 to-cyan-500">
                    {unreadCount} {t('notifications.new')}
                  </Badge>
                )}
              </h1>
              <p className="text-slate-600">
                {t('notifications.subtitle')}
              </p>
            </div>

            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" onClick={markAllAsRead} className="gap-2">
                  <Check className="h-4 w-4" />
                  {t('notifications.markAllRead')}
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Notifications Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 h-auto">
            <TabsTrigger value="all">
              {t('notifications.tabs.all')}
              <Badge variant="secondary" className="ml-2">
                {notificationStats.all}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread">
              {t('notifications.tabs.unread')}
              {notificationStats.unread > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {notificationStats.unread}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="booking">
              <Calendar className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">{t('notifications.tabs.bookings')}</span>
            </TabsTrigger>
            <TabsTrigger value="payment">
              <CreditCard className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">{t('notifications.tabs.payments')}</span>
            </TabsTrigger>
            <TabsTrigger value="message">
              <MessageSquare className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">{t('notifications.tabs.messages')}</span>
            </TabsTrigger>
            <TabsTrigger value="review">
              <Star className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">{t('notifications.tabs.reviews')}</span>
            </TabsTrigger>
            <TabsTrigger value="system">
              <Settings className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">{t('notifications.tabs.system')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    layout
                  >
                    <Card 
                      className={`overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      } ${getPriorityColor(notification.priority)}`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <CardContent className="p-5">
                        <div className="flex gap-4">
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-1">
                            <div className={`p-3 rounded-full ${
                              !notification.read ? 'bg-white' : 'bg-slate-100'
                            }`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <h3 className={`text-slate-900 mb-1 ${
                                  !notification.read ? 'font-semibold' : ''
                                }`}>
                                  {notification.title}
                                  {!notification.read && (
                                    <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                                  )}
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                  {notification.message}
                                </p>
                              </div>

                              {/* Priority Badge */}
                              {notification.priority === "high" && !notification.read && (
                                <Badge variant="destructive" className="flex-shrink-0">
                                  {t('notifications.urgent')}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                              <Clock className="h-3 w-3" />
                              <span>{formatTimestamp(notification.timestamp)}</span>
                            </div>

                            <Separator className="mb-3" />

                            {/* Actions */}
                            <div className="flex flex-wrap items-center gap-2">
                              {notification.actionLabel && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  {notification.actionLabel}
                                </Button>
                              )}
                              
                              {!notification.read && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="gap-1"
                                >
                                  <Eye className="h-3 w-3" />
                                  {t('notifications.markAsRead')}
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="gap-1 text-red-600 hover:text-red-700 ml-auto"
                              >
                                <Trash2 className="h-3 w-3" />
                                {t('notifications.delete')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div className="text-slate-400 mb-4">
                    <Bell className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-slate-900 mb-2">{t('notifications.noNotifications')}</h3>
                  <p className="text-slate-600 mb-6">
                    {activeTab === "all" 
                      ? t('notifications.allCaughtUp')
                      : t('notifications.noTypeNotifications').replace('{type}', activeTab)}
                  </p>
                  {activeTab !== "all" && (
                    <Button variant="outline" onClick={() => setActiveTab("all")}>
                      {t('notifications.viewAllNotifications')}
                    </Button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>

        {/* Notification Settings Hint */}
        {filteredNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-900 text-sm">
                      {t('notifications.notificationSettings')}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    {t('notifications.settings')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}