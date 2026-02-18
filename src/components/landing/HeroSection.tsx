import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dumbbell, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-gym.jpg";
import { useLanguage } from "@/i18n/LanguageContext";

const Navbar = () => {
  const { t, language, setLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-xl border-b border-dark-border">
      <div className="container px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 sm:h-16">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-gold flex items-center justify-center">
            <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg sm:text-xl font-bold text-sidebar-foreground">GymFlow</span>
        </Link>
        <div className="hidden md:flex items-center gap-5 xl:gap-6">
          <a href="#features" className="text-sm text-sidebar-foreground/70 hover:text-gold transition-colors">{t("features")}</a>
          <a href="#pricing" className="text-sm text-sidebar-foreground/70 hover:text-gold transition-colors">{t("pricing")}</a>
          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="text-sm text-sidebar-foreground/70 hover:text-gold transition-colors font-medium"
          >
            {language === "en" ? "عربي" : "EN"}
          </button>
          <Link to="/member/login" className="text-sm text-sidebar-foreground/70 hover:text-gold transition-colors">{t("memberPortal")}</Link>
          <Link to="/trainer/login" className="text-sm text-sidebar-foreground/70 hover:text-gold transition-colors">{t("trainerPortal")}</Link>
          <Link to="/login">
            <Button variant="outline" size="sm" className="border-gold/50 text-gold hover:bg-gold/10">{t("gymLogin")}</Button>
          </Link>
          <Link to="/register-gym">
            <Button variant="hero" size="sm">{t("getStarted")}</Button>
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 md:hidden">
          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="text-sm text-sidebar-foreground/70 hover:text-gold transition-colors font-medium px-2"
          >
            {language === "en" ? "عربي" : "EN"}
          </button>
          <Button variant="ghost" size="icon" className="text-sidebar-foreground" onClick={() => setMobileMenuOpen((o) => !o)} aria-label="Menu">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="md:hidden overflow-hidden border-t border-dark-border bg-dark/95 backdrop-blur-xl">
            <div className="container px-4 py-4 flex flex-col gap-1">
              <a href="#features" className="py-3 text-sm text-sidebar-foreground/80 hover:text-gold transition-colors" onClick={() => setMobileMenuOpen(false)}>{t("features")}</a>
              <a href="#pricing" className="py-3 text-sm text-sidebar-foreground/80 hover:text-gold transition-colors" onClick={() => setMobileMenuOpen(false)}>{t("pricing")}</a>
              <Link to="/member/login" className="py-3 text-sm text-sidebar-foreground/80 hover:text-gold transition-colors" onClick={() => setMobileMenuOpen(false)}>{t("memberPortal")}</Link>
              <Link to="/trainer/login" className="py-3 text-sm text-sidebar-foreground/80 hover:text-gold transition-colors" onClick={() => setMobileMenuOpen(false)}>{t("trainerPortal")}</Link>
              <div className="flex gap-2 pt-3 mt-2 border-t border-dark-border">
                <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full border-gold/50 text-gold">{t("gymLogin")}</Button>
                </Link>
                <Link to="/register-gym" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="hero" size="sm" className="w-full">{t("getStarted")}</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const HeroSection = () => {
  const { t } = useLanguage();
  return (
    <section className="relative min-h-[100dvh] sm:min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImage} alt="Modern gym interior" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-dark/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
      </div>
      <div className="container relative z-10 pt-24 pb-12 sm:pt-28 sm:pb-16 px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 rounded-full border border-gold/30 bg-gold/10 mb-4 sm:mb-6">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-gold-light">{t("heroTagline")}</span>
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-sidebar-foreground leading-tight mb-4 sm:mb-6">
            {t("heroPowerYourGym")}{" "}<span className="text-gradient-gold">GymFlow</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-sidebar-foreground/60 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-1">
            {t("heroDescription")}
          </p>
          <p className="text-sm text-sidebar-foreground/50 mb-8 sm:mb-10">
            {t("heroForWhom")}
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
            <Link to="/register-gym" className="w-full sm:w-auto"><Button variant="hero" size="lg" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6">{t("startFreeTrial")}</Button></Link>
            <Link to="/login" className="w-full sm:w-auto"><Button variant="hero-outline" size="lg" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6">{t("signInGym")}</Button></Link>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-sidebar-foreground/60">
            <Link to="/member/login" className="hover:text-gold transition-colors">{t("memberPortal")}</Link>
            <span className="hidden sm:inline">·</span>
            <Link to="/trainer/login" className="hover:text-gold transition-colors">{t("trainerPortal")}</Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export { Navbar, HeroSection };
