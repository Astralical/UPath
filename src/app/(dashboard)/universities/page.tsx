"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Globe, ExternalLink } from "lucide-react";

export default function UniversitiesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [universities, setUniversities] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUniversities = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (country) params.set("country", country);
    const res = await fetch(`/api/universities?${params}`);
    if (res.ok) setUniversities(await res.json());
    setLoading(false);
  }, [query, country]);

  useEffect(() => {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    fetchUniversities();
  }, [session, router, fetchUniversities]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUniversities();
  };

  if (!session?.user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">大学搜索</h1>
        <p className="text-gray-500 mt-1">搜索全球大学，查看排名和专业信息</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                name="q"
                placeholder="搜索大学名称、中文名或国家..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              name="country"
              placeholder="国家筛选"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="max-w-[200px]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              搜索
            </button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">加载中...</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {universities.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">未找到匹配的大学</CardContent>
            </Card>
          ) : (
            universities.map((uni) => (
              <Card key={uni.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{uni.name}</h3>
                        {uni.nameZh && (
                          <span className="text-sm text-gray-500">({uni.nameZh})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {uni.city ? `${uni.city}, ` : ""}{uni.country}
                        </span>
                        {uni.type && <Badge variant="secondary">{uni.type === "public" ? "公立" : "私立"}</Badge>}
                        <span className="flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5" />
                          {uni._count?.majors || 0} 个专业
                        </span>
                      </div>
                      {uni.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{uni.description}</p>
                      )}
                      {uni.rankings?.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {uni.rankings.map((r: any) => (
                            <Badge
                              key={r.id}
                              variant={r.source === "QS" ? "default" : "outline"}
                              className="text-xs"
                            >
                              {r.source === "QS" ? "QS" : r.source === "US_NEWS" ? "US News" : r.source}
                              : #{r.rank} ({r.year})
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    {uni.website && (
                      <a href={uni.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
