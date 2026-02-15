import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-gym.jpg";
import { useLanguage } from "@/i18n/LanguageContext";

const Navbar = () => {
  const { t, language, setLanguage } = useLanguage();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-xl border-b border-dark-border">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-gold flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-sidebar-foreground">GymFlow</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm text-sidebar-foreground/70 hover:text-gold transition-colors">{t("features")}</a>
          <a href="#pricing" className="text-sm text-sidebar-foreground/70 hover:text-gold transition-colors">{t("pricing")}</a>
          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="text-sm text-sidebar-foreground/70 hover:text-gold transition-colors font-medium"
          >
            {language === "en" ? "عربي" : "EN"}
          </button>
          <Link to="/member/login" className="text-sm text-sidebar-foreground/70 hover:text-gold transition-colors">Member portal</Link>
          <Link to="/login">
            <Button variant="outline" size="sm" className="border-gold/50 text-gold hover:bg-gold/10">Sign in</Button>
          </Link>
          <Link to="/register-gym">
            <Button variant="hero" size="sm">{t("getStarted")}</Button>
          </Link>
        </div>
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setLanguage(language === "en" ? "ar" : "en")}
            className="text-sm text-sidebar-foreground/70 hover:text-gold transition-colors font-medium"
          >
            {language === "en" ? "عربي" : "EN"}
          </button>
          <Link to="/login">
            <Button variant="outline" size="sm" className="border-gold/50 text-gold">Sign in</Button>
          </Link>
          <Link to="/register-gym">
            <Button variant="hero" size="sm">{t("getStarted")}</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

const HeroSection = () => {
  const { t } = useLanguage();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroImage} alt="Modern gym interior" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-dark/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent" />
      </div>
      <div className="container relative z-10 pt-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/10 mb-6">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <span className="text-sm font-medium text-gold-light">{t("heroTagline")}</span>
          </motion.div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold text-sidebar-foreground leading-tight mb-6">
            {t("heroPowerYourGym")}{" "}<span className="text-gradient-gold">GymFlow</span>
          </h1>
          <p className="text-lg sm:text-xl text-sidebar-foreground/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t("heroDescription")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register-gym"><Button variant="hero" size="lg" className="text-base px-8 py-6">{t("startFreeTrial")}</Button></Link>
            <Link to="/login"><Button variant="hero-outline" size="lg" className="text-base px-8 py-6">Sign in</Button></Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export { Navbar, HeroSection };
