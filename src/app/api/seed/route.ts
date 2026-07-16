import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const UNIS = [
  { name: "Harvard University", nameZh: "哈佛大学", country: "United States", city: "Cambridge", state: "Massachusetts", website: "https://www.harvard.edu", description: "Harvard University is a private Ivy League research university in Cambridge, Massachusetts. Founded in 1636, it is the oldest institution of higher learning in the United States.", type: "private", foundedYear: 1636, studentCount: 31000, acceptanceRate: 3.4, avgSAT: 1520, avgACT: 34, avgIELTS: 7.5, avgTOEFL: 104, avgGPA: 4.18, tuitionDomestic: 57261, tuitionInternational: 57261, livingCost: 19600 },
  { name: "Massachusetts Institute of Technology", nameZh: "麻省理工学院", country: "United States", city: "Cambridge", state: "Massachusetts", website: "https://www.mit.edu", description: "MIT is a private research university specializing in science, engineering, and technology.", type: "private", foundedYear: 1861, studentCount: 11934, acceptanceRate: 4.0, avgSAT: 1540, avgACT: 35, avgIELTS: 7.5, avgTOEFL: 100, avgGPA: 4.17, tuitionDomestic: 57986, tuitionInternational: 57986, livingCost: 18300 },
  { name: "Stanford University", nameZh: "斯坦福大学", country: "United States", city: "Stanford", state: "California", website: "https://www.stanford.edu", description: "Stanford University is a private research university located in the heart of Silicon Valley.", type: "private", foundedYear: 1885, studentCount: 17300, acceptanceRate: 3.7, avgSAT: 1510, avgACT: 34, avgIELTS: 7.5, avgTOEFL: 105, avgGPA: 4.18, tuitionDomestic: 58416, tuitionInternational: 58416, livingCost: 19500 },
  { name: "University of Oxford", nameZh: "牛津大学", country: "United Kingdom", city: "Oxford", website: "https://www.ox.ac.uk", description: "The University of Oxford is the oldest university in the English-speaking world.", type: "public", foundedYear: 1096, studentCount: 25500, acceptanceRate: 17.5, avgIELTS: 7.0, avgTOEFL: 100, avgGPA: 3.7, tuitionDomestic: 9250, tuitionInternational: 35080, livingCost: 14500 },
  { name: "University of Cambridge", nameZh: "剑桥大学", country: "United Kingdom", city: "Cambridge", website: "https://www.cam.ac.uk", description: "The University of Cambridge is a collegiate public research university.", type: "public", foundedYear: 1209, studentCount: 24200, acceptanceRate: 21.0, avgIELTS: 7.0, avgTOEFL: 100, avgGPA: 3.7, tuitionDomestic: 9250, tuitionInternational: 33825, livingCost: 14000 },
  { name: "California Institute of Technology", nameZh: "加州理工学院", country: "United States", city: "Pasadena", state: "California", website: "https://www.caltech.edu", description: "Caltech is a private research university known for science and engineering.", type: "private", foundedYear: 1891, studentCount: 2400, acceptanceRate: 3.9, avgSAT: 1545, avgACT: 35, avgIELTS: 7.5, avgTOEFL: 105, avgGPA: 4.19, tuitionDomestic: 60864, tuitionInternational: 60864, livingCost: 18400 },
  { name: "ETH Zurich", nameZh: "苏黎世联邦理工学院", country: "Switzerland", city: "Zurich", website: "https://www.ethz.ch", description: "ETH Zurich is a public research university in science, technology, engineering, and mathematics.", type: "public", foundedYear: 1855, studentCount: 24200, acceptanceRate: 27.0, avgSAT: 1450, avgIELTS: 7.0, avgTOEFL: 100, avgGPA: 3.6, tuitionDomestic: 1460, tuitionInternational: 1460, livingCost: 17000 },
  { name: "Imperial College London", nameZh: "帝国理工学院", country: "United Kingdom", city: "London", website: "https://www.imperial.ac.uk", description: "Imperial College London is a public research university focused on science, engineering, medicine, and business.", type: "public", foundedYear: 1907, studentCount: 20500, acceptanceRate: 14.3, avgIELTS: 6.5, avgTOEFL: 92, avgGPA: 3.6, tuitionDomestic: 9250, tuitionInternational: 35100, livingCost: 16000 },
  { name: "University of Chicago", nameZh: "芝加哥大学", country: "United States", city: "Chicago", state: "Illinois", website: "https://www.uchicago.edu", description: "The University of Chicago is a private research university known for rigorous academic programs.", type: "private", foundedYear: 1890, studentCount: 17200, acceptanceRate: 5.4, avgSAT: 1530, avgACT: 34, avgIELTS: 7.0, avgTOEFL: 104, avgGPA: 4.0, tuitionDomestic: 63900, tuitionInternational: 63900, livingCost: 18100 },
  { name: "National University of Singapore", nameZh: "新加坡国立大学", country: "Singapore", city: "Singapore", website: "https://www.nus.edu.sg", description: "NUS is the flagship national university of Singapore.", type: "public", foundedYear: 1905, studentCount: 38000, acceptanceRate: 25.0, avgSAT: 1380, avgACT: 30, avgIELTS: 6.5, avgTOEFL: 92, avgGPA: 3.5, tuitionDomestic: 8200, tuitionInternational: 30000, livingCost: 12000 },
  { name: "Tsinghua University", nameZh: "清华大学", country: "China", city: "Beijing", website: "https://www.tsinghua.edu.cn", description: "Tsinghua University is known as the MIT of China.", type: "public", foundedYear: 1911, studentCount: 50000, acceptanceRate: 10.0, avgSAT: 1400, avgIELTS: 6.5, avgTOEFL: 90, avgGPA: 3.5, tuitionDomestic: 5000, tuitionInternational: 28000, livingCost: 8000 },
  { name: "Peking University", nameZh: "北京大学", country: "China", city: "Beijing", website: "https://www.pku.edu.cn", description: "Peking University is a national public research university renowned for humanities and sciences.", type: "public", foundedYear: 1898, studentCount: 45000, acceptanceRate: 12.0, avgSAT: 1380, avgIELTS: 6.5, avgTOEFL: 90, avgGPA: 3.4, tuitionDomestic: 5000, tuitionInternational: 26000, livingCost: 8000 },
  { name: "Yale University", nameZh: "耶鲁大学", country: "United States", city: "New Haven", state: "Connecticut", website: "https://www.yale.edu", description: "Yale University is a private Ivy League research university.", type: "private", foundedYear: 1701, studentCount: 14600, acceptanceRate: 4.5, avgSAT: 1515, avgACT: 34, avgIELTS: 7.5, avgTOEFL: 100, avgGPA: 4.14, tuitionDomestic: 62250, tuitionInternational: 62250, livingCost: 18100 },
  { name: "Princeton University", nameZh: "普林斯顿大学", country: "United States", city: "Princeton", state: "New Jersey", website: "https://www.princeton.edu", description: "Princeton University is a private Ivy League research university.", type: "private", foundedYear: 1746, studentCount: 8800, acceptanceRate: 4.4, avgSAT: 1510, avgACT: 34, avgIELTS: 7.5, avgTOEFL: 100, avgGPA: 3.95, tuitionDomestic: 57410, tuitionInternational: 57410, livingCost: 18700 },
  { name: "Columbia University", nameZh: "哥伦比亚大学", country: "United States", city: "New York", state: "New York", website: "https://www.columbia.edu", description: "Columbia University is a private Ivy League research university in New York City.", type: "private", foundedYear: 1754, studentCount: 33400, acceptanceRate: 3.9, avgSAT: 1510, avgACT: 34, avgIELTS: 7.5, avgTOEFL: 100, avgGPA: 4.12, tuitionDomestic: 65524, tuitionInternational: 65524, livingCost: 20600 },
  { name: "University of Pennsylvania", nameZh: "宾夕法尼亚大学", country: "United States", city: "Philadelphia", state: "Pennsylvania", website: "https://www.upenn.edu", description: "UPenn is a private Ivy League university known for its Wharton School.", type: "private", foundedYear: 1740, studentCount: 26200, acceptanceRate: 5.9, avgSAT: 1500, avgACT: 34, avgIELTS: 7.0, avgTOEFL: 100, avgGPA: 4.0, tuitionDomestic: 58620, tuitionInternational: 58620, livingCost: 18200 },
  { name: "University of California, Berkeley", nameZh: "加州大学伯克利分校", country: "United States", city: "Berkeley", state: "California", website: "https://www.berkeley.edu", description: "UC Berkeley is a public research university and the flagship of the UC system.", type: "public", foundedYear: 1868, studentCount: 45200, acceptanceRate: 14.4, avgSAT: 1430, avgACT: 32, avgIELTS: 7.0, avgTOEFL: 90, avgGPA: 4.15, tuitionDomestic: 14400, tuitionInternational: 48000, livingCost: 18200 },
  { name: "University of California, Los Angeles", nameZh: "加州大学洛杉矶分校", country: "United States", city: "Los Angeles", state: "California", website: "https://www.ucla.edu", description: "UCLA is a public research university in Los Angeles.", type: "public", foundedYear: 1919, studentCount: 47600, acceptanceRate: 10.8, avgSAT: 1410, avgACT: 31, avgIELTS: 7.0, avgTOEFL: 87, avgGPA: 4.0, tuitionDomestic: 13800, tuitionInternational: 47000, livingCost: 18400 },
  { name: "Cornell University", nameZh: "康奈尔大学", country: "United States", city: "Ithaca", state: "New York", website: "https://www.cornell.edu", description: "Cornell is a private Ivy League and land-grant research university.", type: "private", foundedYear: 1865, studentCount: 25500, acceptanceRate: 8.7, avgSAT: 1480, avgACT: 33, avgIELTS: 7.0, avgTOEFL: 100, avgGPA: 4.05, tuitionDomestic: 63800, tuitionInternational: 63800, livingCost: 17000 },
  { name: "University of Toronto", nameZh: "多伦多大学", country: "Canada", city: "Toronto", state: "Ontario", website: "https://www.utoronto.ca", description: "The University of Toronto is Canada's largest university.", type: "public", foundedYear: 1827, studentCount: 93000, acceptanceRate: 43.0, avgSAT: 1350, avgACT: 30, avgIELTS: 6.5, avgTOEFL: 89, avgGPA: 3.6, tuitionDomestic: 6100, tuitionInternational: 45000, livingCost: 15000 },
  { name: "University of Melbourne", nameZh: "墨尔本大学", country: "Australia", city: "Melbourne", state: "Victoria", website: "https://www.unimelb.edu.au", description: "The University of Melbourne is Australia's second oldest university.", type: "public", foundedYear: 1853, studentCount: 52000, acceptanceRate: 30.0, avgIELTS: 6.5, avgTOEFL: 79, avgGPA: 3.3, tuitionDomestic: 10000, tuitionInternational: 38000, livingCost: 16000 },
  { name: "University of Tokyo", nameZh: "东京大学", country: "Japan", city: "Tokyo", website: "https://www.u-tokyo.ac.jp", description: "The University of Tokyo is Japan's premier national university.", type: "public", foundedYear: 1877, studentCount: 28200, acceptanceRate: 34.0, avgSAT: 1410, avgIELTS: 6.5, avgTOEFL: 90, avgGPA: 3.5, tuitionDomestic: 535800, tuitionInternational: 535800, livingCost: 12000 },
  { name: "University of Edinburgh", nameZh: "爱丁堡大学", country: "United Kingdom", city: "Edinburgh", website: "https://www.ed.ac.uk", description: "The University of Edinburgh is one of Scotland's ancient universities.", type: "public", foundedYear: 1583, studentCount: 41000, acceptanceRate: 10.0, avgIELTS: 6.5, avgTOEFL: 92, avgGPA: 3.4, tuitionDomestic: 9250, tuitionInternational: 28950, livingCost: 13000 },
  { name: "University of Michigan", nameZh: "密歇根大学安娜堡分校", country: "United States", city: "Ann Arbor", state: "Michigan", website: "https://www.umich.edu", description: "The University of Michigan is a top public research university.", type: "public", foundedYear: 1817, studentCount: 50000, acceptanceRate: 20.0, avgSAT: 1440, avgACT: 32, avgIELTS: 7.0, avgTOEFL: 100, avgGPA: 3.9, tuitionDomestic: 17200, tuitionInternational: 56500, livingCost: 14000 },
  { name: "Northwestern University", nameZh: "西北大学", country: "United States", city: "Evanston", state: "Illinois", website: "https://www.northwestern.edu", description: "Northwestern University is a private research university on Lake Michigan.", type: "private", foundedYear: 1851, studentCount: 23000, acceptanceRate: 7.0, avgSAT: 1490, avgACT: 33, avgIELTS: 7.5, avgTOEFL: 100, avgGPA: 4.1, tuitionDomestic: 63468, tuitionInternational: 63468, livingCost: 18200 },
  { name: "Duke University", nameZh: "杜克大学", country: "United States", city: "Durham", state: "North Carolina", website: "https://www.duke.edu", description: "Duke University is known for law, medicine, business, and public policy.", type: "private", foundedYear: 1838, studentCount: 17200, acceptanceRate: 5.9, avgSAT: 1500, avgACT: 34, avgIELTS: 7.0, avgTOEFL: 100, avgGPA: 4.0, tuitionDomestic: 63450, tuitionInternational: 63450, livingCost: 18300 },
  { name: "Johns Hopkins University", nameZh: "约翰霍普金斯大学", country: "United States", city: "Baltimore", state: "Maryland", website: "https://www.jhu.edu", description: "Johns Hopkins is America's first research university.", type: "private", foundedYear: 1876, studentCount: 29200, acceptanceRate: 7.5, avgSAT: 1505, avgACT: 34, avgIELTS: 7.0, avgTOEFL: 100, avgGPA: 4.0, tuitionDomestic: 60480, tuitionInternational: 60480, livingCost: 17800 },
  { name: "UCL", nameZh: "伦敦大学学院", country: "United Kingdom", city: "London", website: "https://www.ucl.ac.uk", description: "UCL is a public research university in London.", type: "public", foundedYear: 1826, studentCount: 45000, acceptanceRate: 12.0, avgIELTS: 6.5, avgTOEFL: 92, avgGPA: 3.4, tuitionDomestic: 9250, tuitionInternational: 31200, livingCost: 16800 },
  { name: "University of Sydney", nameZh: "悉尼大学", country: "Australia", city: "Sydney", state: "New South Wales", website: "https://www.sydney.edu.au", description: "The University of Sydney is Australia's oldest university.", type: "public", foundedYear: 1850, studentCount: 74000, acceptanceRate: 30.0, avgIELTS: 6.5, avgTOEFL: 85, avgGPA: 3.2, tuitionDomestic: 10000, tuitionInternational: 42000, livingCost: 18000 },
  { name: "University of British Columbia", nameZh: "英属哥伦比亚大学", country: "Canada", city: "Vancouver", state: "British Columbia", website: "https://www.ubc.ca", description: "UBC is a top Canadian public research university.", type: "public", foundedYear: 1908, studentCount: 66000, acceptanceRate: 52.0, avgSAT: 1320, avgACT: 29, avgIELTS: 6.5, avgTOEFL: 90, avgGPA: 3.5, tuitionDomestic: 5600, tuitionInternational: 42000, livingCost: 15500 },
  { name: "University of Hong Kong", nameZh: "香港大学", country: "Hong Kong", city: "Hong Kong", website: "https://www.hku.hk", description: "HKU is the oldest tertiary institution in Hong Kong.", type: "public", foundedYear: 1911, studentCount: 30000, acceptanceRate: 20.0, avgSAT: 1350, avgACT: 30, avgIELTS: 6.5, avgTOEFL: 93, avgGPA: 3.4, tuitionDomestic: 42100, tuitionInternational: 182000, livingCost: 14000 },
  { name: "Seoul National University", nameZh: "首尔大学", country: "South Korea", city: "Seoul", website: "https://www.snu.ac.kr", description: "SNU is the most prestigious university in South Korea.", type: "public", foundedYear: 1946, studentCount: 28200, acceptanceRate: 15.0, avgSAT: 1370, avgIELTS: 6.0, avgTOEFL: 80, avgGPA: 3.3, tuitionDomestic: 6000, tuitionInternational: 12000, livingCost: 10000 },
  { name: "New York University", nameZh: "纽约大学", country: "United States", city: "New York", state: "New York", website: "https://www.nyu.edu", description: "NYU is a private research university in Manhattan.", type: "private", foundedYear: 1831, studentCount: 59000, acceptanceRate: 12.8, avgSAT: 1450, avgACT: 32, avgIELTS: 7.5, avgTOEFL: 100, avgGPA: 3.7, tuitionDomestic: 58168, tuitionInternational: 58168, livingCost: 21000 },
  { name: "University of Texas at Austin", nameZh: "德克萨斯大学奥斯汀分校", country: "United States", city: "Austin", state: "Texas", website: "https://www.utexas.edu", description: "UT Austin is the flagship campus of the UT system.", type: "public", foundedYear: 1883, studentCount: 52000, acceptanceRate: 31.0, avgSAT: 1350, avgACT: 30, avgIELTS: 6.5, avgTOEFL: 79, avgGPA: 3.8, tuitionDomestic: 11800, tuitionInternational: 42000, livingCost: 13500 },
  { name: "University of Washington", nameZh: "华盛顿大学", country: "United States", city: "Seattle", state: "Washington", website: "https://www.washington.edu", description: "UW is a public research university in Seattle.", type: "public", foundedYear: 1861, studentCount: 60000, acceptanceRate: 48.0, avgSAT: 1350, avgACT: 30, avgIELTS: 7.0, avgTOEFL: 76, avgGPA: 3.8, tuitionDomestic: 12300, tuitionInternational: 42000, livingCost: 15000 },
  { name: "McGill University", nameZh: "麦吉尔大学", country: "Canada", city: "Montreal", state: "Quebec", website: "https://www.mcgill.ca", description: "McGill University is a prestigious Canadian research university.", type: "public", foundedYear: 1821, studentCount: 40000, acceptanceRate: 38.0, avgSAT: 1390, avgACT: 31, avgIELTS: 6.5, avgTOEFL: 90, avgGPA: 3.6, tuitionDomestic: 2800, tuitionInternational: 35000, livingCost: 14000 },
  { name: "University of Manchester", nameZh: "曼彻斯特大学", country: "United Kingdom", city: "Manchester", website: "https://www.manchester.ac.uk", description: "The University of Manchester is a Russell Group university.", type: "public", foundedYear: 1824, studentCount: 40000, acceptanceRate: 13.0, avgIELTS: 6.0, avgTOEFL: 80, avgGPA: 3.2, tuitionDomestic: 9250, tuitionInternational: 27000, livingCost: 12000 },
  { name: "University of New South Wales", nameZh: "新南威尔士大学", country: "Australia", city: "Sydney", state: "New South Wales", website: "https://www.unsw.edu.au", description: "UNSW is a Group of Eight Australian university.", type: "public", foundedYear: 1949, studentCount: 63000, acceptanceRate: 35.0, avgIELTS: 6.5, avgTOEFL: 90, avgGPA: 3.2, tuitionDomestic: 10000, tuitionInternational: 40000, livingCost: 18000 },
  { name: "University of Queensland", nameZh: "昆士兰大学", country: "Australia", city: "Brisbane", state: "Queensland", website: "https://www.uq.edu.au", description: "UQ is a Group of Eight university on the Brisbane River.", type: "public", foundedYear: 1909, studentCount: 55000, acceptanceRate: 40.0, avgIELTS: 6.5, avgTOEFL: 87, avgGPA: 3.1, tuitionDomestic: 10000, tuitionInternational: 37000, livingCost: 15000 },
  { name: "Australian National University", nameZh: "澳大利亚国立大学", country: "Australia", city: "Canberra", state: "ACT", website: "https://www.anu.edu.au", description: "ANU is Australia's top university for research.", type: "public", foundedYear: 1946, studentCount: 21000, acceptanceRate: 35.0, avgIELTS: 6.5, avgTOEFL: 80, avgGPA: 3.3, tuitionDomestic: 10000, tuitionInternational: 39000, livingCost: 16000 },
  { name: "Nanyang Technological University", nameZh: "南洋理工大学", country: "Singapore", city: "Singapore", website: "https://www.ntu.edu.sg", description: "NTU is Singapore's second-oldest autonomous university.", type: "public", foundedYear: 1991, studentCount: 33000, acceptanceRate: 30.0, avgSAT: 1350, avgACT: 30, avgIELTS: 6.5, avgTOEFL: 90, avgGPA: 3.4, tuitionDomestic: 8200, tuitionInternational: 28000, livingCost: 12000 },
  { name: "King's College London", nameZh: "伦敦国王学院", country: "United Kingdom", city: "London", website: "https://www.kcl.ac.uk", description: "King's College London is a founding college of the University of London.", type: "public", foundedYear: 1829, studentCount: 33000, acceptanceRate: 13.0, avgIELTS: 6.5, avgTOEFL: 92, avgGPA: 3.3, tuitionDomestic: 9250, tuitionInternational: 28000, livingCost: 16000 },
  { name: "Monash University", nameZh: "莫纳什大学", country: "Australia", city: "Melbourne", state: "Victoria", website: "https://www.monash.edu", description: "Monash University is the largest university in Australia.", type: "public", foundedYear: 1958, studentCount: 86000, acceptanceRate: 45.0, avgIELTS: 6.5, avgTOEFL: 79, avgGPA: 3.0, tuitionDomestic: 10000, tuitionInternational: 37000, livingCost: 16000 },
  { name: "Zhejiang University", nameZh: "浙江大学", country: "China", city: "Hangzhou", state: "Zhejiang", website: "https://www.zju.edu.cn", description: "Zhejiang University is a C9 League university in China.", type: "public", foundedYear: 1897, studentCount: 54000, acceptanceRate: 15.0, avgIELTS: 6.0, avgTOEFL: 85, avgGPA: 3.3, tuitionDomestic: 5000, tuitionInternational: 24000, livingCost: 7000 },
  { name: "Fudan University", nameZh: "复旦大学", country: "China", city: "Shanghai", website: "https://www.fudan.edu.cn", description: "Fudan University is a C9 League university in Shanghai.", type: "public", foundedYear: 1905, studentCount: 34000, acceptanceRate: 16.0, avgIELTS: 6.0, avgTOEFL: 85, avgGPA: 3.3, tuitionDomestic: 5000, tuitionInternational: 24000, livingCost: 9000 },
  { name: "Brown University", nameZh: "布朗大学", country: "United States", city: "Providence", state: "Rhode Island", website: "https://www.brown.edu", description: "Brown University is an Ivy League known for its Open Curriculum.", type: "private", foundedYear: 1764, studentCount: 10700, acceptanceRate: 5.1, avgSAT: 1500, avgACT: 34, avgIELTS: 8.0, avgTOEFL: 100, avgGPA: 4.08, tuitionDomestic: 65146, tuitionInternational: 65146, livingCost: 17900 },
  { name: "Dartmouth College", nameZh: "达特茅斯学院", country: "United States", city: "Hanover", state: "New Hampshire", website: "https://www.dartmouth.edu", description: "Dartmouth is an Ivy League with a strong undergraduate focus.", type: "private", foundedYear: 1769, studentCount: 6600, acceptanceRate: 6.2, avgSAT: 1500, avgACT: 33, avgIELTS: 7.0, avgTOEFL: 100, avgGPA: 4.06, tuitionDomestic: 62430, tuitionInternational: 62430, livingCost: 18000 },
  { name: "University of Wisconsin-Madison", nameZh: "威斯康星大学麦迪逊分校", country: "United States", city: "Madison", state: "Wisconsin", website: "https://www.wisc.edu", description: "UW-Madison is a flagship public research university.", type: "public", foundedYear: 1848, studentCount: 49000, acceptanceRate: 54.0, avgSAT: 1380, avgACT: 30, avgIELTS: 6.5, avgTOEFL: 80, avgGPA: 3.8, tuitionDomestic: 10900, tuitionInternational: 40600, livingCost: 13000 },
];

