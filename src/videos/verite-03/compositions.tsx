import React from 'react';
import { VERITE_03, VERITE_03_PLAIN } from './Verite';

/**
 * verite-03 — « Qui ne dit pas la vérité ? », episode 3 (Zahra's report card), French and Arabic, no voice.
 * Verite03 ends on the father's own average, INVÉRIFIABLE (30 s); Verite03-Plain ends on the celebration (28.5 s).
 */
export const Verite03Compositions: React.FC = () => (
  <>
    <VERITE_03.Compositions prefix="Verite03" folder="verite-03" />
    <VERITE_03_PLAIN.Compositions prefix="Verite03-Plain" folder="verite-03-plain" cutsOnly />
  </>
);
