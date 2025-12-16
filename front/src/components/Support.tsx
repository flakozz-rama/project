import { useState } from "react";
import {
  HelpCircle, MessageCircle, Phone, Mail, Search, ChevronDown,
  ChevronUp, Send, Clock, CheckCircle, Home, CreditCard,
  User, Settings, FileText, Shield, AlertCircle, ExternalLink, Info
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { motion, AnimatePresence } from "motion/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { useLanguage } from "../context/LanguageContext";

interface SupportProps {
  onBack?: () => void;
  onNavigateToMessages?: () => void;
}

interface FAQ {
  id: number;
  questionKey: string;
  answerKey: string;
  category: string;
}

interface HelpArticle {
  id: number;
  titleKey: string;
  descriptionKey: string;
  category: string;
  icon: React.ReactNode;
  popular: boolean;
}

export function Support({ onBack, onNavigateToMessages }: SupportProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [showArticleDialog, setShowArticleDialog] = useState(false);

  const helpArticles: HelpArticle[] = [
    {
      id: 1,
      titleKey: "howToBook",
      descriptionKey: "howToBookDesc",
      category: "bookings",
      icon: <Home className="h-6 w-6" />,
      popular: true
    },
    {
      id: 2,
      titleKey: "paymentMethods",
      descriptionKey: "paymentMethodsDesc",
      category: "payments",
      icon: <CreditCard className="h-6 w-6" />,
      popular: true
    },
    {
      id: 3,
      titleKey: "cancellationPolicy",
      descriptionKey: "cancellationPolicyDesc",
      category: "bookings",
      icon: <FileText className="h-6 w-6" />,
      popular: true
    },
    {
      id: 4,
      titleKey: "accountVerification",
      descriptionKey: "accountVerificationDesc",
      category: "account",
      icon: <Shield className="h-6 w-6" />,
      popular: true
    },
    {
      id: 5,
      titleKey: "managingProfile",
      descriptionKey: "managingProfileDesc",
      category: "account",
      icon: <User className="h-6 w-6" />,
      popular: false
    },
    {
      id: 6,
      titleKey: "listingProperty",
      descriptionKey: "listingPropertyDesc",
      category: "hosting",
      icon: <Home className="h-6 w-6" />,
      popular: true
    },
    {
      id: 7,
      titleKey: "safetyTips",
      descriptionKey: "safetyTipsDesc",
      category: "safety",
      icon: <Shield className="h-6 w-6" />,
      popular: false
    },
    {
      id: 8,
      titleKey: "communicationHosts",
      descriptionKey: "communicationHostsDesc",
      category: "general",
      icon: <MessageCircle className="h-6 w-6" />,
      popular: false
    }
  ];

  const faqs: FAQ[] = [
    {
      id: 1,
      questionKey: "faq1Q",
      answerKey: "faq1A",
      category: "bookings"
    },
    {
      id: 2,
      questionKey: "faq2Q",
      answerKey: "faq2A",
      category: "payments"
    },
    {
      id: 3,
      questionKey: "faq3Q",
      answerKey: "faq3A",
      category: "bookings"
    },
    {
      id: 4,
      questionKey: "faq4Q",
      answerKey: "faq4A",
      category: "general"
    },
    {
      id: 5,
      questionKey: "faq5Q",
      answerKey: "faq5A",
      category: "payments"
    },
    {
      id: 6,
      questionKey: "faq6Q",
      answerKey: "faq6A",
      category: "account"
    },
    {
      id: 7,
      questionKey: "faq7Q",
      answerKey: "faq7A",
      category: "general"
    },
    {
      id: 8,
      questionKey: "faq8Q",
      answerKey: "faq8A",
      category: "bookings"
    },
    {
      id: 9,
      questionKey: "faq9Q",
      answerKey: "faq9A",
      category: "general"
    },
    {
      id: 10,
      questionKey: "faq10Q",
      answerKey: "faq10A",
      category: "bookings"
    }
  ];

  const categories = [
    { value: "all", labelKey: "allTopics", icon: <HelpCircle className="h-4 w-4" /> },
    { value: "bookings", labelKey: "bookings", icon: <Home className="h-4 w-4" /> },
    { value: "payments", labelKey: "payments", icon: <CreditCard className="h-4 w-4" /> },
    { value: "account", labelKey: "account", icon: <User className="h-4 w-4" /> },
    { value: "hosting", labelKey: "hosting", icon: <Home className="h-4 w-4" /> },
    { value: "safety", labelKey: "safety", icon: <Shield className="h-4 w-4" /> },
    { value: "general", labelKey: "general", icon: <HelpCircle className="h-4 w-4" /> }
  ];

  const getFilteredArticles = () => {
    let filtered = helpArticles;
    
    if (activeCategory !== "all") {
      filtered = filtered.filter(article => article.category === activeCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(article =>
        t(`support.${article.titleKey}`).toLowerCase().includes(searchQuery.toLowerCase()) ||
        t(`support.${article.descriptionKey}`).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const getFilteredFAQs = () => {
    let filtered = faqs;

    if (activeCategory !== "all") {
      filtered = filtered.filter(faq => faq.category === activeCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(faq =>
        t(`support.${faq.questionKey}`).toLowerCase().includes(searchQuery.toLowerCase()) ||
        t(`support.${faq.answerKey}`).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSubmitted(true);
    setTicketSubject("");
    setTicketCategory("");
    setTicketMessage("");
    
    setTimeout(() => {
      setTicketSubmitted(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Back Button */}
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-6">
            ← {t("support.backToHome")}
          </Button>
        )}

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-slate-900 mb-4">{t("support.title")}</h1>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            {t("support.subtitle")}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder={t("support.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={activeCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.value)}
                className={activeCategory === category.value 
                  ? "bg-gradient-to-r from-blue-600 to-cyan-500" 
                  : ""}
              >
                {category.icon}
                <span className="ml-2">{t(`support.${category.labelKey}`)}</span>
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Quick Contact Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-slate-900 mb-2">{t("support.liveChat")}</h3>
              <p className="text-slate-600 text-sm mb-4">
                {t("support.liveChatDesc")}
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500"
                onClick={onNavigateToMessages}
              >
                {t("support.startChat")}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-r from-green-600 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-slate-900 mb-2">{t("support.callUs")}</h3>
              <p className="text-slate-600 text-sm mb-4">
                {t("support.callUsDesc")}
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-500"
                onClick={() => window.location.href = 'tel:+18005550123'}
              >
                +1 (800) 555-0123
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-slate-900 mb-2">{t("support.emailSupport")}</h3>
              <p className="text-slate-600 text-sm mb-4">
                {t("support.emailSupportDesc")}
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500"
                onClick={() => window.location.href = 'mailto:support@gorent.com'}
              >
                support@gorent.com
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="articles" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 h-auto">
            <TabsTrigger value="articles">{t("support.helpArticles")}</TabsTrigger>
            <TabsTrigger value="faq">{t("support.faq")}</TabsTrigger>
            <TabsTrigger value="ticket">{t("support.submitTicket")}</TabsTrigger>
          </TabsList>

          {/* Help Articles Tab */}
          <TabsContent value="articles">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-slate-900 mb-6">{t("support.helpArticles")}</h2>
              
              {getFilteredArticles().length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredArticles().map((article, index) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card 
                        className="hover:shadow-lg transition-shadow cursor-pointer h-full group"
                        onClick={() => {
                          setSelectedArticle(article);
                          setShowArticleDialog(true);
                        }}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center text-blue-600">
                              {article.icon}
                            </div>
                            {article.popular && (
                              <Badge className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700">
                                {t("support.popular")}
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {t(`support.${article.titleKey}`)}
                          </h3>
                          <p className="text-slate-600 text-sm mb-4">
                            {t(`support.${article.descriptionKey}`)}
                          </p>
                          <Button variant="ghost" size="sm" className="gap-2 p-0 h-auto">
                            {t("support.readMore")}
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-slate-900 mb-2">{t("support.noArticlesFound")}</h3>
                    <p className="text-slate-600">
                      {t("support.noArticlesDesc")}
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-slate-900 mb-6">{t("support.frequentlyAsked")}</h2>

              {getFilteredFAQs().length > 0 ? (
                <div className="space-y-4 max-w-4xl">
                  <AnimatePresence>
                    {getFilteredFAQs().map((faq, index) => (
                      <motion.div
                        key={faq.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                      >
                        <Card className="overflow-hidden">
                          <button
                            onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                            className="w-full text-left p-6 hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="text-slate-900 mb-1">{t(`support.${faq.questionKey}`)}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {t(`support.${categories.find(c => c.value === faq.category)?.labelKey || "general"}`)}
                                </Badge>
                              </div>
                              {expandedFAQ === faq.id ? (
                                <ChevronUp className="h-5 w-5 text-slate-400 flex-shrink-0 mt-1" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-slate-400 flex-shrink-0 mt-1" />
                              )}
                            </div>
                          </button>
                          
                          <AnimatePresence>
                            {expandedFAQ === faq.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Separator />
                                <div className="p-6 bg-slate-50">
                                  <p className="text-slate-700 leading-relaxed">
                                    {t(`support.${faq.answerKey}`)}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <HelpCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-slate-900 mb-2">{t("support.noFaqFound")}</h3>
                    <p className="text-slate-600">
                      {t("support.noFaqDesc")}
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          {/* Submit Ticket Tab */}
          <TabsContent value="ticket">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <Card>
                <CardHeader>
                  <CardTitle>{t("support.submitTicketTitle")}</CardTitle>
                  <CardDescription>
                    {t("support.submitTicketDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ticketSubmitted ? (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>{t("support.ticketSuccess")}</strong>
                        <p className="mt-2">
                          {t("support.ticketSuccessDesc")}
                          {t("support.ticketReference")} #GR-{Date.now().toString().slice(-6)}
                        </p>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <form onSubmit={handleSubmitTicket} className="space-y-6">
                      <div>
                        <Label htmlFor="category">{t("support.category")}</Label>
                        <Select value={ticketCategory} onValueChange={setTicketCategory} required>
                          <SelectTrigger id="category" className="mt-2">
                            <SelectValue placeholder={t("support.selectCategory")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="booking">{t("support.bookingIssue")}</SelectItem>
                            <SelectItem value="payment">{t("support.paymentProblem")}</SelectItem>
                            <SelectItem value="account">{t("support.accountQuestion")}</SelectItem>
                            <SelectItem value="technical">{t("support.technicalIssue")}</SelectItem>
                            <SelectItem value="host">{t("support.hostCommunication")}</SelectItem>
                            <SelectItem value="other">{t("support.other")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="subject">{t("support.subject")}</Label>
                        <Input
                          id="subject"
                          type="text"
                          placeholder={t("support.subjectPlaceholder")}
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          required
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="message">{t("support.message")}</Label>
                        <Textarea
                          id="message"
                          placeholder={t("support.messagePlaceholder")}
                          value={ticketMessage}
                          onChange={(e) => setTicketMessage(e.target.value)}
                          required
                          rows={8}
                          className="mt-2"
                        />
                      </div>

                      <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                          {t("support.averageResponse")}
                        </AlertDescription>
                      </Alert>

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 gap-2"
                      >
                        <Send className="h-4 w-4" />
                        {t("support.submitButton")}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Additional Info */}
              <Card className="mt-6 bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0" />
                    <div>
                      <h4 className="text-slate-900 mb-2">{t("support.needImmediate")}</h4>
                      <p className="text-slate-600 text-sm mb-3">
                        {t("support.urgentIssues")}{" "}
                        <strong>+1 (800) 555-0123</strong>
                      </p>
                      <p className="text-slate-600 text-sm">
                        {t("support.businessHours")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Article Detail Dialog */}
        <Dialog open={showArticleDialog} onOpenChange={setShowArticleDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedArticle && (
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center text-blue-600">
                    {selectedArticle.icon}
                  </div>
                )}
                {selectedArticle && t(`support.${selectedArticle.titleKey}`)}
              </DialogTitle>
              <DialogDescription>
                {selectedArticle && t(`support.${selectedArticle.descriptionKey}`)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {selectedArticle?.id === 1 && (
                <>
                  <div>
                    <h4 className="text-slate-900 mb-3">{t("support.stepByStepGuide")}</h4>
                    <ol className="space-y-3 text-slate-700">
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
                        <div>
                          <strong>{t("support.step1")}</strong> {t("support.step1Desc")}
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
                        <div>
                          <strong>{t("support.step2")}</strong> {t("support.step2Desc")}
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
                        <div>
                          <strong>{t("support.step3")}</strong> {t("support.step3Desc")}
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">4</span>
                        <div>
                          <strong>{t("support.step4")}</strong> {t("support.step4Desc")}
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">5</span>
                        <div>
                          <strong>{t("support.step5")}</strong> {t("support.step5Desc")}
                        </div>
                      </li>
                    </ol>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
