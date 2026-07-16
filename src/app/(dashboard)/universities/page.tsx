"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/LanguageContext";
import { Search, MapPin, Globe, ExternalLink, ChevronRight, ChevronLeft } from "lucide-react";

export default function UniversitiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, lang } = useLang();
  const [universities, setUniversities] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUniversities = useCallback(async (p?: number) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (country) params.set("country", country);
    params.set("page", String(p || page));
    params.set("pageSize", "20");
    const res = await fetch("/api/universities?" + params);
    if (res.ok) {
      const data = await res.json();
      setUniversities(data.universities);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    }
    setLoading(false);
  }, [query, country, page]);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") fetchUniversities();
  }, [status, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUniversities(1);
  };

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-[50vh]"><p className="text-gray-500">{t("common.loading")}</p></div>;
  }
  if (status === "unauthenticated") return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("universities.title")}</h1>
        <p className="text-gray-500 mt-1">{t("universities.subtitle")} — {total} universities</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-3">
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
        <div className="grid gap-4">{Array(5).fill(0).map((_,i)=><div key={i} className="h-32 bg-gray-50 rounded-xl animate-pulse"/>)}</div>
      ) : (
        <>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { const p = page-1; setPage(p); fetchUniversities(p); }}><ChevronLeft className="h-4 w-4 mr-1"/>Prev</Button>
              <span className="text-sm text-gray-500 px-3">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => { const p = page+1; setPage(p); fetchUniversities(p); }}>Next<ChevronRight className="h-4 w-4 ml-1"/></Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
