// Scoring System V2 - Aligned with 2024-2025 changes
// Based on program suitability scoring (0-100 scale)

export interface ProgramWeights {
  idade: number;
  educ: number;
  idioma: number;
  exp_teer03: number;
  can_exp: number;
  vinc_prov: number;
  categoria: number;
  custo?: number;
  empreendedor?: number;
  port_cultural?: number;
}

export const PROGRAM_WEIGHTS: Record<string, ProgramWeights> = {
  fsw: { idade: 25, educ: 15, idioma: 30, exp_teer03: 20, can_exp: 0, vinc_prov: 5, categoria: 5 },
  cec: { idade: 15, educ: 10, idioma: 25, exp_teer03: 10, can_exp: 30, vinc_prov: 5, categoria: 5 },
  fst: { idade: 10, educ: 5, idioma: 20, exp_teer03: 35, can_exp: 15, vinc_prov: 5, categoria: 10 },
  pnp: { idade: 15, educ: 10, idioma: 20, exp_teer03: 25, can_exp: 15, vinc_prov: 15, categoria: 0 },
  study: { idade: 5, educ: 20, idioma: 20, exp_teer03: 0, can_exp: 0, vinc_prov: 5, categoria: 0, custo: 50 },
  family: { idade: 0, educ: 0, idioma: 0, exp_teer03: 0, can_exp: 0, vinc_prov: 0, categoria: 0 },
  startup: { idade: 0, educ: 10, idioma: 10, exp_teer03: 0, can_exp: 0, vinc_prov: 0, categoria: 0, empreendedor: 80 },
  selfemp: { idade: 0, educ: 10, idioma: 10, exp_teer03: 0, can_exp: 0, vinc_prov: 0, categoria: 0, port_cultural: 80 },
};

// Age scoring scale (max 25 points)
export const AGE_SCORES: Record<string, number> = {
  '18-29': 25,
  '30-35': 20,
  '36-40': 14,
  '41-45': 5,
  '46+': 0,
};

// Education scoring scale (max 15 points)
export const EDUCATION_SCORES: Record<string, number> = {
  high_school: 2,
  diploma: 6,
  bachelor: 10,
  post_grad: 12,
  masters: 14,
  phd: 15,
};

// Language scoring scales by program
export const LANGUAGE_SCORES = {
  fsw: {
    clb_4: 0, // Below minimum
    clb_5: 0, // Below minimum
    clb_6: 0, // Below minimum
    clb_7: 18,
    clb_8: 24,
    clb_9: 28,
    clb_10: 30,
  },
  cec_teer01: {
    clb_4: 0, // Below minimum
    clb_5: 0, // Below minimum
    clb_6: 0, // Below minimum
    clb_7: 25,
    clb_8: 25,
    clb_9: 25,
    clb_10: 25,
  },
  cec_teer23: {
    clb_4: 0, // Below minimum
    clb_5: 15,
    clb_6: 20,
    clb_7: 25,
    clb_8: 25,
    clb_9: 25,
    clb_10: 25,
  },
  fst: {
    clb_4: 12, // Minimum for FST
    clb_5: 16,
    clb_6: 18,
    clb_7: 20,
    clb_8: 20,
    clb_9: 20,
    clb_10: 20,
  },
  general: {
    clb_4: 5,
    clb_5: 10,
    clb_6: 15,
    clb_7: 20,
    clb_8: 20,
    clb_9: 20,
    clb_10: 20,
  },
};

// Work experience scoring (max varies by program)
export const EXPERIENCE_SCORES: Record<string, number> = {
  none: 0,
  'less-1': 0,
  '1-year': 8,
  '2-3': 14,
  '4-5': 18,
  '6+': 20, // 35 for FST
};

// Canadian experience scoring
export const CANADA_EXPERIENCE_SCORES: Record<string, number> = {
  none: 0,
  '1-year': 20, // For CEC, 10 for others
  '2+': 30, // For CEC, 15 for others
};

// Settlement funds requirements (CAD) - 2025 rates
export const SETTLEMENT_FUNDS_MIN = {
  1: 15263,
  2: 19000,
  3: 23400,
  4: 28400,
  5: 32200,
  6: 36400,
  7: 40600,
};

// Study permit cost of living (CAD) - 2025/26 rates
export const STUDY_COST_OF_LIVING_MIN = {
  1: 22895,
  2: 28500,
  3: 34000,
  4: 40000,
  5: 45000,
  6: 50000,
  7: 55000,
};

// Program thresholds for eligibility
export const PROGRAM_THRESHOLDS = {
  fsw: 50,
  cec: 45,
  fst: 40,
  pnp: 35,
  quebec: 40,
  family: 30,
  study: 35,
  startup: 45,
  selfemp: 40,
};

// Category-based selection areas
export const CBS_CATEGORIES = [
  'stem',
  'healthcare', 
  'trades',
  'transport',
  'agri_food',
  'education'
];

// Provincial connection scoring
export const PROVINCIAL_CONNECTION_SCORES: Record<string, number> = {
  ontario: 10,
  bc: 12,
  alberta: 15,
  quebec: 20, // Quebec-specific
  saskatchewan: 18,
  manitoba: 18,
  maritimes: 20,
  'no-preference': 5,
};