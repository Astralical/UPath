import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { ALL_UNIVERSITIES } from "@/lib/university-data";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Auto-migrate
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "TestSet" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "description" TEXT, "categoryId" TEXT NOT NULL, "year" INTEGER, "month" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "TestQuestion" ADD COLUMN IF NOT EXISTS "setId" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "TestAttempt" ADD COLUMN IF NOT EXISTS "setId" TEXT`);

    // Clear
    await prisma.$executeRawUnsafe(`DELETE FROM "Ranking"`);
    await prisma.$executeRawUnsafe(`DELETE FROM "Major"`);
    await prisma.$executeRawUnsafe(`DELETE FROM "TestAttempt"`);
    await prisma.$executeRawUnsafe(`DELETE FROM "TestQuestion"`);
    await prisma.$executeRawUnsafe(`DELETE FROM "TestSet"`);
    await prisma.$executeRawUnsafe(`DELETE FROM "TestCategory"`);
    await prisma.$executeRawUnsafe(`DELETE FROM "University"`);

    // Users
    const adminPassword = await bcrypt.hash("admin123", 12);
    const teacherPassword = await bcrypt.hash("teacher123", 12);
    const studentPassword = await bcrypt.hash("student123", 12);
    await prisma.$executeRawUnsafe(`INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'System Admin', 'admin@upath.com', $1, 'ADMIN', NOW(), NOW()) ON CONFLICT (email) DO UPDATE SET password=$1`, adminPassword);
    await prisma.$executeRawUnsafe(`INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'Zhang Laoshi', 'teacher@upath.com', $1, 'TEACHER', NOW(), NOW()) ON CONFLICT (email) DO UPDATE SET password=$1`, teacherPassword);
    await prisma.$executeRawUnsafe(`INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'Xiao Ming', 'student@upath.com', $1, 'STUDENT', NOW(), NOW()) ON CONFLICT (email) DO UPDATE SET password=$1`, studentPassword);

    // Universities & majors & rankings — batch with raw SQL
    let uniCount = 0;
    for (const u of ALL_UNIVERSITIES) {
      const uniId = `uni_${uniCount}`;
      await prisma.$executeRawUnsafe(
        `INSERT INTO "University" (id, name, "nameZh", country, city, state, website, description, type, "foundedYear", "studentCount", "acceptanceRate", "avgSAT", "avgACT", "avgIELTS", "avgTOEFL", "avgGPA", "tuitionDomestic", "tuitionInternational", "livingCost") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
        uniId, u.name, u.nameZh, u.country, u.city, u.state || null, u.website, u.description, u.type, u.foundedYear, u.studentCount, u.acceptanceRate, u.avgSAT || null, u.avgACT || null, u.avgIELTS || null, u.avgTOEFL || null, u.avgGPA || null, u.tuitionDomestic, u.tuitionInternational, u.livingCost
      );
      // Majors
      for (const m of u.majors) {
        const isEng = ["Computer Science","Engineering","Electrical Engineering","Mechanical Engineering","Chemical Engineering","Aerospace Engineering","Robotics","Civil Engineering","Automotive Engineering","Software Engineering","Electronic Engineering","Naval Architecture","Instrumentation","Optics","Energy","Automation","Materials Science","Architecture","Transportation","Communications"].includes(m);
        await prisma.$executeRawUnsafe(`INSERT INTO "Major" (id, name, "universityId", category, "degreeLevel") VALUES (gen_random_uuid()::text, $1, $2, $3, 'Bachelor')`, m, uniId, isEng ? "Engineering" : "Arts & Sciences");
      }
      // Rankings
      if (u.qsRank) await prisma.$executeRawUnsafe(`INSERT INTO "Ranking" (id, rank, year, source, "universityId") VALUES (gen_random_uuid()::text, $1, 2025, 'QS', $2)`, u.qsRank, uniId);
      if (u.usnewsRank) await prisma.$executeRawUnsafe(`INSERT INTO "Ranking" (id, rank, year, source, "universityId") VALUES (gen_random_uuid()::text, $1, 2025, 'US_NEWS', $2)`, u.usnewsRank, uniId);
      uniCount++;
    }

    // Test categories
    for (const name of ["SAT", "IELTS", "TOEFL", "ACT"]) {
      await prisma.$executeRawUnsafe(`INSERT INTO "TestCategory" (id, name, description) VALUES (gen_random_uuid()::text, $1, $2)`, name, `${name} standardized test`);
    }

    // Test sets & questions (small set for each category)
    const catMap: Record<string, string> = {};
    const cats = await prisma.testCategory.findMany();
    for (const c of cats) catMap[c.name] = c.id;

    const sets = [
      { n: "SAT 2024 June", d: "Full SAT practice test", c: "SAT", y: 2024, m: "June", qs: [
        { s:"Reading",q:"The author's primary purpose is to:",a:"criticize a theory",b:"propose an explanation",c:"describe a phenomenon",d:"defend a position",ans:"C",d2:"medium",e:"The passage describes historical trade routes."},
        { s:"Math",q:"If 3x + 7 = 22, what is x?",a:"3",b:"5",c:"7",d:"9",ans:"B",d2:"easy",e:"3x=15, x=5."},
        { s:"Math",q:"Circle radius doubles. Area increases by factor:",a:"2",b:"4",c:"6",d:"8",ans:"B",d2:"medium",e:"π(2r)²=4πr²."},
        { s:"Reading",q:"'Sanguine' most nearly means:",a:"blood-red",b:"optimistic",c:"angry",d:"melancholy",ans:"B",d2:"hard",e:"Context shows hopeful outlook."},
      ]},
      { n: "SAT 2024 March", d: "March 2024 SAT test", c: "SAT", y: 2024, m: "March", qs: [
        { s:"Writing",q:"The researchers, along with their advisor, ___ the results.",a:"present",b:"presents",c:"presenting",d:"was presented",ans:"A",d2:"medium",e:"Subject is researchers (plural)."},
        { s:"Math",q:"Solve: 2y - 5 = 11",a:"3",b:"8",c:"13",d:"16",ans:"B",d2:"easy",e:"2y=16, y=8."},
        { s:"Math",q:"Triangle angles: 45°, 60°, x°. Find x.",a:"45°",b:"60°",c:"75°",d:"90°",ans:"C",d2:"medium",e:"180-45-60=75."},
      ]},
      { n: "IELTS 2024 June", d: "IELTS Academic test", c: "IELTS", y: 2024, m: "June", qs: [
        { s:"Reading",q:"Main cause of urban heat islands:",a:"Population density",b:"Dark surfaces replace vegetation",c:"Industrial pollution",d:"Climate change",ans:"B",d2:"medium",e:"Asphalt/concrete identified as primary."},
        { s:"Listening",q:"Library closing time on Saturdays:",a:"4:00 PM",b:"5:00 PM",c:"6:00 PM",d:"8:00 PM",ans:"B",d2:"easy",e:"Librarian states 5 PM."},
        { s:"Writing",q:"Correct grammar:",a:"If I would have known...",b:"If I had known, I would have come earlier.",c:"If I knew, I would have came...",d:"If I have known, I will come...",ans:"B",d2:"hard",e:"Third conditional."},
      ]},
      { n: "TOEFL 2024 Summer", d: "TOEFL iBT practice", c: "TOEFL", y: 2024, m: "August", qs: [
        { s:"Reading",q:"'Ubiquitous' is closest to:",a:"rare",b:"widespread",c:"complex",d:"ancient",ans:"B",d2:"medium",e:"Means present everywhere."},
        { s:"Listening",q:"Professor's main point about Industrial Revolution:",a:"Began in France",b:"Transformed social/economic structures",c:"Only affected manufacturing",d:"Ended quickly",ans:"B",d2:"medium",e:"Emphasizes broad transformations."},
      ]},
      { n: "ACT 2024 June", d: "ACT full practice", c: "ACT", y: 2024, m: "June", qs: [
        { s:"English",q:"Best revision: 'Walking down the street, the flowers were beautiful.'",a:"No change",b:"Walking down the street, I saw beautiful flowers.",c:"The flowers were beautiful, walking...",d:"As I walking...",ans:"B",d2:"easy",e:"Fix dangling modifier."},
        { s:"Math",q:"Slope through (2,3) and (5,9):",a:"1",b:"2",c:"3",d:"6",ans:"B",d2:"medium",e:"(9-3)/(5-2)=2."},
        { s:"Science",q:"Reaction rate peaks at:",a:"20°C",b:"30°C",c:"40°C",d:"50°C",ans:"C",d2:"medium",e:"Graph shows max at 40°C."},
      ]},
    ];

    let setCount = 0, qCount = 0;
    for (const ts of sets) {
      const catId = catMap[ts.c];
      if (!catId) continue;
      const setId = `set_${setCount}`;
      await prisma.$executeRawUnsafe(`INSERT INTO "TestSet" (id, name, description, "categoryId", year, month) VALUES ($1,$2,$3,$4,$5,$6)`, setId, ts.n, ts.d, catId, ts.y, ts.m);
      for (const q of ts.qs) {
        await prisma.$executeRawUnsafe(`INSERT INTO "TestQuestion" (id, "categoryId", "setId", section, "questionText", "optionA", "optionB", "optionC", "optionD", "correctAnswer", explanation, difficulty) VALUES (gen_random_uuid()::text, $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, catId, setId, q.s, q.q, q.a, q.b, q.c, q.d, q.ans, q.e, q.d2);
        qCount++;
      }
      setCount++;
    }

    return NextResponse.json({ success: true, universities: uniCount, testSets: setCount, questions: qCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