const RANKS: Record<string, { qs: number; usnews: number }> = {
  "Massachusetts Institute of Technology": { qs: 1, usnews: 2 },
  "University of Cambridge": { qs: 2, usnews: 8 },
  "University of Oxford": { qs: 3, usnews: 5 },
  "Harvard University": { qs: 4, usnews: 1 },
  "Stanford University": { qs: 5, usnews: 3 },
  "Imperial College London": { qs: 6, usnews: 13 },
  "ETH Zurich": { qs: 7, usnews: 29 },
  "National University of Singapore": { qs: 8, usnews: 26 },
  "UCL": { qs: 9, usnews: 12 },
  "University of California, Berkeley": { qs: 10, usnews: 4 },
  "University of Chicago": { qs: 11, usnews: 6 },
  "University of Pennsylvania": { qs: 12, usnews: 15 },
  "Cornell University": { qs: 13, usnews: 21 },
  "University of Melbourne": { qs: 14, usnews: 27 },
  "California Institute of Technology": { qs: 15, usnews: 9 },
  "Yale University": { qs: 16, usnews: 11 },
  "Peking University": { qs: 17, usnews: 39 },
  "Princeton University": { qs: 18, usnews: 16 },
  "University of New South Wales": { qs: 19, usnews: 37 },
  "University of Sydney": { qs: 20, usnews: 28 },
  "University of Toronto": { qs: 21, usnews: 18 },
  "University of Edinburgh": { qs: 22, usnews: 34 },
  "Columbia University": { qs: 23, usnews: 7 },
  "Tsinghua University": { qs: 25, usnews: 23 },
  "University of Hong Kong": { qs: 26, usnews: 55 },
  "University of Tokyo": { qs: 28, usnews: 81 },
  "Johns Hopkins University": { qs: 29, usnews: 10 },
  "University of Michigan": { qs: 30, usnews: 17 },
  "McGill University": { qs: 31, usnews: 54 },
  "Northwestern University": { qs: 32, usnews: 24 },
  "University of Manchester": { qs: 33, usnews: 63 },
  "Duke University": { qs: 34, usnews: 22 },
  "University of British Columbia": { qs: 35, usnews: 35 },
  "University of California, Los Angeles": { qs: 36, usnews: 14 },
  "Australian National University": { qs: 37, usnews: 62 },
  "King's College London": { qs: 38, usnews: 33 },
  "New York University": { qs: 39, usnews: 31 },
  "Seoul National University": { qs: 41, usnews: 129 },
  "Nanyang Technological University": { qs: 42, usnews: 30 },
  "Monash University": { qs: 43, usnews: 40 },
  "University of Queensland": { qs: 44, usnews: 36 },
  "Zhejiang University": { qs: 45, usnews: 93 },
  "Fudan University": { qs: 50, usnews: 116 },
  "Brown University": { qs: 51, usnews: 101 },
  "University of Texas at Austin": { qs: 52, usnews: 43 },
  "Dartmouth College": { qs: 53, usnews: 176 },
  "University of Washington": { qs: 54, usnews: 6 },
  "University of Wisconsin-Madison": { qs: 55, usnews: 39 },
};

