"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { useLang } from "@/lib/LanguageContext";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLang();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || t("auth.registerFailed")); setLoading(false); return; }
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) { setError(result.error); }
    else { router.push("/dashboard"); router.refresh(); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <GraduationCap className="h-7 w-7 text-primary-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">{t("auth.registerTitle")}</CardTitle>
          <CardDescription>{t("auth.registerSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="name">{t("auth.name")}</Label>
              <Input id="name" placeholder={t("auth.namePlaceholder")} value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input id="email" type="email" placeholder={t("auth.emailPlaceholder")} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input id="password" type="password" placeholder={t("auth.passwordPlaceholder")} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div className="space-y-2">
              <Label>{t("auth.role")}</Label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setRole("STUDENT")} className={"flex-1 p-3 rounded-lg border-2 text-sm font-medium transition-all " + (role === "STUDENT" ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-600 hover:border-gray-300")}>{t("auth.student")}</button>
                <button type="button" onClick={() => setRole("TEACHER")} className={"flex-1 p-3 rounded-lg border-2 text-sm font-medium transition-all " + (role === "TEACHER" ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-600 hover:border-gray-300")}>{t("auth.teacher")}</button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("auth.signingUp") : t("common.register")}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-600">
            {t("auth.hasAccount")}{" "}
            <Link href="/register" className="text-primary-600 hover:underline font-medium">{t("auth.loginLink")}</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
