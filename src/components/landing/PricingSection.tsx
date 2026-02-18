import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { pricingPlans } from "@/data/landing";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";
import { TranslationKey } from "@/i18n/translations";

const planKeys: { nameKey: TranslationKey; descKey: TranslationKey }[] = [
  { nameKey: "planBasic", descKey: "planBasicDesc" },
  { nameKey: "planPro", descKey: "planProDesc" },
  { nameKey: "planEnterprise", descKey: "planEnterpriseDesc" },
];

const PricingSection = () => {
  const { t } = useLanguage();

  return (
    <section id="pricing" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-dark">
      <div className="container px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 sm:mb-14 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-sidebar-foreground mb-3 sm:mb-4">{t("simpleTransparentPricing")}</h2>
          <p className="text-sidebar-foreground/60 text-base sm:text-lg max-w-2xl mx-auto px-2">{t("pricingSubtitle")}</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className={cn("relative rounded-2xl p-5 sm:p-6 md:p-8 border transition-all duration-300", plan.highlighted ? "border-gold/50 bg-dark-card glow-gold md:scale-105" : "border-dark-border bg-dark-card hover:border-dark-border/80")}>
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-gold text-sm font-semibold text-primary-foreground">{t("mostPopular")}</div>
              )}
              <h3 className="font-display text-lg sm:text-xl font-bold text-sidebar-foreground mb-1.5 sm:mb-2">{t(planKeys[i].nameKey)}</h3>
              <p className="text-sidebar-foreground/50 text-xs sm:text-sm mb-4 sm:mb-6">{t(planKeys[i].descKey)}</p>
              <div className="flex items-baseline gap-1 mb-5 sm:mb-6 md:mb-8">
                <span className="text-3xl sm:text-4xl font-bold text-sidebar-foreground">{plan.price}</span>
                <span className="text-sidebar-foreground/50 text-xs sm:text-sm">{plan.currency}{plan.period}</span>
              </div>
              <ul className="space-y-2 sm:space-y-3 mb-5 sm:mb-6 md:mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-sidebar-foreground/70">
                    <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button variant={plan.highlighted ? "hero" : "hero-outline"} className="w-full">{t("getStarted")}</Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
