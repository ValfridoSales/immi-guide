// CRS engine (2025+) — sem pontos por job offer.
// Mantém separado de UI para facilitar futuras atualizações.

export type CLB = 4|5|6|7|8|9|10|11|12;

export type EducationKey =
  | "less_than_secondary"
  | "secondary"
  | "one_year"
  | "two_year"
  | "bachelor_or_3plus"
  | "two_or_more_with_one_3plus"
  | "masters_or_professional"
  | "phd";

export interface LanguageCLBs {
  reading: CLB;
  writing: CLB;
  listening: CLB;
  speaking: CLB;
}

export interface SpouseBlock {
  education?: EducationKey;
  language?: LanguageCLBs;
  canadianExperienceYears?: 0|1|2|3|4|5;
}

export interface AdditionalBlock {
  siblingInCanada?: boolean;
  frenchCLBs?: LanguageCLBs;   // usa mesma escala CLB 4–12
  englishCLBs?: LanguageCLBs;  // p/ bônus francês 25/50
  canadianStudy?: "none"|"1_2"|"3plus";
  pnpNomination?: boolean;
}

export interface InputCRS {
  withSpouse: boolean;
  age: number;
  education: EducationKey;
  firstOfficial: LanguageCLBs;
  secondOfficial?: LanguageCLBs;
  canadianExperienceYears: 0|1|2|3|4|5;
  foreignExperienceYears?: 0|1|2|3|4|5|6;
  hasTradeCertificate?: boolean;
  spouse?: SpouseBlock;
  additional?: AdditionalBlock;
}

const AGE_POINTS = {
  with_spouse: new Map<string, number>([
    ["17_or_less", 0],["18", 90],["19", 95],["20_29", 100],["30", 95],
    ["31", 90],["32", 85],["33", 80],["34", 75],["35", 70],["36", 65],
    ["37", 60],["38", 55],["39", 50],["40", 45],["41", 35],["42", 25],
    ["43", 15],["44", 5],["45_or_more", 0],
  ]),
  no_spouse: new Map<string, number>([
    ["17_or_less", 0],["18", 99],["19", 105],["20_29", 110],["30", 105],
    ["31", 99],["32", 94],["33", 88],["34", 83],["35", 77],["36", 72],
    ["37", 66],["38", 61],["39", 55],["40", 50],["41", 39],["42", 28],
    ["43", 17],["44", 6],["45_or_more", 0],
  ]),
} as const;

const EDUCATION_POINTS: Record<"with_spouse"|"no_spouse", Record<EducationKey, number>> = {
  with_spouse: {
    less_than_secondary: 0, secondary: 28, one_year: 84, two_year: 91,
    bachelor_or_3plus: 112, two_or_more_with_one_3plus: 119,
    masters_or_professional: 126, phd: 140
  },
  no_spouse: {
    less_than_secondary: 0, secondary: 30, one_year: 90, two_year: 98,
    bachelor_or_3plus: 120, two_or_more_with_one_3plus: 128,
    masters_or_professional: 135, phd: 150
  }
};

const FIRST_LANG_PER_SKILL = {
  with_spouse: { 4:0, 5:6, 6:8, 7:16, 8:22, 9:29, 10:32, 11:32, 12:32 } as Record<number, number>,
  no_spouse:   { 4:0, 5:6, 6:9, 7:17, 8:23, 9:31, 10:34, 11:34, 12:34 } as Record<number, number>,
};

const SECOND_LANG_PER_SKILL = {
  with_spouse: { low:0, clb5_6:1, clb7_8:3, clb9plus:6, cap:22 },
  no_spouse:   { low:0, clb5_6:1, clb7_8:3, clb9plus:6, cap:24 },
} as const;

const CDN_EXP_POINTS = {
  with_spouse: { 0:0, 1:35, 2:46, 3:56, 4:63, 5:70 } as Record<number, number>,
  no_spouse:   { 0:0, 1:40, 2:53, 3:64, 4:72, 5:80 } as Record<number, number>,
};

const SPOUSE_POINTS = {
  education: {
    less_than_secondary: 0, secondary: 2, one_year: 6, two_year: 7,
    bachelor_or_3plus: 8, two_or_more_with_one_3plus: 9,
    masters_or_professional: 10, phd: 10,
  } as Record<EducationKey, number>,
  language_per_skill: { 4:0, 5:1, 6:1, 7:3, 8:3, 9:5, 10:5, 11:5, 12:5 } as Record<number, number>,
  canadian_experience: { 0:0, 1:5, 2:7, 3:8, 4:9, 5:10 } as Record<number, number>,
  cap_total: 40,
} as const;

const TRANSFER_CAP = 100 as const;

