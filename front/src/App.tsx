import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { FeaturedProperties } from "./components/FeaturedProperties";
import { HowItWorks } from "./components/HowItWorks";
import { PropertyCategories } from "./components/PropertyCategories";
import { Features } from "./components/Features";
import { Footer } from "./components/Footer";
import { UserProfile } from "./components/UserProfile";
import { SearchPage } from "./components/SearchPage";
import { MyBookings } from "./components/MyBookings";
import { Favourites } from "./components/Favourites";
import { Notifications } from "./components/Notifications";
import { Support } from "./components/Support";
import { Messages } from "./components/Messages";
import { ListProperty } from "./components/ListProperty";
import { MyProperties } from "./components/MyProperties";
import { PropertyDetails } from "./components/PropertyDetails";
import { BookingPage } from "./components/BookingPage";
import { SignUp } from "./components/SignUp";
import { SignIn } from "./components/SignIn";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useState } from "react";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "profile" | "search" | "bookings" | "favourites" | "notifications" | "support" | "messages" | "listproperty" | "myproperties" | "propertydetails" | "booking" | "signup" | "signin">("home");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [previousPage, setPreviousPage] = useState<string>("home");

  const handleViewPropertyDetails = (propertyId: string) => {
    setPreviousPage(currentPage);
    setSelectedPropertyId(propertyId);
    setCurrentPage("propertydetails");
  };

  const handleBackFromPropertyDetails = () => {
    setCurrentPage(previousPage as any);
  };

  const handleBookNow = (propertyId: string) => {
    setPreviousPage(currentPage);
    setSelectedPropertyId(propertyId);
    setCurrentPage("booking");
  };

  const handleBackFromBooking = () => {
    setCurrentPage(previousPage as any);
  };

  const handleBookingComplete = () => {
    setCurrentPage("bookings");
  };

  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {currentPage === "home" ? (
          <>
            <Header 
              onNavigateToProfile={() => setCurrentPage("profile")}
              onNavigateToSearch={() => setCurrentPage("search")}
              onNavigateToBookings={() => setCurrentPage("bookings")}
              onNavigateToFavourites={() => setCurrentPage("favourites")}
              onNavigateToNotifications={() => setCurrentPage("notifications")}
              onNavigateToSupport={() => setCurrentPage("support")}
              onNavigateToMessages={() => setCurrentPage("messages")}
              onNavigateToListProperty={() => setCurrentPage("listproperty")}
              onNavigateToSignUp={() => setCurrentPage("signup")}
              onNavigateToSignIn={() => setCurrentPage("signin")}
            />
            <Hero onSearch={() => setCurrentPage("search")} />
            <FeaturedProperties onViewProperty={handleViewPropertyDetails} />
            <HowItWorks />
            <PropertyCategories />
            <Features />
            <Footer />
          </>
        ) : currentPage === "profile" ? (
          <UserProfile onBack={() => setCurrentPage("home")} />
        ) : currentPage === "search" ? (
          <SearchPage 
            onBack={() => setCurrentPage("home")}
            onViewProperty={handleViewPropertyDetails}
          />
        ) : currentPage === "bookings" ? (
          <MyBookings 
            onBack={() => setCurrentPage("home")}
            onNavigateToMessages={() => setCurrentPage("messages")}
          />
        ) : currentPage === "favourites" ? (
          <Favourites 
            onBack={() => setCurrentPage("home")}
            onViewProperty={handleViewPropertyDetails}
            onBookNow={handleBookNow}
          />
        ) : currentPage === "notifications" ? (
          <Notifications onBack={() => setCurrentPage("home")} />
        ) : currentPage === "support" ? (
          <Support 
            onBack={() => setCurrentPage("home")} 
            onNavigateToMessages={() => setCurrentPage("messages")}
          />
        ) : currentPage === "messages" ? (
          <Messages onBack={() => setCurrentPage("home")} />
        ) : currentPage === "listproperty" ? (
          <ListProperty 
            onBack={() => setCurrentPage("home")}
            onNavigateToMyProperties={() => setCurrentPage("myproperties")}
          />
        ) : currentPage === "myproperties" ? (
          <MyProperties 
            onBack={() => setCurrentPage("home")}
            onNavigateToListProperty={() => setCurrentPage("listproperty")}
            onViewPropertyDetails={handleViewPropertyDetails}
          />
        ) : currentPage === "signup" ? (
          <SignUp 
            onBack={() => setCurrentPage("home")}
            onLogin={() => setCurrentPage("signin")}
            onSignUpSuccess={() => setCurrentPage("home")}
          />
        ) : currentPage === "signin" ? (
          <SignIn 
            onBack={() => setCurrentPage("home")}
            onSignUp={() => setCurrentPage("signup")}
            onSignInSuccess={() => setCurrentPage("home")}
            onForgotPassword={() => console.log("Forgot password - to be implemented")}
          />
        ) : currentPage === "booking" ? (
          <BookingPage 
            propertyId={selectedPropertyId}
            onBack={handleBackFromBooking}
            onBookingComplete={handleBookingComplete}
          />
        ) : (
          <PropertyDetails 
            propertyId={selectedPropertyId}
            onBack={handleBackFromPropertyDetails}
            onBookNow={handleBookNow}
          />
        )}
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
}