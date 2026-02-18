import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { Dumbbell, Users, CreditCard, QrCode, BarChart3, Globe, Shield, Zap } from "lucide-react";
import { TranslationKey } from "@/i18n/translations";

const featureData: { icon: typeof Users; titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { icon: Users, titleKey: "featureMemberMgmt", descKey: "featureMemberMgmtDesc" },
  { icon: Dumbbell, titleKey: "featureWorkouts", descKey: "featureWorkoutsDesc" },
  { icon: CreditCard, titleKey: "featureBilling", descKey: "featureBillingDesc" },
  { icon: QrCode, titleKey: "featureQR", descKey: "featureQRDesc" },
  { icon: BarChart3, titleKey: "featureReports", descKey: "featureReportsDesc" },
  { icon: Globe, titleKey: "featureArabic", descKey: "featureArabicDesc" },
  { icon: Shield, titleKey: "featureSecurity", descKey: "featureSecurityDesc" },
  { icon: Zap, titleKey: "featureReminders", descKey: "featureRemindersDesc" },
];

const FeaturesSection = () => {
  const { t } = useLanguage();

  return (
    <section id="features" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-background">
      <div className="container px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 sm:mb-14 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3 sm:mb-4">{t("everythingYourGymNeeds")}</h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-2">{t("featuresSubtitle")}</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {featureData.map((feature, i) => (
            <motion.div key={feature.titleKey} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="group p-4 sm:p-5 md:p-6 rounded-xl border border-border bg-card hover:border-gold/30 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-accent flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-gold/10 transition-colors">
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-accent-foreground group-hover:text-gold transition-colors" />
              </div>
              <h3 className="font-display font-semibold text-base sm:text-lg mb-1.5 sm:mb-2">{t(feature.titleKey)}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{t(feature.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
