import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { Building2, User, Dumbbell, ArrowRight, LogIn, UserPlus } from "lucide-react";

const portalCards = [
  {
    key: "gym" as const,
    icon: Building2,
    loginPath: "/login",
    registerPath: "/register-gym",
    registerLabelKey: "registerGym" as const,
    hasRegister: true,
  },
  {
    key: "member" as const,
    icon: User,
    loginPath: "/member/login",
    registerPath: null,
    registerLabelKey: null,
    hasRegister: false,
  },
  {
    key: "trainer" as const,
    icon: Dumbbell,
    loginPath: "/trainer/login",
    registerPath: "/trainer/register",
    registerLabelKey: "createAccount" as const,
    hasRegister: true,
  },
] as const;

const PortalSection = () => {
  const { t } = useLanguage();

  const titleKey = { gym: "landingGymOwner", member: "landingMember", trainer: "landingTrainer" } as const;
  const descKey = { gym: "landingGymOwnerDesc", member: "landingMemberDesc", trainer: "landingTrainerDesc" } as const;

  return (
    <section id="portals" className="py-14 sm:py-18 md:py-24 bg-dark border-y border-dark-border">
      <div className="container px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12 md:mb-14"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-sidebar-foreground mb-2 sm:mb-3">
            {t("landingWhoAreYou")}
          </h2>
          <p className="text-sidebar-foreground/60 text-sm sm:text-base max-w-xl mx-auto">
            {t("heroDescription").split(".")[0]}.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {portalCards.map((card, i) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative rounded-2xl border border-dark-border bg-dark-card p-6 sm:p-7 hover:border-gold/40 hover:shadow-xl hover:shadow-gold/5 transition-all duration-300 flex flex-col"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:bg-gold/20 transition-colors">
                <card.icon className="w-6 h-6 sm:w-7 sm:h-7 text-gold" />
              </div>
              <h3 className="font-display font-semibold text-lg sm:text-xl text-sidebar-foreground mb-2">
                {t(titleKey[card.key])}
              </h3>
              <p className="text-sidebar-foreground/60 text-sm mb-6 flex-1">
                {t(descKey[card.key])}
              </p>
              <div className="flex flex-col gap-2">
                <Button variant="hero" size="sm" className="w-full gap-2" asChild>
                  <Link to={card.loginPath}>
                    <LogIn className="w-4 h-4" />
                    {t("signInGym")}
                    <ArrowRight className="w-4 h-4 ms-auto" />
                  </Link>
                </Button>
                {card.hasRegister && card.registerPath && card.registerLabelKey && (
                  <Button variant="hero-outline" size="sm" className="w-full gap-2" asChild>
                    <Link to={card.registerPath}>
                      <UserPlus className="w-4 h-4" />
                      {t(card.registerLabelKey)}
                    </Link>
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortalSection;
