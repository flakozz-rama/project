import { useState } from "react";
import { motion } from "motion/react";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Home,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { useLanguage } from "../context/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface SignUpProps {
  onBack?: () => void;
  onLogin?: () => void;
  onSignUpSuccess?: () => void;
}

export function SignUp({ onBack, onLogin, onSignUpSuccess }: SignUpProps) {
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "guest" as "guest" | "host",
    agreeToTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t("signup.errors.firstNameRequired");
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t("signup.errors.lastNameRequired");
    }

    if (!formData.email.trim()) {
      newErrors.email = t("signup.errors.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t("signup.errors.invalidEmailFormat");
    }

    if (!formData.password) {
      newErrors.password = t("signup.errors.passwordRequired");
    } else if (formData.password.length < 8) {
      newErrors.password = t("signup.errors.passwordLength");
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = t("signup.errors.passwordComplexity");
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t("signup.errors.confirmPasswordRequired");
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("signup.errors.passwordMismatch");
    }

    if (!formData.agreeToTerms) {
      newErrors.terms = t("signup.errors.termsRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage(t("signup.successMessage"));
      
      setTimeout(() => {
        onSignUpSuccess?.();
      }, 2000);
    }, 1500);
  };

  const handleSocialSignUp = (provider: string) => {
    console.log(`Sign up with ${provider}`);
    // Implement social auth here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50 flex items-center justify-center p-4 relative">
      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>
      
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >
            <div className="space-y-8">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Home className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl text-slate-900">GoRent</span>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-5xl text-slate-900 mb-4">
                  {t("signup.welcomeTitle")}
                </h1>
                <p className="text-xl text-slate-600">
                  {t("signup.welcomeSubtitle")}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                {[0, 1, 2, 3, 4].map((index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-slate-700">{t(`signup.features.${index}`)}</span>
                  </motion.div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                {[
                  { number: "50K+", label: t("signup.stats.properties") },
                  { number: "100K+", label: t("signup.stats.users") },
                  { number: "4.9", label: t("signup.stats.rating") }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-3xl text-slate-900 mb-1">{stat.number}</div>
                    <div className="text-sm text-slate-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Side - Sign Up Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="shadow-2xl border-0">
              <CardHeader className="space-y-1 pb-6">
                {/* Mobile Logo */}
                <div className="flex lg:hidden items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Home className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-2xl text-slate-900">GoRent</span>
                </div>

                <CardTitle className="text-slate-900">{t("signup.title")}</CardTitle>
                <CardDescription>
                  {t("signup.subtitle")}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        {successMessage}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {/* Account Type Selection */}
                <div className="space-y-2">
                  <Label>{t("signup.accountType")}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, accountType: "guest" })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.accountType === "guest"
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-center">
                        <User className={`h-6 w-6 mx-auto mb-2 ${
                          formData.accountType === "guest" ? "text-blue-600" : "text-slate-400"
                        }`} />
                        <div className={`font-medium ${
                          formData.accountType === "guest" ? "text-blue-900" : "text-slate-700"
                        }`}>
                          {t("signup.findPlace")}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{t("signup.guestAccount")}</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, accountType: "host" })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.accountType === "host"
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-center">
                        <Home className={`h-6 w-6 mx-auto mb-2 ${
                          formData.accountType === "host" ? "text-blue-600" : "text-slate-400"
                        }`} />
                        <div className={`font-medium ${
                          formData.accountType === "host" ? "text-blue-900" : "text-slate-700"
                        }`}>
                          {t("signup.listProperty")}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{t("signup.hostAccount")}</div>
                      </div>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t("signup.firstName")}</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="firstName"
                          type="text"
                          placeholder={t("signup.firstNamePlaceholder")}
                          className={`pl-10 ${errors.firstName ? "border-red-500" : ""}`}
                          value={formData.firstName}
                          onChange={(e) => {
                            setFormData({ ...formData, firstName: e.target.value });
                            setErrors({ ...errors, firstName: "" });
                          }}
                        />
                      </div>
                      {errors.firstName && (
                        <p className="text-xs text-red-500">{errors.firstName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t("signup.lastName")}</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="lastName"
                          type="text"
                          placeholder={t("signup.lastNamePlaceholder")}
                          className={`pl-10 ${errors.lastName ? "border-red-500" : ""}`}
                          value={formData.lastName}
                          onChange={(e) => {
                            setFormData({ ...formData, lastName: e.target.value });
                            setErrors({ ...errors, lastName: "" });
                          }}
                        />
                      </div>
                      {errors.lastName && (
                        <p className="text-xs text-red-500">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("signup.email")}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("signup.emailPlaceholder")}
                        className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          setErrors({ ...errors, email: "" });
                        }}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-500">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">{t("signup.password")}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t("signup.passwordPlaceholder")}
                        className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({ ...formData, password: e.target.value });
                          setErrors({ ...errors, password: "" });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-500">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t("signup.confirmPassword")}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t("signup.confirmPasswordPlaceholder")}
                        className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                        value={formData.confirmPassword}
                        onChange={(e) => {
                          setFormData({ ...formData, confirmPassword: e.target.value });
                          setErrors({ ...errors, confirmPassword: "" });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => {
                          const strength = 
                            formData.password.length < 8 ? 1 :
                            !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password) ? 2 :
                            formData.password.length < 12 ? 3 : 4;
                          
                          return (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                level <= strength
                                  ? strength === 1 ? "bg-red-500" :
                                    strength === 2 ? "bg-orange-500" :
                                    strength === 3 ? "bg-yellow-500" :
                                    "bg-green-500"
                                  : "bg-slate-200"
                              }`}
                            />
                          );
                        })}
                      </div>
                      <p className="text-xs text-slate-600">
                        {t("signup.passwordStrength.label")} {
                          formData.password.length < 8 ? t("signup.passwordStrength.weak") :
                          !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password) ? t("signup.passwordStrength.fair") :
                          formData.password.length < 12 ? t("signup.passwordStrength.good") : t("signup.passwordStrength.strong")
                        }
                      </p>
                    </div>
                  )}

                  {/* Terms and Conditions */}
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => {
                        setFormData({ ...formData, agreeToTerms: checked as boolean });
                        setErrors({ ...errors, terms: "" });
                      }}
                      className={errors.terms ? "border-red-500" : ""}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="terms"
                        className="text-sm text-slate-700 cursor-pointer"
                      >
                        {t("signup.agreeToTerms")}{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          {t("signup.termsOfService")}
                        </a>{" "}
                        {t("signup.and")}{" "}
                        <a href="#" className="text-blue-600 hover:underline">
                          {t("signup.privacyPolicy")}
                        </a>
                      </label>
                      {errors.terms && (
                        <p className="text-xs text-red-500 mt-1">{errors.terms}</p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      t("signup.creatingAccount")
                    ) : (
                      <>
                        {t("signup.createAccount")}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative">
                  <Separator />
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-slate-500">
                    {t("signup.orContinueWith")}
                  </span>
                </div>

                {/* Social Sign Up */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialSignUp("google")}
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {t("signup.google")}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialSignUp("facebook")}
                  >
                    <svg className="h-5 w-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    {t("signup.facebook")}
                  </Button>
                </div>

                {/* Login Link */}
                <div className="text-center">
                  <span className="text-sm text-slate-600">
                    {t("signup.alreadyHaveAccount")}{" "}
                    <button
                      type="button"
                      onClick={onLogin}
                      className="text-blue-600 hover:underline"
                    >
                      {t("signup.signIn")}
                    </button>
                  </span>
                </div>

                {/* Back to Home */}
                {onBack && (
                  <div className="text-center pt-4">
                    <button
                      type="button"
                      onClick={onBack}
                      className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      ← {t("signup.backToHome")}
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}