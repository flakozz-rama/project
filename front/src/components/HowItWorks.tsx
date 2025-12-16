import { Search, FileCheck, Key, Star } from "lucide-react";
import { Card } from "./ui/card";
import { useLanguage } from "../context/LanguageContext";

export function HowItWorks() {
  const { t } = useLanguage();
  
  const steps = [
    {
      icon: Search,
      title: t("howItWorks.step1Title"),
      description: t("howItWorks.step1Desc"),
      step: "01",
      color: "from-blue-500 to-cyan-400",
    },
    {
      icon: FileCheck,
      title: t("howItWorks.step2Title"),
      description: t("howItWorks.step2Desc"),
      step: "02",
      color: "from-purple-500 to-pink-400",
    },
    {
      icon: Key,
      title: t("howItWorks.step3Title"),
      description: t("howItWorks.step3Desc"),
      step: "03",
      color: "from-orange-500 to-yellow-400",
    },
    {
      icon: Star,
      title: t("howItWorks.step4Title"),
      description: t("howItWorks.step4Desc"),
      step: "04",
      color: "from-green-500 to-emerald-400",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-slate-900 mb-4">
            {t("howItWorks.title")}
          </h2>
          <p className="text-lg text-slate-600">
            {t("howItWorks.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connection lines for desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 via-orange-200 to-green-200"></div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white relative overflow-hidden group">
                  {/* Background gradient on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  {/* Step number */}
                  <div className="absolute top-4 right-4 text-6xl opacity-5 group-hover:opacity-10 transition-opacity">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className={`relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-10 w-10 text-white" />
                  </div>

                  <h3 className="text-xl text-slate-900 mb-3 relative">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 relative">
                    {step.description}
                  </p>
                </Card>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-slate-600 mb-4">
            {t("howItWorks.readyToStart")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl">
              {t("header.findProperty")}
            </button>
            <button className="px-8 py-4 rounded-lg border-2 border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all">
              {t("howItWorks.becomeLandlord")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}