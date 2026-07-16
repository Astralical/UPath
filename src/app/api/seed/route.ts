import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Create test users
    const adminPassword = await bcrypt.hash("admin123", 12);
    const teacherPassword = await bcrypt.hash("teacher123", 12);
    const studentPassword = await bcrypt.hash("student123", 12);

    await prisma.user.upsert({ where: { email: "admin@upath.com" }, update: {}, create: { name: "System Admin", email: "admin@upath.com", password: adminPassword, role: "ADMIN" } });
    await prisma.user.upsert({ where: { email: "teacher@upath.com" }, update: {}, create: { name: "Zhang Laoshi", email: "teacher@upath.com", password: teacherPassword, role: "TEACHER" } });
    await prisma.user.upsert({ where: { email: "student@upath.com" }, update: {}, create: { name: "Xiao Ming", email: "student@upath.com", password: studentPassword, role: "STUDENT" } });

    // Seed universities
    const unis = [
      { name: "Harvard University", nameZh: "哈佛大学", country: "United States", city: "Cambridge", state: "Massachusetts", website: "https://www.harvard.edu", description: "Harvard University is a private Ivy League research university in Cambridge, Massachusetts.", type: "private", foundedYear: 1636, studentCount: 31000, acceptanceRate: 3.4, avgSAT: 1520, avgACT: 34, avgIELTS: 7.5, avgTOEFL: 104, avgGPA: 4.18, tuitionDomestic: 57261, tuitionInternational: 57261, livingCost: 19600 },
      { name: "Massachusetts Institute of Technology", nameZh: "麻省理工学院", country: "United States", city: "Cambridge", state: "Massachusetts", website: "https://www.mit.edu", description: "MIT is a private research university specializing in science, engineering, and technology.", type: "private", foundedYear: 1861, studentCount: 11934, acceptanceRate: 4.0, avgSAT: 1540, avgACT: 35, avgIELTS: 7.5, avgTOEFL: 100, avgGPA: 4.17, tuitionDomestic: 57986, tuitionInternational: 57986, livingCost: 18300 },
      { name: "Stanford University", nameZh: "斯坦福大学", country: "United States", city: "Stanford", state: "California", website: "https://www.stanford.edu", description: "Stanford University is a private research university in Silicon Valley.", type: "private", foundedYear: 1885, studentCount: 17300, acceptanceRate: 3.7, avgSAT: 1510, avgACT: 34, avgIELTS: 7.5, avgTOEFL: 105, avgGPA: 4.18, tuitionDomestic: 58416, tuitionInternational: 58416, livingCost: 19500 },
      { name: "University of Oxford", nameZh: "牛津大学", country: "United Kingdom", city: "Oxford", website: "https://www.ox.ac.uk", description: "The University of Oxford is a collegiate research university and the oldest in the English-speaking world.", type: "public", foundedYear: 1096, studentCount: 25500, acceptanceRate: 17.5, avgIELTS: 7.0, avgTOEFL: 100, avgGPA: 3.7, tuitionDomestic: 9250, tuitionInternational: 35080, livingCost: 14500 },
      { name: "University of Cambridge", nameZh: "剑桥大学", country: "United Kingdom", city: "Cambridge", website: "https://www.cam.ac.uk", description: "The University of Cambridge is a collegiate public research university.", type: "public", foundedYear: 1209, studentCount: 24200, acceptanceRate: 21.0, avgIELTS: 7.0, avgTOEFL: 100, avgGPA: 3.7, tuitionDomestic: 9250, tuitionInternational: 33825, livingCost: 14000 },
      { name: "Tsinghua University", nameZh: "清华大学", country: "China", city: "Beijing", website: "https://www.tsinghua.edu.cn", description: "Tsinghua University is a national public research university in Beijing.", type: "public", foundedYear: 1911, studentCount: 50000, acceptanceRate: 10.0, avgSAT: 1400, avgIELTS: 6.5, avgTOEFL: 90, avgGPA: 3.5, tuitionDomestic: 5000, tuitionInternational: 28000, livingCost: 8000 },
      { name: "Peking University", nameZh: "北京大学", country: "China", city: "Beijing", website: "https://www.pku.edu.cn", description: "Peking University is a national public research university.", type: "public", foundedYear: 1898, studentCount: 45000, acceptanceRate: 12.0, avgSAT: 1380, avgIELTS: 6.5, avgTOEFL: 90, avgGPA: 3.4, tuitionDomestic: 5000, tuitionInternational: 26000, livingCost: 8000 },
      { name: "University of Toronto", nameZh: "多伦多大学", country: "Canada", city: "Toronto", state: "Ontario", website: "https://www.utoronto.ca", description: "The University of Toronto is a public research university.", type: "public", foundedYear: 1827, studentCount: 93000, acceptanceRate: 43.0, avgSAT: 1350, avgACT: 30, avgIELTS: 6.5, avgTOEFL: 89, avgGPA: 3.6, tuitionDomestic: 6100, tuitionInternational: 45000, livingCost: 15000 },
      { name: "University of Melbourne", nameZh: "墨尔本大学", country: "Australia", city: "Melbourne", state: "Victoria", website: "https://www.unimelb.edu.au", description: "The University of Melbourne is a public research university.", type: "public", foundedYear: 1853, studentCount: 52000, acceptanceRate: 30.0, avgIELTS: 6.5, avgTOEFL: 79, avgGPA: 3.3, tuitionDomestic: 10000, tuitionInternational: 38000, livingCost: 16000 },
      { name: "ETH Zurich", nameZh: "苏黎世联邦理工学院", country: "Switzerland", city: "Zurich", website: "https://www.ethz.ch", description: "ETH Zurich is a public research university in science, technology, engineering and mathematics.", type: "public", foundedYear: 1855, studentCount: 24200, acceptanceRate: 27.0, avgSAT: 1450, avgIELTS: 7.0, avgTOEFL: 100, avgGPA: 3.6, tuitionDomestic: 1460, tuitionInternational: 1460, livingCost: 17000 },
    ];

    for (const u of unis) {
      await prisma.university.create({ data: u });
    }

    // Rankings
    const allUnis = await prisma.university.findMany();
    const ranks: Record<string, { qs: number; usnews: number }> = {
      "Massachusetts Institute of Technology": { qs: 1, usnews: 2 },
      "University of Cambridge": { qs: 2, usnews: 8 },
      "University of Oxford": { qs: 3, usnews: 5 },
      "Harvard University": { qs: 4, usnews: 1 },
      "Stanford University": { qs: 5, usnews: 3 },
      "Tsinghua University": { qs: 25, usnews: 23 },
      "Peking University": { qs: 17, usnews: 39 },
      "University of Toronto": { qs: 21, usnews: 18 },
      "University of Melbourne": { qs: 14, usnews: 27 },
      "ETH Zurich": { qs: 7, usnews: 29 },
    };

    for (const uni of allUnis) {
      const r = ranks[uni.name];
      if (r) {
        await prisma.ranking.createMany({
          data: [
            { universityId: uni.id, rank: r.qs, year: 2025, source: "QS" },
            { universityId: uni.id, rank: r.usnews, year: 2025, source: "US_NEWS" },
          ],
        });
      }
    }

    // Test categories
    const cats = [
      { name: "SAT", description: "SAT standardized test" },
      { name: "IELTS", description: "IELTS English proficiency test" },
      { name: "TOEFL", description: "TOEFL English proficiency test" },
      { name: "ACT", description: "ACT standardized test" },
    ];
    for (const c of cats) {
      await prisma.testCategory.create({ data: c });
    }

    return NextResponse.json({ success: true, universities: unis.length, message: "Database seeded successfully" });
  } catch (error: any) {
    console.error("SEED ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
