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
    <section className="py-20 bg-card border-y border-border">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {statKeys.map((stat, i) => (
            <motion.div key={stat.labelKey} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <div className="text-3xl sm:text-4xl font-display font-bold text-gradient-gold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{t(stat.labelKey)}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="py-12 bg-dark border-t border-dark-border">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold text-sidebar-foreground">GymFlow</span>
          </Link>
          <p className="text-sm text-sidebar-foreground/40">{t("allRightsReserved")}</p>
        </div>
      </div>
    </footer>
  );
};

export { StatsSection, Footer };
