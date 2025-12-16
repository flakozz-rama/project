import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useLanguage } from "../context/LanguageContext";

export function Hero({ onSearch }: { onSearch?: () => void }) {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 text-white">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
      
      <div className="container mx-auto px-4 md:px-6 py-20 md:py-32 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl lg:text-7xl">
              {t("hero.title")}
              <span className="block mt-2">{t("hero.titleHighlight")}</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-50 max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm text-slate-600 mb-2">{t("hero.searchPlaceholder")}</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder={t("hero.searchPlaceholder")}
                    className="pl-10 h-12 border-slate-200"
                  />
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm text-slate-600 mb-2">{t("hero.checkInDate")}</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="date"
                    className="pl-10 h-12 border-slate-200"
                  />
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm text-slate-600 mb-2">{t("hero.guests")}</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="number"
                    placeholder="Number"
                    min="1"
                    defaultValue="1"
                    className="pl-10 h-12 border-slate-200"
                  />
                </div>
              </div>

              <div className="md:col-span-1 flex items-end">
                <Button 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 gap-2"
                  onClick={onSearch}
                >
                  <Search className="h-5 w-5" />
                  {t("hero.searchButton")}
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8">
            <div>
              <div className="text-3xl md:text-4xl">10,000+</div>
              <div className="text-blue-100 mt-1">{t("hero.stats.properties")}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl">50,000+</div>
              <div className="text-blue-100 mt-1">{t("hero.stats.happyUsers")}</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl">200+</div>
              <div className="text-blue-100 mt-1">Cities</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl">24/7</div>
              <div className="text-blue-100 mt-1">{t("header.support")}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}