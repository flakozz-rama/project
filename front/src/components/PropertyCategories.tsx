import { Building2, Home, DoorOpen, Warehouse, Castle, Trees } from "lucide-react";
import { Card } from "./ui/card";
import { useLanguage } from "../context/LanguageContext";

export function PropertyCategories() {
  const { t } = useLanguage();
  
  const categories = [
    {
      icon: Building2,
      title: t("categories.apartments"),
      count: "5,240+",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Home,
      title: t("categories.houses"),
      count: "2,180+",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: DoorOpen,
      title: t("categories.rooms"),
      count: "3,890+",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
    },
    {
      icon: Warehouse,
      title: t("categories.studios"),
      count: "1,560+",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: Castle,
      title: t("categories.penthouses"),
      count: "420+",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      icon: Trees,
      title: t("categories.villas"),
      count: "890+",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-slate-900 mb-4">
            {t("categories.title")}
          </h2>
          <p className="text-lg text-slate-600">
            {t("categories.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card
                key={index}
                className="group cursor-pointer border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-6 text-center">
                  <div className={`${category.bgColor} rounded-2xl w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <div className={`bg-gradient-to-br ${category.color} rounded-xl w-12 h-12 md:w-14 md:h-14 flex items-center justify-center`}>
                      <Icon className="h-6 w-6 md:h-8 md:w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-slate-900 mb-1">
                    {category.title}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {category.count}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}