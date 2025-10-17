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

// -------- TEF Canada → NCLC (CLB equivalent) --------
// TEF Canada scores: Reading (0-300), Listening (0-360), Writing (0-450), Speaking (0-450)
function tefScoreToCLB_R(score: number): CLB {
  if (score >= 263) return 10;
  if (score >= 248) return 9;
  if (score >= 233) return 8;
  if (score >= 207) return 7;
  if (score >= 181) return 6;
  if (score >= 151) return 5;
  if (score >= 121) return 4;
  return 4;
}

function tefScoreToCLB_W(score: number): CLB {
  if (score >= 415) return 10;
  if (score >= 393) return 9;
  if (score >= 371) return 8;
  if (score >= 349) return 7;
  if (score >= 310) return 6;
  if (score >= 271) return 5;
  if (score >= 226) return 4;
  return 4;
}

function tefScoreToCLB_L(score: number): CLB {
  if (score >= 316) return 10;
  if (score >= 298) return 9;
  if (score >= 280) return 8;
  if (score >= 249) return 7;
  if (score >= 217) return 6;
  if (score >= 181) return 5;
  if (score >= 145) return 4;
  return 4;
}

function tefScoreToCLB_S(score: number): CLB {
  if (score >= 415) return 10;
  if (score >= 393) return 9;
  if (score >= 371) return 8;
  if (score >= 349) return 7;
  if (score >= 310) return 6;
  if (score >= 271) return 5;
  if (score >= 226) return 4;
  return 4;
}

export function mapTEFCanadaToCLBs(scores: {reading:number; writing:number; listening:number; speaking:number;}): LanguageCLBs {
  return {
    reading:  tefScoreToCLB_R(scores.reading),
    writing:  tefScoreToCLB_W(scores.writing),
    listening:tefScoreToCLB_L(scores.listening),
    speaking: tefScoreToCLB_S(scores.speaking),
  };
}

// -------- TCF Canada → NCLC (CLB equivalent) --------
// TCF Canada scores: Reading (0-699), Listening (0-699), Writing (0-20), Speaking (0-20)
function tcfScoreToCLB_R(score: number): CLB {
  if (score >= 549) return 10;
  if (score >= 524) return 9;
  if (score >= 499) return 8;
  if (score >= 453) return 7;
  if (score >= 406) return 6;
  if (score >= 375) return 5;
  if (score >= 342) return 4;
  return 4;
}

function tcfScoreToCLB_W(score: number): CLB {
  if (score >= 16) return 10;
  if (score >= 14) return 9;
  if (score >= 12) return 8;
  if (score >= 10) return 7;
  if (score >= 7) return 6;
  if (score >= 6) return 5;
  if (score >= 4) return 4;
  return 4;
}

function tcfScoreToCLB_L(score: number): CLB {
  if (score >= 549) return 10;
  if (score >= 523) return 9;
  if (score >= 503) return 8;
  if (score >= 458) return 7;
  if (score >= 398) return 6;
  if (score >= 369) return 5;
  if (score >= 331) return 4;
  return 4;
}

function tcfScoreToCLB_S(score: number): CLB {
  if (score >= 16) return 10;
  if (score >= 14) return 9;
  if (score >= 12) return 8;
  if (score >= 10) return 7;
  if (score >= 7) return 6;
  if (score >= 6) return 5;
  if (score >= 4) return 4;
  return 4;
}

export function mapTCFCanadaToCLBs(scores: {reading:number; writing:number; listening:number; speaking:number;}): LanguageCLBs {
  return {
    reading:  tcfScoreToCLB_R(scores.reading),
    writing:  tcfScoreToCLB_W(scores.writing),
    listening:tcfScoreToCLB_L(scores.listening),
    speaking: tcfScoreToCLB_S(scores.speaking),
  };
}

// TODO: Implementar PTE Core → CLB
// export function mapPTECoreToCLBs(scores: {...}): LanguageCLBs { ... }
