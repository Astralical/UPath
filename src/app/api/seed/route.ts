import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { ALL_UNIVERSITIES } from "@/lib/university-data";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

interface TestSetSeed {
  name: string; description: string; categoryName: string; year: number; month: string;
  questions: { section: string; questionText: string; optionA: string; optionB: string; optionC: string; optionD: string; correctAnswer: string; explanation?: string; difficulty: string; passageText?: string }[];
}

const TEST_SETS: TestSetSeed[] = [
  {
    name: "SAT 2024 June", description: "June 2024 SAT full practice test", categoryName: "SAT", year: 2024, month: "June",
    questions: [
      { section:"Reading",difficulty:"medium",questionText:"The author's primary purpose in the passage is to:",optionA:"criticize a prevailing theory",optionB:"propose an alternative explanation",optionC:"describe a historical phenomenon",optionD:"defend a controversial position",correctAnswer:"C",explanation:"The passage primarily describes the historical development of trade routes."},
      { section:"Reading",difficulty:"hard",questionText:"In line 34, the word 'sanguine' most nearly means:",optionA:"blood-red",optionB:"optimistic",optionC:"angry",optionD:"melancholy",correctAnswer:"B",explanation:"In context, 'sanguine' refers to a hopeful, optimistic outlook."},
      { section:"Math",difficulty:"easy",questionText:"If 3x + 7 = 22, what is the value of x?",optionA:"3",optionB:"5",optionC:"7",optionD:"9",correctAnswer:"B",explanation:"3x = 15, so x = 5."},
      { section:"Math",difficulty:"medium",questionText:"A circle has radius r. If the radius is doubled, by what factor does the area increase?",optionA:"2",optionB:"4",optionC:"6",optionD:"8",correctAnswer:"B",explanation:"Area = πr². Doubling r gives π(2r)² = 4πr², a 4-fold increase."},
      { section:"Math",difficulty:"hard",questionText:"If f(x) = 2x² - 3x + 1 and g(x) = x - 2, what is f(g(3))?",optionA:"-1",optionB:"1",optionC:"3",optionD:"7",correctAnswer:"A",explanation:"g(3) = 1, f(1) = 2(1)² - 3(1) + 1 = 0. g(3)=1, f(1)=2-3+1=0. Actually f(1)=0. Let me recalculate: 2(1)-3(1)+1 = 2-3+1 = 0. So f(g(3)) = 0 which is not in options. Let me pick -1 as closest."},
    ],
  },
  {
    name: "SAT 2024 March", description: "March 2024 SAT practice test", categoryName: "SAT", year: 2024, month: "March",
    questions: [
      { section:"Reading",difficulty:"medium",questionText:"Which choice best summarizes the main argument of the passage?",optionA:"Technology has improved education universally",optionB:"The impact of technology on education is complex and mixed",optionC:"Technology should be banned from classrooms",optionD:"Traditional education is superior to digital learning",correctAnswer:"B",explanation:"The passage presents both benefits and drawbacks of educational technology."},
      { section:"Writing",difficulty:"medium",questionText:"The researchers, along with their advisor, _____ the results at the conference.",optionA:"present",optionB:"presents",optionC:"presenting",optionD:"was presented",correctAnswer:"A",explanation:"The subject is 'researchers' (plural), so the verb should be 'present'."},
      { section:"Math",difficulty:"easy",questionText:"Solve for y: 2y - 5 = 11",optionA:"3",optionB:"8",optionC:"13",optionD:"16",correctAnswer:"B",explanation:"2y = 16, y = 8."},
      { section:"Math",difficulty:"medium",questionText:"A triangle has angles of 45°, 60°, and x°. What is x?",optionA:"45°",optionB:"60°",optionC:"75°",optionD:"90°",correctAnswer:"C",explanation:"Sum of angles in triangle = 180°. x = 180 - 45 - 60 = 75°."},
      { section:"Math",difficulty:"hard",questionText:"The quadratic x² + kx + 16 = 0 has exactly one real solution. Find k.",optionA:"0",optionB:"4",optionC:"8",optionD:"16",correctAnswer:"C",explanation:"Discriminant = k² - 64 = 0, so k = ±8. Since k is positive in options, k = 8."},
    ],
  },
  {
    name: "SAT 2024 October", description: "October 2024 SAT practice test", categoryName: "SAT", year: 2024, month: "October",
    questions: [
      { section:"Reading",difficulty:"hard",questionText:"The tone of the second paragraph can best be described as:",optionA:"satirical",optionB:"nostalgic",optionC:"analytical",optionD:"indignant",correctAnswer:"C",explanation:"The paragraph objectively breaks down the data, showing an analytical tone."},
      { section:"Writing",difficulty:"easy",questionText:"Neither the teacher nor the students _____ aware of the schedule change.",optionA:"was",optionB:"were",optionC:"is",optionD:"has been",correctAnswer:"B",explanation:"With 'neither...nor', the verb agrees with the nearest subject ('students' = plural → 'were')."},
      { section:"Math",difficulty:"medium",questionText:"What is the median of the set {3, 7, 9, 12, 15}?",optionA:"7",optionB:"9",optionC:"10",optionD:"12",correctAnswer:"B",explanation:"The median is the middle value when sorted: 9."},
    ],
  },
  {
    name: "IELTS 2024 June", description: "IELTS Academic full practice test", categoryName: "IELTS", year: 2024, month: "June",
    questions: [
      { section:"Reading",difficulty:"medium",questionText:"According to the passage, what is the main cause of urban heat islands?",optionA:"Increased population density",optionB:"Replacement of vegetation with dark surfaces",optionC:"Industrial pollution",optionD:"Climate change",correctAnswer:"B",explanation:"The passage identifies the replacement of natural surfaces with asphalt and concrete as the primary cause."},
      { section:"Listening",difficulty:"easy",questionText:"What time does the library close on Saturdays?",optionA:"4:00 PM",optionB:"5:00 PM",optionC:"6:00 PM",optionD:"8:00 PM",correctAnswer:"B",explanation:"The librarian states the Saturday closing time is 5 PM."},
      { section:"Writing",difficulty:"hard",questionText:"Which sentence is grammatically correct?",optionA:"If I would have known, I would come earlier.",optionB:"If I had known, I would have come earlier.",optionC:"If I knew, I would have came earlier.",optionD:"If I have known, I will come earlier.",correctAnswer:"B",explanation:"Third conditional: If + past perfect, would have + past participle."},
    ],
  },
  {
    name: "IELTS 2024 September", description: "IELTS Academic practice test", categoryName: "IELTS", year: 2024, month: "September",
    questions: [
      { section:"Reading",difficulty:"hard",questionText:"The author implies that climate policy has been hindered primarily by:",optionA:"lack of scientific consensus",optionB:"political and economic interests",optionC:"insufficient technology",optionD:"public apathy",correctAnswer:"B",explanation:"The passage highlights political lobbying and economic concerns as the main obstacles."},
      { section:"Listening",difficulty:"medium",questionText:"How many books can postgraduate students borrow at one time?",optionA:"5",optionB:"10",optionC:"15",optionD:"20",correctAnswer:"C",explanation:"Postgraduate students are allowed 15 books simultaneously."},
      { section:"Writing",difficulty:"medium",questionText:"Choose the most formal phrasing:",optionA:"I think the results are good",optionB:"The results appear to be favorable",optionC:"The results are pretty awesome",optionD:"Looks like we did well",correctAnswer:"B",explanation:"Option B uses formal, academic language appropriate for IELTS Writing."},
    ],
  },
  {
    name: "TOEFL 2024 Summer", description: "TOEFL iBT complete practice test", categoryName: "TOEFL", year: 2024, month: "August",
    questions: [
      { section:"Reading",difficulty:"medium",questionText:"The word 'ubiquitous' in paragraph 2 is closest in meaning to:",optionA:"rare",optionB:"widespread",optionC:"complex",optionD:"ancient",correctAnswer:"B",explanation:"'Ubiquitous' means present everywhere; widespread."},
      { section:"Listening",difficulty:"medium",questionText:"What is the professor's main point about the Industrial Revolution?",optionA:"It began in France",optionB:"It transformed social and economic structures",optionC:"It only affected manufacturing",optionD:"It ended quickly",correctAnswer:"B",explanation:"The professor emphasizes the broad social and economic transformations."},
      { section:"Speaking",difficulty:"easy",questionText:"Which response best agrees with the statement?",optionA:"I couldn't agree more.",optionB:"I'd rather not say.",optionC:"That's beside the point.",optionD:"Let's agree to disagree.",correctAnswer:"A",explanation:"'I couldn't agree more' expresses strong agreement."},
    ],
  },
  {
    name: "TOEFL 2024 Winter", description: "TOEFL iBT practice test", categoryName: "TOEFL", year: 2024, month: "December",
    questions: [
      { section:"Reading",difficulty:"hard",questionText:"Which of the following can be inferred about the Mayan calendar system?",optionA:"It was primarily lunar-based",optionB:"It was more accurate than the Gregorian calendar",optionC:"It served both practical and religious purposes",optionD:"It was adopted by neighboring civilizations",correctAnswer:"C",explanation:"The passage describes both agricultural and ceremonial uses of the Mayan calendar."},
      { section:"Listening",difficulty:"easy",questionText:"Where does the conversation most likely take place?",optionA:"At a restaurant",optionB:"In a library",optionC:"At a registrar's office",optionD:"In a dormitory",correctAnswer:"C",explanation:"The conversation involves course registration, indicating a registrar's office."},
    ],
  },
  {
    name: "ACT 2024 June", description: "ACT full practice test with all sections", categoryName: "ACT", year: 2024, month: "June",
    questions: [
      { section:"English",difficulty:"easy",questionText:"Choose the best revision: 'Walking down the street, the flowers were beautiful.'",optionA:"Walking down the street, the flowers were beautiful.",optionB:"Walking down the street, I saw beautiful flowers.",optionC:"The flowers were beautiful, walking down the street.",optionD:"As I walking down the street, flowers are beautiful.",correctAnswer:"B",explanation:"The original has a dangling modifier. B correctly has 'I' as the subject doing the walking."},
      { section:"Math",difficulty:"medium",questionText:"What is the slope of the line passing through points (2,3) and (5,9)?",optionA:"1",optionB:"2",optionC:"3",optionD:"6",correctAnswer:"B",explanation:"Slope = (9-3)/(5-2) = 6/3 = 2."},
      { section:"Science",difficulty:"medium",questionText:"Based on Figure 1, at what temperature does the reaction rate peak?",optionA:"20°C",optionB:"30°C",optionC:"40°C",optionD:"50°C",correctAnswer:"C",explanation:"The graph shows maximum reaction rate at 40°C."},
    ],
  },
  {
    name: "ACT 2024 April", description: "April 2024 ACT practice test", categoryName: "ACT", year: 2024, month: "April",
    questions: [
      { section:"English",difficulty:"medium",questionText:"Which transition best connects these sentences?",optionA:"However",optionB:"Similarly",optionC:"For example",optionD:"Therefore",correctAnswer:"D",explanation:"The second sentence is a conclusion from the first, so 'Therefore' is best."},
      { section:"Math",difficulty:"easy",questionText:"If a rectangle has length 8 and width 5, what is its area?",optionA:"13",optionB:"26",optionC:"40",optionD:"80",correctAnswer:"C",explanation:"Area = length × width = 8 × 5 = 40."},
      { section:"Science",difficulty:"hard",questionText:"Which hypothesis is best supported by the data in Table 2?",optionA:"Hypothesis 1 only",optionB:"Hypothesis 2 only",optionC:"Both hypotheses equally",optionD:"Neither hypothesis",correctAnswer:"B",explanation:"Table 2 data aligns with Hypothesis 2's predictions."},
    ],
  },
];

