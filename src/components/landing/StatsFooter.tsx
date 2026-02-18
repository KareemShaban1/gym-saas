import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { TranslationKey } from "@/i18n/translations";

const statKeys: { value: string; labelKey: TranslationKey }[] = [
  { value: "500+", labelKey: "gymsRegistered" },
  { value: "50K+", labelKey: "activeMembers" },
  { value: "1M+", labelKey: "checkInsTracked" },
  { value: "99.9%", labelKey: "uptime" },
];

const StatsSection = () => {
  const { t } = useLanguage();
  return (
    <section className="py-10 sm:py-14 md:py-16 lg:py-20 bg-card border-y border-border">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {statKeys.map((stat, i) => (
            <motion.div key={stat.labelKey} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center px-2 sm:px-0">
              <div className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gradient-gold mb-0.5 sm:mb-1">{stat.value}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{t(stat.labelKey)}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const footerLinkKeys = [
  { to: "/login", labelKey: "gymLogin" as const },
  { to: "/register-gym", labelKey: "registerGym" as const },
  { to: "/member/login", labelKey: "memberPortal" as const },
  { to: "/trainer/login", labelKey: "trainerPortal" as const },
] as const;

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="py-8 sm:py-10 md:py-12 bg-dark border-t border-dark-border">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-center sm:text-left">
            <Link to="/" className="flex items-center gap-2 justify-center sm:justify-start">
              <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center shrink-0">
                <Dumbbell className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-base sm:text-lg font-bold text-sidebar-foreground">GymFlow</span>
            </Link>
            <nav className="flex flex-wrap items-center justify-center sm:justify-end gap-x-5 gap-y-1 text-xs sm:text-sm text-sidebar-foreground/60">
              {footerLinkKeys.map(({ to, labelKey }) => (
                <Link key={to} to={to} className="hover:text-gold transition-colors">
                  {t(labelKey)}
                </Link>
              ))}
            </nav>
          </div>
          <p className="text-xs sm:text-sm text-sidebar-foreground/40 text-center sm:text-left">{t("allRightsReserved")}</p>
        </div>
      </div>
    </footer>
  );
};

export { StatsSection, Footer };
