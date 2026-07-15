import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@upath.com" },
    update: {},
    create: {
      name: "系统管理员",
      email: "admin@upath.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create teacher
  const teacherPassword = await bcrypt.hash("teacher123", 12);
  const teacher = await prisma.user.upsert({
    where: { email: "teacher@upath.com" },
    update: {},
    create: {
      name: "张老师",
      email: "teacher@upath.com",
      password: teacherPassword,
      role: "TEACHER",
      bio: "资深升学顾问，10年留学指导经验",
    },
  });
  console.log("✅ Teacher created:", teacher.email);

  // Create student
  const studentPassword = await bcrypt.hash("student123", 12);
  const student = await prisma.user.upsert({
    where: { email: "student@upath.com" },
    update: {},
    create: {
      name: "小明",
      email: "student@upath.com",
      password: studentPassword,
      role: "STUDENT",
    },
  });
  console.log("✅ Student created:", student.email);

  // Link student to teacher
  await prisma.studentTeacher.upsert({
    where: { studentId_teacherId: { studentId: student.id, teacherId: teacher.id } },
    update: {},
    create: { studentId: student.id, teacherId: teacher.id },
  });

  // Create universities
  const universities = [
    {
      name: "Harvard University",
      nameZh: "哈佛大学",
      country: "United States",
      city: "Cambridge",
      website: "https://www.harvard.edu",
      description: "哈佛大学是美国最古老的高等教育机构，位于马萨诸塞州剑桥市。它是常春藤联盟成员，以其卓越的学术研究和丰富的教育资源闻名于世。",
      type: "private",
      foundedYear: 1636,
    },
    {
      name: "Massachusetts Institute of Technology",
      nameZh: "麻省理工学院",
      country: "United States",
      city: "Cambridge",
      website: "https://www.mit.edu",
      description: "麻省理工学院是世界顶尖的科技研究型大学，以工程学、计算机科学和自然科学领域的卓越成就著称。",
      type: "private",
      foundedYear: 1861,
    },
    {
      name: "Stanford University",
      nameZh: "斯坦福大学",
      country: "United States",
      city: "Stanford",
      website: "https://www.stanford.edu",
      description: "斯坦福大学位于硅谷中心，以其创新精神和创业文化闻名，培养了众多科技行业的领军人物。",
      type: "private",
      foundedYear: 1885,
    },
    {
      name: "University of Oxford",
      nameZh: "牛津大学",
      country: "United Kingdom",
      city: "Oxford",
      website: "https://www.ox.ac.uk",
      description: "牛津大学是英语世界最古老的大学，以其卓越的教学质量和深厚的学术传统享誉全球。",
      type: "public",
      foundedYear: 1096,
    },
    {
      name: "University of Cambridge",
      nameZh: "剑桥大学",
      country: "United Kingdom",
      city: "Cambridge",
      website: "https://www.cam.ac.uk",
      description: "剑桥大学是世界顶尖的公立研究型大学，采用书院联邦制，培养了众多诺贝尔奖得主。",
      type: "public",
      foundedYear: 1209,
    },
    {
      name: "Tsinghua University",
      nameZh: "清华大学",
      country: "China",
      city: "Beijing",
      website: "https://www.tsinghua.edu.cn",
      description: "清华大学是中国最著名的高等学府之一，以工科见长，综合实力位居中国高校前列。",
      type: "public",
      foundedYear: 1911,
    },
    {
      name: "Peking University",
      nameZh: "北京大学",
      country: "China",
      city: "Beijing",
      website: "https://www.pku.edu.cn",
      description: "北京大学是中国近代第一所国立综合性大学，人文社科和自然科学并重，学术实力雄厚。",
      type: "public",
      foundedYear: 1898,
    },
    {
      name: "University of Toronto",
      nameZh: "多伦多大学",
      country: "Canada",
      city: "Toronto",
      website: "https://www.utoronto.ca",
      description: "多伦多大学是加拿大顶尖的公立研究型大学，在医学、工程和人文领域享有盛誉。",
      type: "public",
      foundedYear: 1827,
    },
    {
      name: "University of Melbourne",
      nameZh: "墨尔本大学",
      country: "Australia",
      city: "Melbourne",
      website: "https://www.unimelb.edu.au",
      description: "墨尔本大学是澳大利亚历史第二悠久的高等学府，学术研究和教学质量均位居世界前列。",
      type: "public",
      foundedYear: 1853,
    },
    {
      name: "ETH Zurich",
      nameZh: "苏黎世联邦理工学院",
      country: "Switzerland",
      city: "Zurich",
      website: "https://www.ethz.ch",
      description: "苏黎世联邦理工学院是世界领先的科技大学，以工程、自然科学和建筑学闻名于世。",
      type: "public",
      foundedYear: 1855,
    },
  ];

  for (const uni of universities) {
    const created = await prisma.university.create({ data: uni });
    console.log(`  📚 ${created.nameZh || created.name}`);
  }

  // Add rankings
  const allUnis = await prisma.university.findMany();
  const rankingData = [
    { name: "Harvard University", qs: 4, usnews: 1 },
    { name: "Massachusetts Institute of Technology", qs: 1, usnews: 2 },
    { name: "Stanford University", qs: 5, usnews: 3 },
    { name: "University of Oxford", qs: 3, usnews: 5 },
    { name: "University of Cambridge", qs: 2, usnews: 8 },
    { name: "Tsinghua University", qs: 25, usnews: 23 },
    { name: "Peking University", qs: 17, usnews: 39 },
    { name: "University of Toronto", qs: 21, usnews: 18 },
    { name: "University of Melbourne", qs: 14, usnews: 27 },
    { name: "ETH Zurich", qs: 7, usnews: 29 },
  ];

  for (const rd of rankingData) {
    const uni = allUnis.find((u) => u.name === rd.name);
    if (uni) {
      await prisma.ranking.createMany({
        data: [
          { universityId: uni.id, rank: rd.qs, year: 2024, source: "QS" },
          { universityId: uni.id, rank: rd.usnews, year: 2024, source: "US_NEWS" },
        ],
      });
    }
  }
  console.log("✅ Rankings added");

  // Create majors
  const majorsData = [
    { uniName: "Harvard University", majors: ["Computer Science", "Economics", "Psychology", "Political Science", "Biology"] },
    { uniName: "Massachusetts Institute of Technology", majors: ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Physics", "Mathematics"] },
    { uniName: "Stanford University", majors: ["Computer Science", "Business", "Engineering", "Biology", "Psychology"] },
    { uniName: "University of Oxford", majors: ["Law", "Medicine", "Philosophy, Politics and Economics", "English Literature", "Mathematics"] },
    { uniName: "University of Cambridge", majors: ["Natural Sciences", "Engineering", "Mathematics", "Economics", "Law"] },
  ];

  for (const md of majorsData) {
    const uni = allUnis.find((u) => u.name === md.uniName);
    if (uni) {
      for (const majorName of md.majors) {
        await prisma.major.create({
          data: {
            name: majorName,
            universityId: uni.id,
            category: majorName.includes("Computer") || majorName.includes("Engineering") ? "Engineering" : "Arts",
            degreeLevel: "Bachelor",
          },
        });
      }
    }
  }
  console.log("✅ Majors added");

  // Create test categories and questions
  const testCategories = [
    {
      name: "SAT",
      description: "SAT (Scholastic Assessment Test) 是美国大学入学标准化考试",
      questions: [
        {
          section: "Reading",
          questionText: "The author's tone in the passage can best be described as:",
          optionA: "Analytical and objective",
          optionB: "Emotional and biased",
          optionC: "Humorous and lighthearted",
          optionD: "Critical and dismissive",
          correctAnswer: "A",
          explanation: "The passage presents facts and evidence in a balanced way without emotional language.",
          difficulty: "medium",
        },
        {
          section: "Math",
          questionText: "If 3x + 7 = 22, what is the value of x?",
          optionA: "3",
          optionB: "5",
          optionC: "7",
          optionD: "15",
          correctAnswer: "B",
          explanation: "3x + 7 = 22 → 3x = 15 → x = 5",
          difficulty: "easy",
        },
        {
          section: "Writing",
          questionText: "Choose the best option to complete the sentence: The committee _____ divided on the issue.",
          optionA: "are",
          optionB: "is",
          optionC: "were",
          optionD: "have been",
          correctAnswer: "B",
          explanation: "'Committee' is a collective noun that takes a singular verb when referring to the group as a unit.",
          difficulty: "medium",
        },
      ],
    },
    {
      name: "IELTS",
      description: "IELTS (International English Language Testing System) 是国际英语语言测试系统",
      questions: [
        {
          section: "Reading",
          questionText: "According to the passage, what is the main cause of climate change?",
          optionA: "Natural weather cycles",
          optionB: "Human activities releasing greenhouse gases",
          optionC: "Solar radiation changes",
          optionD: "Volcanic eruptions",
          correctAnswer: "B",
          explanation: "The passage clearly states that human activities, particularly the burning of fossil fuels, are the primary driver of climate change.",
          difficulty: "easy",
        },
        {
          section: "Listening",
          questionText: "What time does the library close on Saturdays?",
          optionA: "5:00 PM",
          optionB: "6:00 PM",
          optionC: "7:00 PM",
          optionD: "8:00 PM",
          correctAnswer: "B",
          explanation: "The speaker mentions that the library closes at 6:00 PM on weekends.",
          difficulty: "easy",
        },
      ],
    },
    {
      name: "TOEFL",
      description: "TOEFL (Test of English as a Foreign Language) 是英语作为外语的测试",
      questions: [
        {
          section: "Reading",
          questionText: "The word 'ubiquitous' in paragraph 2 is closest in meaning to:",
          optionA: "Rare",
          optionB: "Everywhere",
          optionC: "Mysterious",
          optionD: "Dangerous",
          correctAnswer: "B",
          explanation: "'Ubiquitous' means present, appearing, or found everywhere.",
          difficulty: "medium",
        },
        {
          section: "Listening",
          questionText: "What is the professor's main point about photosynthesis?",
          optionA: "It only occurs in plants",
          optionB: "It converts light energy to chemical energy",
          optionC: "It is a very slow process",
          optionD: "It requires high temperatures",
          correctAnswer: "B",
          explanation: "The professor emphasizes that photosynthesis converts light energy into chemical energy stored in glucose.",
          difficulty: "medium",
        },
      ],
    },
    {
      name: "ACT",
      description: "ACT (American College Testing) 是美国大学入学考试",
      questions: [
        {
          section: "English",
          questionText: "Choose the best revision: Walking to the store, the rain started to fall.",
          optionA: "Walking to the store, the rain started to fall.",
          optionB: "While I was walking to the store, the rain started to fall.",
          optionC: "The rain started to fall walking to the store.",
          optionD: "To the store walking, the rain started to fall.",
          correctAnswer: "B",
          explanation: "The original sentence has a dangling modifier. Option B correctly identifies who was walking.",
          difficulty: "medium",
        },
        {
          section: "Math",
          questionText: "What is the area of a circle with radius 6?",
          optionA: "12π",
          optionB: "18π",
          optionC: "36π",
          optionD: "72π",
          correctAnswer: "C",
          explanation: "Area = πr² = π × 6² = 36π",
          difficulty: "easy",
        },
        {
          section: "Science",
          questionText: "Based on the data, which variable had the strongest correlation with plant growth?",
          optionA: "Temperature",
          optionB: "Light exposure",
          optionC: "Water amount",
          optionD: "Soil pH",
          correctAnswer: "B",
          explanation: "The graph shows the steepest slope for light exposure vs plant growth.",
          difficulty: "medium",
        },
      ],
    },
  ];

  for (const cat of testCategories) {
    const category = await prisma.testCategory.create({
      data: { name: cat.name, description: cat.description },
    });
    for (const q of cat.questions) {
      await prisma.testQuestion.create({
        data: { ...q, categoryId: category.id },
      });
    }
  }
  console.log("✅ Test questions added");

  console.log("\n🎉 Seeding complete!");
  console.log("\n📋 Test accounts:");
  console.log("  Admin:   admin@upath.com / admin123");
  console.log("  Teacher: teacher@upath.com / teacher123");
  console.log("  Student: student@upath.com / student123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
