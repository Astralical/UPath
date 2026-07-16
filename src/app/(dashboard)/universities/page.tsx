"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLang } from "@/lib/LanguageContext";
import { Search, MapPin, Globe, ExternalLink, ChevronRight } from "lucide-react";

export default function UniversitiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, lang } = useLang();
  const [universities, setUniversities] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUniversities = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (country) params.set("country", country);
    const res = await fetch("/api/universities?" + params);
    if (res.ok) setUniversities(await res.json());
    setLoading(false);
  }, [query, country]);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") fetchUniversities();
  }, [status, router, fetchUniversities]);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-[50vh]"><p className="text-gray-500">{t("common.loading")}</p></div>;
  }
  if (status === "unauthenticated") return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("universities.title")}</h1>
        <p className="text-gray-500 mt-1">{t("universities.subtitle")}</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={(e) => { e.preventDefault(); fetchUniversities(); }} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder={t("universities.searchPlaceholder")} value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
            </div>
            <Input placeholder={t("universities.countryFilter")} value={country} onChange={(e) => setCountry(e.target.value)} className="max-w-[200px]" />
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">{t("universities.searchButton")}</button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <Card><CardContent className="py-12 text-center text-gray-500">{t("common.loading")}</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {universities.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-gray-500">{t("universities.noResults")}</CardContent></Card>
          ) : (
            universities.map((uni) => {
              const displayName = lang === "zh" && uni.nameZh ? uni.nameZh : uni.name;
              const subName = lang === "zh" && uni.nameZh && uni.name !== uni.nameZh ? uni.name : null;
              return (
                <Card key={uni.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{displayName}</h3>
                          {subName && <span className="text-sm text-gray-500">({subName})</span>}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{uni.city ? uni.city + ", " : ""}{uni.country}</span>
                          {uni.type && <Badge variant="secondary">{uni.type === "public" ? t("universities.public") : t("universities.private")}</Badge>}
                          <span className="flex items-center gap-1"><Globe className="h-3.5 w-3.5" />{uni._count?.majors || 0} {t("universities.majors")}</span>
                        </div>
                        {uni.description && <p className="text-sm text-gray-600 line-clamp-2 mb-3">{uni.description}</p>}
                        {uni.rankings?.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {uni.rankings.map((r: any) => (
                              <Badge key={r.id} variant={r.source === "QS" ? "default" : "outline"} className="text-xs">
                                {r.source === "QS" ? t("universities.qs") : r.source === "US_NEWS" ? t("universities.usNews") : r.source}: #{r.rank} ({r.year})
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {uni.website && (
                          <a href={uni.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700"><ExternalLink className="h-5 w-5" /></a>
                        )}
                        <Link href={"/universities/" + uni.id} className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm font-medium">
                          {t("universities.details")} <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