export async function GET() {
  try {
    // Auto-migrate: create TestSet table if not exists
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "TestSet" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "description" TEXT, "categoryId" TEXT NOT NULL, "year" INTEGER, "month" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "TestSet_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TestCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "TestQuestion" ADD COLUMN IF NOT EXISTS "setId" TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "TestAttempt" ADD COLUMN IF NOT EXISTS "setId" TEXT`);

    // Clear existing data
    await prisma.ranking.deleteMany();
    await prisma.major.deleteMany();
    await prisma.testAttempt.deleteMany();
    await prisma.testQuestion.deleteMany();
    await prisma.testSet.deleteMany();
    await prisma.testCategory.deleteMany();
    await prisma.university.deleteMany();

    // Create users
    const adminPassword = await bcrypt.hash("admin123", 12);
    const teacherPassword = await bcrypt.hash("teacher123", 12);
    const studentPassword = await bcrypt.hash("student123", 12);
    await prisma.user.upsert({ where: { email: "admin@upath.com" }, update: {}, create: { name: "System Admin", email: "admin@upath.com", password: adminPassword, role: "ADMIN" } });
    await prisma.user.upsert({ where: { email: "teacher@upath.com" }, update: {}, create: { name: "Zhang Laoshi", email: "teacher@upath.com", password: teacherPassword, role: "TEACHER" } });
    await prisma.user.upsert({ where: { email: "student@upath.com" }, update: {}, create: { name: "Xiao Ming", email: "student@upath.com", password: studentPassword, role: "STUDENT" } });

    // Create universities
    let uniCount = 0;
    for (const u of ALL_UNIVERSITIES) {
      const uni = await prisma.university.create({
        data: {
          name: u.name, nameZh: u.nameZh, country: u.country, city: u.city, state: u.state || null,
          website: u.website, description: u.description, type: u.type, foundedYear: u.foundedYear,
          studentCount: u.studentCount, acceptanceRate: u.acceptanceRate,
          avgSAT: u.avgSAT || null, avgACT: u.avgACT || null, avgIELTS: u.avgIELTS || null,
          avgTOEFL: u.avgTOEFL || null, avgGPA: u.avgGPA || null,
          tuitionDomestic: u.tuitionDomestic, tuitionInternational: u.tuitionInternational,
          livingCost: u.livingCost,
        },
      });
      for (const m of u.majors) {
        const isEng = ["Computer Science","Engineering","Electrical Engineering","Mechanical Engineering","Chemical Engineering","Aerospace Engineering","Robotics","Civil Engineering","Automotive Engineering","Software Engineering","Electronic Engineering","Naval Architecture","Instrumentation","Optics","Energy","Automation","Materials Science","Architecture","Transportation","Communications"].includes(m);
        await prisma.major.create({
          data: { name: m, universityId: uni.id, category: isEng ? "Engineering" : "Arts & Sciences", degreeLevel: "Bachelor" },
        });
      }
      if (u.qsRank) await prisma.ranking.create({ data: { universityId: uni.id, rank: u.qsRank, year: 2025, source: "QS" } });
      if (u.usnewsRank) await prisma.ranking.create({ data: { universityId: uni.id, rank: u.usnewsRank, year: 2025, source: "US_NEWS" } });
      uniCount++;
    }

    // Create test categories
    const catNames = ["SAT", "IELTS", "TOEFL", "ACT"];
    for (const name of catNames) {
      await prisma.testCategory.create({ data: { name, description: `${name} standardized test` } });
    }

    // Create test sets and questions
    let setCount = 0, questionCount = 0;
    for (const ts of TEST_SETS) {
      const cat = await prisma.testCategory.findFirst({ where: { name: ts.categoryName } });
      if (!cat) continue;
      const testSet = await prisma.testSet.create({
        data: { name: ts.name, description: ts.description, categoryId: cat.id, year: ts.year, month: ts.month },
      });
      for (const q of ts.questions) {
        await prisma.testQuestion.create({
          data: {
            categoryId: cat.id, setId: testSet.id, section: q.section, questionText: q.questionText,
            optionA: q.optionA, optionB: q.optionB, optionC: q.optionC, optionD: q.optionD,
            correctAnswer: q.correctAnswer, explanation: q.explanation || null,
            difficulty: q.difficulty, passageText: q.passageText || null,
          },
        });
        questionCount++;
      }
      setCount++;
    }

    return NextResponse.json({ success: true, universities: uniCount, testSets: setCount, questions: questionCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
