"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/LanguageContext";
import { translations } from "@/lib/i18n";
import { GraduationCap, Search, Calendar, FileText, BookOpen, Users, ArrowRight, CheckCircle, BarChart3, MessageSquare } from "lucide-react";

export default function HomePage() {
  const { t, lang } = useLang();
  const dict = translations[lang];

  const features = [
    { icon: Search, titleKey: "features.universitySearch", descKey: "features.universitySearchDesc" },
    { icon: FileText, titleKey: "features.workspace", descKey: "features.workspaceDesc" },
    { icon: Calendar, titleKey: "features.calendar", descKey: "features.calendarDesc" },
    { icon: BookOpen, titleKey: "features.testPrep", descKey: "features.testPrepDesc" },
    { icon: Users, titleKey: "features.collaboration", descKey: "features.collaborationDesc" },
    { icon: BarChart3, titleKey: "features.appTracking", descKey: "features.appTrackingDesc" },
    { icon: MessageSquare, titleKey: "features.messaging", descKey: "features.messagingDesc" },
    { icon: GraduationCap, titleKey: "features.scholarships", descKey: "features.scholarshipsDesc" },
  ];

  const getRoleItems = (itemsKey: string): string[] => {
    const parts = itemsKey.split(".");
    let current: any = dict;
    for (const part of parts) current = current?.[part];
    return Array.isArray(current) ? current : [];
  };

  const roles = [
    { icon: GraduationCap, titleKey: "roles.student.title", itemsKey: "roles.student.items" },
    { icon: Users, titleKey: "roles.teacher.title", itemsKey: "roles.teacher.items" },
    { icon: BarChart3, titleKey: "roles.admin.title", itemsKey: "roles.admin.items" },
  ];

  return (
    <div className="min-h-screen">
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">UPath</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login"><Button variant="ghost">{t("common.login")}</Button></Link>
              <Link href="/register"><Button>{t("common.register")}</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 py-20 lg:py-28">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1.5 text-sm text-primary-700 mb-8">
              {t("common.tagline")}
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              {t("landing.heroTitle")}
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              {t("landing.heroSubtitle")}
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8">
                  {t("landing.startFree")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  {t("landing.alreadyAccount")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("landing.featuresTitle")}</h2>
            <p className="text-lg text-gray-600">{t("landing.featuresSubtitle")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.titleKey} className="group relative p-6 rounded-2xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t(feature.titleKey)}</h3>
                <p className="text-sm text-gray-600">{t(feature.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("landing.rolesTitle")}</h2>
            <p className="text-lg text-gray-600">{t("landing.rolesSubtitle")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((role) => (
              <div key={role.titleKey} className="bg-white rounded-2xl border border-gray-200 p-8 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-6">
                  <role.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t(role.titleKey)}</h3>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  {getRoleItems(role.itemsKey).map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "500+", label: t("landing.statsAgencies") },
              { value: "5000+", label: t("landing.statsUniversities") },
              { value: "50,000+", label: t("landing.statsQuestions") },
              { value: "99.9%", label: t("landing.statsUptime") },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-primary-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("landing.ctaTitle")}</h2>
          <p className="text-lg text-gray-600 mb-8">{t("landing.ctaSubtitle")}</p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">
              {t("landing.ctaButton")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>(c) 2024 UPath. {t("landing.footer")}</p>
        </div>
      </footer>
    </div>
  );
}
