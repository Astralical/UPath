"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/LanguageContext";
import { ArrowLeft, MapPin, Globe, ExternalLink, GraduationCap, DollarSign, FileText, BarChart3, Home } from "lucide-react";

export default function UniversityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, lang } = useLang();
  const [uni, setUni] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") {
      fetch(`/api/universities/${id}`)
        .then((r) => r.json())
        .then((data) => { setUni(data); setLoading(false); });
    }
  }, [id, status, router]);

  if (status === "loading" || loading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><p className="text-gray-500">{t("common.loading")}</p></div>;
  }
  if (!uni) return <div className="text-center py-12 text-gray-500">{t("universities.noResults")}</div>;

  const name = lang === "zh" && uni.nameZh ? uni.nameZh : uni.name;

  return (
    <div className="space-y-6 max-w-5xl">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" />
        {t("common.back")}
      </button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
        {lang === "zh" && uni.nameZh && uni.name !== uni.nameZh && (
          <p className="text-lg text-gray-500 mt-1">{uni.name}</p>
        )}
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 flex-wrap">
          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{uni.city ? `${uni.city}, ` : ""}{uni.country}</span>
          {uni.type && <Badge variant="secondary">{uni.type === "public" ? t("universities.public") : t("universities.private")}</Badge>}
          {uni.foundedYear && <span>{t("universities.founded")}: {uni.foundedYear}</span>}
          {uni.website && (
            <a href={uni.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary-600 hover:text-primary-700">
              <ExternalLink className="h-4 w-4" />{t("universities.website")}
            </a>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {uni.description && (
            <Card>
              <CardHeader><CardTitle>{t("universities.overview")}</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-gray-600 leading-relaxed">{uni.description}</p></CardContent>
            </Card>
          )}

          {/* Programs / Majors */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary-600" />{t("universities.programs")}</CardTitle></CardHeader>
            <CardContent>
              {uni.majors?.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {uni.majors.map((m: any) => (
                    <div key={m.id} className="p-3 rounded-lg bg-gray-50 text-sm">
                      <p className="font-medium">{m.name}</p>
                      {m.category && <p className="text-xs text-gray-500 mt-0.5">{m.category} - {m.degreeLevel}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">{t("common.noData")}</p>
              )}
            </CardContent>
          </Card>

          {/* Application Process */}
          {uni.applicationProcess && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary-600" />{t("universities.applicationProcess")}</CardTitle></CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{uni.applicationProcess}</div>
              </CardContent>
            </Card>
          )}

          {/* Rankings */}
          {uni.rankings?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary-600" />{t("universities.rankings")}</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {uni.rankings.map((r: any) => (
                    <div key={r.id} className="text-center p-3 rounded-lg bg-gray-50">
                      <p className="text-xs text-gray-500">
                        {r.source === "QS" ? t("universities.qs") : r.source === "US_NEWS" ? t("universities.usNews") : r.source}
                      </p>
                      <p className="text-2xl font-bold text-primary-600">#{r.rank}</p>
                      <p className="text-xs text-gray-400">{r.year}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Admissions Stats */}
          <Card>
            <CardHeader><CardTitle>{t("universities.admissions")}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {uni.acceptanceRate != null && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t("universities.acceptanceRate")}</span>
                  <span className="font-semibold">{uni.acceptanceRate}%</span>
                </div>
              )}
              {uni.studentCount && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t("universities.students")}</span>
                  <span className="font-semibold">{uni.studentCount.toLocaleString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Scores */}
          {(uni.avgSAT || uni.avgACT || uni.avgIELTS || uni.avgTOEFL || uni.avgGPA) && (
            <Card>
              <CardHeader><CardTitle>{t("universities.avgScores")}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {uni.avgSAT && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t("universities.sat")}</span>
                    <span className="font-semibold">{uni.avgSAT}</span>
                  </div>
                )}
                {uni.avgACT && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t("universities.act")}</span>
                    <span className="font-semibold">{uni.avgACT}</span>
                  </div>
                )}
                {uni.avgIELTS && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t("universities.ielts")}</span>
                    <span className="font-semibold">{uni.avgIELTS}</span>
                  </div>
                )}
                {uni.avgTOEFL && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t("universities.toefl")}</span>
                    <span className="font-semibold">{uni.avgTOEFL}</span>
                  </div>
                )}
                {uni.avgGPA && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t("universities.gpa")}</span>
                    <span className="font-semibold">{uni.avgGPA}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tuition */}
          {(uni.tuitionDomestic || uni.tuitionInternational || uni.livingCost) && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary-600" />{t("universities.tuition")}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {uni.tuitionDomestic && (
                  <div>
                    <p className="text-xs text-gray-500">{t("universities.tuitionFee")} ({t("universities.country")})</p>
                    <p className="text-lg font-semibold">${uni.tuitionDomestic.toLocaleString()}</p>
                  </div>
                )}
                {uni.tuitionInternational && (
                  <div>
                    <p className="text-xs text-gray-500">{t("universities.tuitionFee")} (International)</p>
                    <p className="text-lg font-semibold">${uni.tuitionInternational.toLocaleString()}</p>
                  </div>
                )}
                {uni.livingCost && (
                  <div>
                    <p className="text-xs text-gray-500">{t("universities.livingCost")}</p>
                    <p className="text-lg font-semibold">${uni.livingCost.toLocaleString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Deadlines */}
          {uni.applicationDeadlines && (
            <Card>
              <CardHeader><CardTitle>{t("universities.applicationProcess")}</CardTitle></CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 whitespace-pre-wrap">{uni.applicationDeadlines}</div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
