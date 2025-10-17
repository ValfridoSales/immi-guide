// Converte notas brutas → CLB para IELTS (General) e CELPIP-G.
// TODO: Adicionar suporte para PTE Core, TEF Canada, TCF Canada

import type { CLB, LanguageCLBs } from "./crs-engine";

// -------- IELTS (General) → CLB --------
function ieltsBandToCLB_R(band: number): CLB {
  if (band >= 8.0) return 10;
  if (band >= 7.0) return 9;
  if (band >= 6.5) return 8;
  if (band >= 6.0) return 7;
  if (band >= 5.0) return 6;
  if (band >= 4.0) return 5;
  if (band >= 3.5) return 4;
  return 4;
}

function ieltsBandToCLB_W(band: number): CLB {
  if (band >= 7.5) return 10;
  if (band >= 7.0) return 9;
  if (band >= 6.5) return 8;
  if (band >= 6.0) return 7;
  if (band >= 5.5) return 6;
  if (band >= 5.0) return 5;
  if (band >= 4.0) return 4;
  return 4;
}

function ieltsBandToCLB_L(band: number): CLB {
  if (band >= 8.5) return 10;
  if (band >= 8.0) return 9;
  if (band >= 7.5) return 8;
  if (band >= 6.0) return 7;
  if (band >= 5.5) return 6;
  if (band >= 5.0) return 5;
  if (band >= 4.5) return 4;
  return 4;
}

function ieltsBandToCLB_S(band: number): CLB {
  if (band >= 7.5) return 10;
  if (band >= 7.0) return 9;
  if (band >= 6.5) return 8;
  if (band >= 6.0) return 7;
  if (band >= 5.5) return 6;
  if (band >= 5.0) return 5;
  if (band >= 4.0) return 4;
  return 4;
}

export function mapIELTSGeneralToCLBs(scores: {reading:number; writing:number; listening:number; speaking:number;}): LanguageCLBs {
  return {
    reading:  ieltsBandToCLB_R(scores.reading),
    writing:  ieltsBandToCLB_W(scores.writing),
    listening:ieltsBandToCLB_L(scores.listening),
    speaking: ieltsBandToCLB_S(scores.speaking),
  };
}

// -------- CELPIP-G → CLB --------
// CELPIP já vem em níveis 4–12 (equivalem a CLB 4–12).
export function mapCELPIPToCLBs(scores: {reading:number; writing:number; listening:number; speaking:number;}): LanguageCLBs {
  const clamp = (n:number) => (n<4?4:(n>12?12:n)) as CLB;
  return {
    reading:  clamp(scores.reading),
    writing:  clamp(scores.writing),
    listening: clamp(scores.listening),
    speaking:  clamp(scores.speaking),
  };
}

// TODO: Implementar PTE Core → CLB
// export function mapPTECoreToCLBs(scores: {...}): LanguageCLBs { ... }

// TODO: Implementar TEF Canada → NCLC (equivalente francês do CLB)
// export function mapTEFCanadaToCLBs(scores: {...}): LanguageCLBs { ... }

// TODO: Implementar TCF Canada → NCLC
// export function mapTCFCanadaToCLBs(scores: {...}): LanguageCLBs { ... }