const ADDITIONAL = {
  sibling: 15,
  french: { plus25: 25, plus50: 50 },
  canadianStudy: { "none": 0, "1_2": 15, "3plus": 30 } as Record<"none"|"1_2"|"3plus", number>,
  pnp: 600,
  jobOffer: 0 // 2025+
} as const;

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function pointsAge(withSpouse: boolean, age: number): number {
  const t = withSpouse ? AGE_POINTS.with_spouse : AGE_POINTS.no_spouse;
  if (age <= 17) return t.get("17_or_less")!;
  if (age === 18) return t.get("18")!;
  if (age === 19) return t.get("19")!;
  if (age >= 20 && age <= 29) return t.get("20_29")!;
  if (age === 30) return t.get("30")!;
  if (age === 31) return t.get("31")!;
  if (age === 32) return t.get("32")!;
  if (age === 33) return t.get("33")!;
  if (age === 34) return t.get("34")!;
  if (age === 35) return t.get("35")!;
  if (age === 36) return t.get("36")!;
  if (age === 37) return t.get("37")!;
  if (age === 38) return t.get("38")!;
  if (age === 39) return t.get("39")!;
  if (age === 40) return t.get("40")!;
  if (age === 41) return t.get("41")!;
  if (age === 42) return t.get("42")!;
  if (age === 43) return t.get("43")!;
  if (age === 44) return t.get("44")!;
  return t.get("45_or_more")!;
}

function sumFirstOfficial(withSpouse: boolean, clbs: LanguageCLBs): number {
  const table = withSpouse ? FIRST_LANG_PER_SKILL.with_spouse : FIRST_LANG_PER_SKILL.no_spouse;
  const perSkill = [clbs.reading, clbs.writing, clbs.listening, clbs.speaking]
    .map(c => clamp(c, 4, 12)).map(c => table[c] ?? 0);
  return perSkill.reduce((a,b)=>a+b, 0);
}

function sumSecondOfficial(withSpouse: boolean, clbs?: LanguageCLBs): number {
  if (!clbs) return 0;
  const t = withSpouse ? SECOND_LANG_PER_SKILL.with_spouse : SECOND_LANG_PER_SKILL.no_spouse;
  let sum = 0;
  for (const c of [clbs.reading, clbs.writing, clbs.listening, clbs.speaking]) {
    const v = (c <= 4) ? t.low : (c <= 6) ? t.clb5_6 : (c <= 8) ? t.clb7_8 : t.clb9plus;
    sum += v;
  }
  return Math.min(sum, t.cap);
}

function pointsCanadianExp(withSpouse: boolean, years: number): number {
  const t = withSpouse ? CDN_EXP_POINTS.with_spouse : CDN_EXP_POINTS.no_spouse;
  const y = years >= 5 ? 5 : (years as 0|1|2|3|4|5);
  return t[y] ?? 0;
}

function isAllAtLeast(clbs: LanguageCLBs | undefined, min: CLB): boolean {
  if (!clbs) return false;
  return clbs.reading >= min && clbs.writing >= min && clbs.listening >= min && clbs.speaking >= min;
}

function eduBucket(edu: EducationKey): "secondary_or_less"|"one_year_plus"|"two_or_more_or_masters_or_phd" {
  if (edu === "less_than_secondary" || edu === "secondary") return "secondary_or_less";
  if (edu === "one_year" || edu === "two_year" || edu === "bachelor_or_3plus") return "one_year_plus";
  return "two_or_more_or_masters_or_phd";
}

function foreignYearsBucket(n?: number): "0"|"1_2"|"3plus" {
  if (!n || n < 1) return "0";
  if (n === 1 || n === 2) return "1_2";
  return "3plus";
}

function cdnYearsBucket(n: number): "0"|"one"|"two" {
  if (!n) return "0";
  if (n >= 2) return "two";
  return "one";
}

