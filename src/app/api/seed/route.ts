import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { ALL_UNIVERSITIES } from "@/lib/university-data";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

function uid() { return crypto.randomUUID(); }

export async function GET() {
  try {
    // Auto-migrate
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "TestSet" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "description" TEXT, "categoryId" TEXT NOT NULL, "year" INTEGER, "month" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "TestQuestion" ADD COLUMN IF NOT EXISTS "setId" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "TestAttempt" ADD COLUMN IF NOT EXISTS "setId" TEXT`);

    // Clear
    await prisma.ranking.deleteMany();
    await prisma.major.deleteMany();
    await prisma.testAttempt.deleteMany();
    await prisma.testQuestion.deleteMany();
    await prisma.testSet.deleteMany();
    await prisma.testCategory.deleteMany();
    await prisma.university.deleteMany();

    // Users
    const [adminPw, teacherPw, studentPw] = await Promise.all([
      bcrypt.hash("admin123", 12), bcrypt.hash("teacher123", 12), bcrypt.hash("student123", 12)
    ]);
    await prisma.user.upsert({ where: { email: "admin@upath.com" }, update: {}, create: { name: "System Admin", email: "admin@upath.com", password: adminPw, role: "ADMIN" } });
    await prisma.user.upsert({ where: { email: "teacher@upath.com" }, update: {}, create: { name: "Zhang Laoshi", email: "teacher@upath.com", password: teacherPw, role: "TEACHER" } });
    await prisma.user.upsert({ where: { email: "student@upath.com" }, update: {}, create: { name: "Xiao Ming", email: "student@upath.com", password: studentPw, role: "STUDENT" } });

    // Universities with createMany (pre-generate IDs)
    const uniMap: Record<string, { id: string; majors: string[]; qsRank?: number; usnewsRank?: number }> = {};
    const uniData: any[] = [];

    for (const u of ALL_UNIVERSITIES) {
      const id = uid();
      uniMap[u.name] = { id, majors: u.majors, qsRank: u.qsRank, usnewsRank: u.usnewsRank };
      uniData.push({
        id, name: u.name, nameZh: u.nameZh, country: u.country, city: u.city, state: u.state || null,
        website: u.website, description: u.description, type: u.type, foundedYear: u.foundedYear,
        studentCount: u.studentCount, acceptanceRate: u.acceptanceRate,
        avgSAT: u.avgSAT || null, avgACT: u.avgACT || null, avgIELTS: u.avgIELTS || null,
        avgTOEFL: u.avgTOEFL || null, avgGPA: u.avgGPA || null,
        tuitionDomestic: u.tuitionDomestic, tuitionInternational: u.tuitionInternational,
        livingCost: u.livingCost,
      });
    }

    // Batch insert universities (500 per batch to avoid too-large queries)
    for (let i = 0; i < uniData.length; i += 500) {
      await prisma.university.createMany({ data: uniData.slice(i, i + 500) });
    }

    // Majors and rankings with createMany
    const majorData: any[] = [];
    const rankingData: any[] = [];
    const engList = ["Computer Science","Engineering","Electrical Engineering","Mechanical Engineering","Chemical Engineering","Aerospace Engineering","Robotics","Civil Engineering","Automotive Engineering","Software Engineering","Electronic Engineering","Naval Architecture","Instrumentation","Optics","Energy","Automation","Materials Science","Architecture","Transportation","Communications"];

    for (const [name, info] of Object.entries(uniMap)) {
      for (const m of info.majors) {
        majorData.push({ name: m, universityId: info.id, category: engList.includes(m) ? "Engineering" : "Arts & Sciences", degreeLevel: "Bachelor" });
      }
      if (info.qsRank) rankingData.push({ rank: info.qsRank, year: 2025, source: "QS", universityId: info.id });
      if (info.usnewsRank) rankingData.push({ rank: info.usnewsRank, year: 2025, source: "US_NEWS", universityId: info.id });
    }

    // Batch insert majors and rankings
    for (let i = 0; i < majorData.length; i += 500) {
      await prisma.major.createMany({ data: majorData.slice(i, i + 500) });
    }
    for (let i = 0; i < rankingData.length; i += 500) {
      await prisma.ranking.createMany({ data: rankingData.slice(i, i + 500) });
    }

    // Test categories
    const catIds: Record<string, string> = {};
    for (const name of ["SAT", "IELTS", "TOEFL", "ACT"]) {
      const c = await prisma.testCategory.create({ data: { name, description: `${name} standardized test` } });
      catIds[name] = c.id;
    }

    // Test sets with questions (createMany)
    const setDefs = [
      { n:"SAT 2024 June",d:"Full SAT practice test",c:"SAT",y:2024,m:"June",qs:[{s:"Reading",q:"The author's primary purpose is to:",a:"criticize a theory",b:"propose an explanation",c:"describe a phenomenon",d:"defend a position",ans:"C",df:"medium",e:"The passage describes historical trade routes."},{s:"Math",q:"If 3x + 7 = 22, what is x?",a:"3",b:"5",c:"7",d:"9",ans:"B",df:"easy",e:"3x=15, x=5."},{s:"Math",q:"Circle radius doubles. Area increases by factor:",a:"2",b:"4",c:"6",d:"8",ans:"B",df:"medium",e:"π(2r)²=4πr²."},{s:"Reading",q:"'Sanguine' most nearly means:",a:"blood-red",b:"optimistic",c:"angry",d:"melancholy",ans:"B",df:"hard",e:"Context shows hopeful outlook."}]},
      { n:"SAT 2024 March",d:"March 2024 SAT test",c:"SAT",y:2024,m:"March",qs:[{s:"Writing",q:"The researchers, along with their advisor, ___ the results.",a:"present",b:"presents",c:"presenting",d:"was presented",ans:"A",df:"medium",e:"Subject is researchers (plural)."},{s:"Math",q:"Solve: 2y - 5 = 11",a:"3",b:"8",c:"13",d:"16",ans:"B",df:"easy",e:"2y=16, y=8."},{s:"Math",q:"Triangle angles: 45°, 60°, x°. Find x.",a:"45°",b:"60°",c:"75°",d:"90°",ans:"C",df:"medium",e:"180-45-60=75."}]},
      { n:"SAT 2024 October",d:"October 2024 SAT",c:"SAT",y:2024,m:"October",qs:[{s:"Reading",q:"The tone of the second paragraph can best be described as:",a:"satirical",b:"nostalgic",c:"analytical",d:"indignant",ans:"C",df:"hard",e:"The paragraph objectively breaks down data."},{s:"Writing",q:"Neither the teacher nor the students ___ aware.",a:"was",b:"were",c:"is",d:"has been",ans:"B",df:"easy",e:"Verb agrees with nearest subject (students)."}]},
      { n:"IELTS 2024 June",d:"IELTS Academic test",c:"IELTS",y:2024,m:"June",qs:[{s:"Reading",q:"Main cause of urban heat islands:",a:"Population density",b:"Dark surfaces replace vegetation",c:"Industrial pollution",d:"Climate change",ans:"B",df:"medium",e:"Asphalt/concrete identified as primary."},{s:"Listening",q:"Library closing time on Saturdays:",a:"4:00 PM",b:"5:00 PM",c:"6:00 PM",d:"8:00 PM",ans:"B",df:"easy",e:"Librarian states 5 PM."},{s:"Writing",q:"Correct grammar:",a:"If I would have known...",b:"If I had known, I would have come earlier.",c:"If I knew, I would have came...",d:"If I have known, I will come...",ans:"B",df:"hard",e:"Third conditional."}]},
      { n:"IELTS 2024 September",d:"IELTS practice test",c:"IELTS",y:2024,m:"September",qs:[{s:"Reading",q:"Climate policy hindered primarily by:",a:"Lack of scientific consensus",b:"Political and economic interests",c:"Insufficient technology",d:"Public apathy",ans:"B",df:"hard",e:"Passage highlights lobbying and economics."},{s:"Listening",q:"Postgrad students can borrow ___ books:",a:"5",b:"10",c:"15",d:"20",ans:"C",df:"medium",e:"Postgrad limit is 15 books."}]},
      { n:"TOEFL 2024 Summer",d:"TOEFL iBT practice",c:"TOEFL",y:2024,m:"August",qs:[{s:"Reading",q:"'Ubiquitous' is closest to:",a:"rare",b:"widespread",c:"complex",d:"ancient",ans:"B",df:"medium",e:"Means present everywhere."},{s:"Listening",q:"Professor's main point about Industrial Revolution:",a:"Began in France",b:"Transformed social/economic structures",c:"Only affected manufacturing",d:"Ended quickly",ans:"B",df:"medium",e:"Emphasizes broad transformations."}]},
      { n:"TOEFL 2024 Winter",d:"TOEFL iBT practice",c:"TOEFL",y:2024,m:"December",qs:[{s:"Reading",q:"Inferred about Mayan calendar:",a:"Primarily lunar",b:"More accurate than Gregorian",c:"Served practical and religious purposes",d:"Adopted by neighbors",ans:"C",df:"hard",e:"Agricultural and ceremonial uses described."},{s:"Listening",q:"Where does conversation take place?",a:"Restaurant",b:"Library",c:"Registrar's office",d:"Dormitory",ans:"C",df:"easy",e:"Course registration discussion."}]},
      { n:"ACT 2024 June",d:"ACT full practice",c:"ACT",y:2024,m:"June",qs:[{s:"English",q:"Best revision: 'Walking down the street, the flowers were beautiful.'",a:"No change",b:"Walking down the street, I saw beautiful flowers.",c:"The flowers were beautiful, walking...",d:"As I walking...",ans:"B",df:"easy",e:"Fix dangling modifier."},{s:"Math",q:"Slope through (2,3) and (5,9):",a:"1",b:"2",c:"3",d:"6",ans:"B",df:"medium",e:"(9-3)/(5-2)=2."},{s:"Science",q:"Reaction rate peaks at:",a:"20°C",b:"30°C",c:"40°C",d:"50°C",ans:"C",df:"medium",e:"Graph shows max at 40°C."}]},
      { n:"ACT 2024 April",d:"April 2024 ACT",c:"ACT",y:2024,m:"April",qs:[{s:"English",q:"Best transition:",a:"However",b:"Similarly",c:"For example",d:"Therefore",ans:"D",df:"medium",e:"Second sentence is a conclusion."},{s:"Math",q:"Rectangle area (8×5):",a:"13",b:"26",c:"40",d:"80",ans:"C",df:"easy",e:"8×5=40."}]},
    ];

    let setCount = 0, qCount = 0;
    const setData: any[] = [];
    const questionData: any[] = [];

    for (const ts of setDefs) {
      const catId = catIds[ts.c];
      if (!catId) continue;
      const setId = uid();
      setData.push({ id: setId, name: ts.n, description: ts.d, categoryId: catId, year: ts.y, month: ts.m });
      for (const q of ts.qs) {
        questionData.push({
          categoryId: catId, setId, section: q.s, questionText: q.q,
          optionA: q.a, optionB: q.b, optionC: q.c, optionD: q.d,
          correctAnswer: q.ans, explanation: q.e, difficulty: q.df,
        });
        qCount++;
      }
      setCount++;
    }

    if (setData.length > 0) {
      await prisma.testSet.createMany({ data: setData });
      for (let i = 0; i < questionData.length; i += 500) {
        await prisma.testQuestion.createMany({ data: questionData.slice(i, i + 500) });
      }
    }

    return NextResponse.json({ success: true, universities: uniData.length, testSets: setCount, questions: qCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
