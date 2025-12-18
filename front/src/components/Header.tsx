import { Home, Menu, User, Heart, Bell, MessageSquare, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import logoImage from "figma:asset/4078354ea7d87173a875181b965639dc6a347a05.png";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

export function Header({ 
  onNavigateToProfile, 
  onNavigateToSearch,
  onNavigateToBookings,
  onNavigateToFavourites,
  onNavigateToNotifications,
  onNavigateToSupport,
  onNavigateToMessages,
  onNavigateToListProperty,
  onNavigateToSignUp,
  onNavigateToSignIn
}: { 
  onNavigateToProfile?: () => void;
  onNavigateToSearch?: () => void;
  onNavigateToBookings?: () => void;
  onNavigateToFavourites?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToSupport?: () => void;
  onNavigateToMessages?: () => void;
  onNavigateToListProperty?: () => void;
  onNavigateToSignUp?: () => void;
  onNavigateToSignIn?: () => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="GoRent" className="h-10 w-10" />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              {t("header.brandName")}
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onNavigateToSearch?.(); }}
              className="text-slate-700 hover:text-blue-600 transition-colors"
            >
              {t("header.findProperty")}
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onNavigateToListProperty?.(); }}
              className="text-slate-700 hover:text-blue-600 transition-colors"
            >
              {t("header.listProperty")}
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onNavigateToBookings?.(); }}
              className="text-slate-700 hover:text-blue-600 transition-colors"
            >
              {t("header.myBookings")}
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onNavigateToSupport?.(); }}
              className="text-slate-700 hover:text-blue-600 transition-colors"
            >
              {t("header.support")}
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={onNavigateToMessages}
            >
              <MessageSquare className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-blue-500 rounded-full"></span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={onNavigateToFavourites}
            >
              <Heart className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={onNavigateToNotifications}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
            {isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={onNavigateToProfile}
                >
                  <User className="h-4 w-4" />
                  {user?.name || t("header.myProfile")}
                </Button>
                <LanguageSwitcher />
                <Button
                  variant="ghost"
                  className="gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  {t("header.signOut") || "Sign Out"}
                </Button>
              </>
            ) : (
              <>
                <LanguageSwitcher />
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600" onClick={onNavigateToSignIn}>
                  {t("header.signIn")}
                </Button>
                <Button variant="outline" onClick={onNavigateToSignUp}>
                  {t("header.signUp")}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-4">
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); onNavigateToSearch?.(); setIsMenuOpen(false); }}
                className="text-slate-700 hover:text-blue-600 transition-colors"
              >
                {t("header.findProperty")}
              </a>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); onNavigateToListProperty?.(); setIsMenuOpen(false); }}
                className="text-slate-700 hover:text-blue-600 transition-colors"
              >
                {t("header.listProperty")}
              </a>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); onNavigateToBookings?.(); setIsMenuOpen(false); }}
                className="text-slate-700 hover:text-blue-600 transition-colors"
              >
                {t("header.myBookings")}
              </a>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); onNavigateToSupport?.(); setIsMenuOpen(false); }}
                className="text-slate-700 hover:text-blue-600 transition-colors"
              >
                {t("header.support")}
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t">
                <LanguageSwitcher />
                {isAuthenticated ? (
                  <>
                    <Button
                      variant="outline"
                      className="gap-2 w-full"
                      onClick={() => { onNavigateToProfile?.(); setIsMenuOpen(false); }}
                    >
                      <User className="h-4 w-4" />
                      {user?.name || t("header.myProfile")}
                    </Button>
                    <Button
                      variant="ghost"
                      className="gap-2 w-full"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      {t("header.signOut") || "Sign Out"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 w-full" onClick={() => { onNavigateToSignIn?.(); setIsMenuOpen(false); }}>
                      {t("header.signIn")}
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => { onNavigateToSignUp?.(); setIsMenuOpen(false); }}>
                      {t("header.signUp")}
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}