export async function GET() {
  try {
    await prisma.ranking.deleteMany();
    await prisma.university.deleteMany();
    await prisma.testQuestion.deleteMany();
    await prisma.testCategory.deleteMany();

    const adminPassword = await bcrypt.hash("admin123", 12);
    const teacherPassword = await bcrypt.hash("teacher123", 12);
    const studentPassword = await bcrypt.hash("student123", 12);
    await prisma.user.upsert({ where: { email: "admin@upath.com" }, update: {}, create: { name: "System Admin", email: "admin@upath.com", password: adminPassword, role: "ADMIN" } });
    await prisma.user.upsert({ where: { email: "teacher@upath.com" }, update: {}, create: { name: "Zhang Laoshi", email: "teacher@upath.com", password: teacherPassword, role: "TEACHER" } });
    await prisma.user.upsert({ where: { email: "student@upath.com" }, update: {}, create: { name: "Xiao Ming", email: "student@upath.com", password: studentPassword, role: "STUDENT" } });

    let count = 0;
    for (const u of UNIS) {
      await prisma.university.create({ data: u });
      count++;
    }

    const allUnis = await prisma.university.findMany();
    let rankCount = 0;
    for (const uni of allUnis) {
      const r = RANKS[uni.name];
      if (r) {
        await prisma.ranking.createMany({
          data: [
            { universityId: uni.id, rank: r.qs, year: 2025, source: "QS" },
            { universityId: uni.id, rank: r.usnews, year: 2025, source: "US_NEWS" },
          ],
        });
        rankCount += 2;
      }
    }

    await prisma.testCategory.createMany({
      data: [
        { name: "SAT", description: "SAT standardized test" },
        { name: "IELTS", description: "IELTS English test" },
        { name: "TOEFL", description: "TOEFL English test" },
        { name: "ACT", description: "ACT standardized test" },
      ],
    });

    return NextResponse.json({ success: true, universities: count, rankings: rankCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
