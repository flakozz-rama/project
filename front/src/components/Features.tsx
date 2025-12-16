import { Shield, CreditCard, Clock, Headphones, FileCheck, Calendar, UserCheck, Award } from "lucide-react";
import { Card } from "./ui/card";
import { useLanguage } from "../context/LanguageContext";

export function Features() {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: Shield,
      title: t("features.feature2Title"),
      description: t("features.feature2Desc"),
    },
    {
      icon: Clock,
      title: t("features.feature4Title"),
      description: t("features.feature4Desc"),
    },
    {
      icon: Headphones,
      title: t("features.feature3Title"),
      description: t("features.feature3Desc"),
    },
    {
      icon: CreditCard,
      title: "Easy Payment",
      description: "Various payment methods for your convenience",
    },
    {
      icon: FileCheck,
      title: t("features.feature1Title"),
      description: t("features.feature1Desc"),
    },
    {
      icon: Calendar,
      title: "Flexible Terms",
      description: "Manage bookings and availability calendar",
    },
    {
      icon: UserCheck,
      title: "User Verification",
      description: "Identity verification for secure transactions",
    },
    {
      icon: Award,
      title: "Rating System",
      description: "Honest reviews from real users",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-slate-900 mb-4">
            {t("features.title")}
          </h2>
          <p className="text-lg text-slate-600">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 border-0 shadow-md hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Additional info section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl lg:text-4xl mb-4">
                Become a Landlord
              </h3>
              <p className="text-blue-50 text-lg mb-6">
                List your property on GoRent and earn steady income. 
                Simple management, reliable tenants, minimal commission.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-6 py-3 rounded-lg bg-white text-blue-600 hover:bg-blue-50 transition-colors">
                  Add Property
                </button>
                <button className="px-6 py-3 rounded-lg border-2 border-white text-white hover:bg-white/10 transition-colors">
                  Learn More
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <div className="text-3xl md:text-4xl mb-2">98%</div>
                <div className="text-blue-100 text-sm">Occupancy</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <div className="text-3xl md:text-4xl mb-2">3.5%</div>
                <div className="text-blue-100 text-sm">Commission</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <div className="text-3xl md:text-4xl mb-2">24h</div>
                <div className="text-blue-100 text-sm">Payouts</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <div className="text-3xl md:text-4xl mb-2">5K+</div>
                <div className="text-blue-100 text-sm">Partners</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}