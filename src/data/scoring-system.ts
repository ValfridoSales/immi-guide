interface ScoringMatrix {
  [key: string]: {
    [value: string]: {
      express: number;
      pnp: number;
      quebec: number;
      family: number;
      study: number;
      startup: number;
    };
  };
}

export const SCORING_MATRIX: ScoringMatrix = {
  age: {
    '18-29': { express: 30, pnp: 25, quebec: 20, family: 10, study: 25, startup: 20 },
    '30-35': { express: 25, pnp: 20, quebec: 18, family: 10, study: 15, startup: 25 },
    '36-40': { express: 15, pnp: 15, quebec: 15, family: 10, study: 10, startup: 20 },
    '41-45': { express: 10, pnp: 12, quebec: 12, family: 10, study: 5, startup: 15 },
    '46+': { express: 0, pnp: 8, quebec: 8, family: 10, study: 3, startup: 10 },
  },
  education: {
    'high_school': { express: 5, pnp: 8, quebec: 5, family: 5, study: 20, startup: 5 },
    'diploma': { express: 15, pnp: 18, quebec: 15, family: 10, study: 25, startup: 15 },
    'bachelor': { express: 21, pnp: 22, quebec: 20, family: 15, study: 30, startup: 20 },
    'masters': { express: 23, pnp: 25, quebec: 25, family: 20, study: 35, startup: 25 },
    'phd': { express: 25, pnp: 27, quebec: 30, family: 25, study: 40, startup: 30 },
  },
  experience: {
    'less-1': { express: 0, pnp: 5, quebec: 0, family: 5, study: 15, startup: 5 },
    '1-year': { express: 9, pnp: 10, quebec: 8, family: 10, study: 10, startup: 10 },
    '2-3': { express: 11, pnp: 15, quebec: 12, family: 15, study: 8, startup: 15 },
    '4-5': { express: 13, pnp: 17, quebec: 15, family: 20, study: 5, startup: 20 },
    '6+': { express: 15, pnp: 20, quebec: 18, family: 25, study: 3, startup: 25 },
  },
  english: {
    'basic': { express: 0, pnp: 5, quebec: 0, family: 5, study: 10, startup: 5 },
    'intermediate': { express: 6, pnp: 15, quebec: 5, family: 10, study: 20, startup: 15 },
    'upper_intermediate': { express: 16, pnp: 20, quebec: 15, family: 15, study: 25, startup: 20 },
    'advanced': { express: 24, pnp: 25, quebec: 20, family: 20, study: 30, startup: 25 },
    'unknown': { express: 3, pnp: 8, quebec: 3, family: 8, study: 15, startup: 10 },
  },
  french: {
    'none': { express: 0, pnp: 0, quebec: 0, family: 0, study: 0, startup: 0 },
    'basic': { express: 4, pnp: 2, quebec: 8, family: 2, study: 5, startup: 3 },
    'intermediate': { express: 8, pnp: 5, quebec: 16, family: 5, study: 10, startup: 8 },
    'advanced': { express: 15, pnp: 10, quebec: 25, family: 10, study: 15, startup: 15 },
  },
  funds: {
    'less-12k': { express: 0, pnp: 0, quebec: 0, family: 10, study: 5, startup: 0 },
    '12k-20k': { express: 5, pnp: 8, quebec: 5, family: 15, study: 15, startup: 5 },
    '20k-30k': { express: 10, pnp: 12, quebec: 10, family: 20, study: 25, startup: 15 },
    '30k+': { express: 15, pnp: 15, quebec: 15, family: 25, study: 30, startup: 30 },
  },
  family: {
    'spouse': { express: 5, pnp: 5, quebec: 5, family: 50, study: 10, startup: 5 },
    'parents': { express: 5, pnp: 5, quebec: 5, family: 40, study: 10, startup: 5 },
    'siblings': { express: 15, pnp: 15, quebec: 8, family: 35, study: 10, startup: 10 },
    'other': { express: 5, pnp: 8, quebec: 5, family: 25, study: 5, startup: 5 },
    'none': { express: 0, pnp: 0, quebec: 0, family: 0, study: 0, startup: 0 },
  },
  province: {
    'ontario': { express: 5, pnp: 10, quebec: 0, family: 10, study: 15, startup: 15 },
    'bc': { express: 5, pnp: 15, quebec: 0, family: 10, study: 20, startup: 20 },
    'alberta': { express: 5, pnp: 20, quebec: 0, family: 10, study: 15, startup: 15 },
    'quebec': { express: 0, pnp: 0, quebec: 30, family: 5, study: 10, startup: 5 },
    'maritimes': { express: 5, pnp: 25, quebec: 0, family: 10, study: 10, startup: 10 },
    'prairies': { express: 5, pnp: 22, quebec: 0, family: 10, study: 12, startup: 12 },
    'no-preference': { express: 10, pnp: 15, quebec: 5, family: 15, study: 15, startup: 15 },
  },
};

export const PROGRAM_THRESHOLDS = {
  express: 65,
  pnp: 45,
  quebec: 50,
  family: 30,
  study: 40,
  startup: 55,
};