function computeTransferability(
  edu: EducationKey,
  firstLang: LanguageCLBs,
  cdnExpYears: number,
  foreignExpYears: number|undefined,
  hasTradeCertificate: boolean|undefined
): number {
  const eduClass = eduBucket(edu);
  const clb7_all = isAllAtLeast(firstLang, 7);
  const clb9_all = isAllAtLeast(firstLang, 9);

  // CATEGORIA 1: EDUCATION (máx 50)
  let educationCategory = 0;
  
  // A) Educação x Idioma
  if (clb9_all) {
    if (eduClass === "one_year_plus") educationCategory += 25;
    if (eduClass === "two_or_more_or_masters_or_phd") educationCategory += 50;
  } else if (clb7_all) {
    if (eduClass === "one_year_plus") educationCategory += 13;
    if (eduClass === "two_or_more_or_masters_or_phd") educationCategory += 25;
  }

  // B) Educação x Experiência canadense
  const cdnBucket = cdnYearsBucket(cdnExpYears);
  if (cdnBucket === "one") {
    if (eduClass === "one_year_plus") educationCategory += 13;
    if (eduClass === "two_or_more_or_masters_or_phd") educationCategory += 25;
  } else if (cdnBucket === "two") {
    if (eduClass === "one_year_plus") educationCategory += 25;
    if (eduClass === "two_or_more_or_masters_or_phd") educationCategory += 50;
  }
  
  educationCategory = Math.min(educationCategory, 50);

  // CATEGORIA 2: FOREIGN WORK EXPERIENCE (máx 50)
  let foreignCategory = 0;
  const foreignBucket = foreignYearsBucket(foreignExpYears);
  
  // A) Exp. estrangeira x Idioma
  if (clb9_all) {
    if (foreignBucket === "1_2") foreignCategory += 25;
    if (foreignBucket === "3plus") foreignCategory += 50;
  } else if (clb7_all) {
    if (foreignBucket === "1_2") foreignCategory += 13;
    if (foreignBucket === "3plus") foreignCategory += 25;
  }

  // B) Exp. estrangeira x Exp. canadense
  if (cdnBucket === "one") {
    if (foreignBucket === "1_2") foreignCategory += 13;
    if (foreignBucket === "3plus") foreignCategory += 25;
  } else if (cdnBucket === "two") {
    if (foreignBucket === "1_2") foreignCategory += 25;
    if (foreignBucket === "3plus") foreignCategory += 50;
  }
  
  foreignCategory = Math.min(foreignCategory, 50);

  // CATEGORIA 3: CERTIFICATE OF QUALIFICATION (máx 50)
  let certificateCategory = 0;
  if (hasTradeCertificate) {
    const clb5_all_min_one_under7 =
      isAllAtLeast(firstLang, 5) && !(isAllAtLeast(firstLang, 7));
    if (clb5_all_min_one_under7) certificateCategory += 25;
    if (clb7_all) certificateCategory += 50;
  }
  
  certificateCategory = Math.min(certificateCategory, 50);

  // TOTAL: soma das categorias com cap de 100
  return Math.min(educationCategory + foreignCategory + certificateCategory, 100);
}

function computeSpousePoints(sp?: SpouseBlock): number {
  if (!sp) return 0;
  let total = 0;
  if (sp.education) total += SPOUSE_POINTS.education[sp.education] ?? 0;
  if (sp.language) {
    const t = SPOUSE_POINTS.language_per_skill;
    const sumLang = [sp.language.reading, sp.language.writing, sp.language.listening, sp.language.speaking]
      .map(c => clamp(c, 4, 12))
      .map(c => t[c] ?? 0)
      .reduce((a,b)=>a+b, 0);
    total += Math.min(sumLang, 20);
  }
  if (typeof sp.canadianExperienceYears === "number") {
    total += SPOUSE_POINTS.canadian_experience[Math.min(5, sp.canadianExperienceYears)] ?? 0;
  }
  return Math.min(total, SPOUSE_POINTS.cap_total);
}

function computeAdditional(a?: AdditionalBlock): number {
  if (!a) return 0;
  let pts = 0;
  if (a.pnpNomination) pts += ADDITIONAL.pnp;
  if (a.siblingInCanada) pts += ADDITIONAL.sibling;
  pts += ADDITIONAL.canadianStudy[a.canadianStudy ?? "none"] ?? 0;

  // Francês 25/50
  if (a.frenchCLBs && isAllAtLeast(a.frenchCLBs, 7)) {
    const engAll5plus = a.englishCLBs && isAllAtLeast(a.englishCLBs, 5);
    pts += engAll5plus ? ADDITIONAL.french.plus50 : ADDITIONAL.french.plus25;
  }
  // Job offer = 0 (2025+)
  return pts;
}

function computeCore(withSpouse: boolean, i: InputCRS): number {
  let sum = 0;
  sum += pointsAge(withSpouse, i.age);
  sum += EDUCATION_POINTS[withSpouse ? "with_spouse" : "no_spouse"][i.education] ?? 0;
  sum += sumFirstOfficial(withSpouse, i.firstOfficial);
  sum += sumSecondOfficial(withSpouse, i.secondOfficial);
  sum += pointsCanadianExp(withSpouse, i.canadianExperienceYears);
  return Math.min(sum, (withSpouse ? 460 : 500));
}

export interface CRSResult {
  core: number;
  spouse: number;
  transferability: number;
  additional: number;
  total: number;
}

export function computeCrs(i: InputCRS): CRSResult {
  const core = computeCore(i.withSpouse, i);
  const spouse = i.withSpouse ? computeSpousePoints(i.spouse) : 0;
  const transferability = computeTransferability(
    i.education,
    i.firstOfficial,
    i.canadianExperienceYears,
    i.foreignExperienceYears ?? 0,
    i.hasTradeCertificate
  );
  const additional = computeAdditional(i.additional);
  return { core, spouse, transferability, additional, total: core + spouse + transferability + additional };
}
