import React from 'react';
import { Chevre02 } from './Chevre';

/**
 * chevre-02 — « La chèvre a encore frappé », ép. 2 « La copie » (the first
 * tests, end of October 2026), French and Arabic, 24 s, no voice, looping.
 *
 *   Chevre02-FR/AR          the published cuts, cover on frame 0
 *   Chevre02-FR/AR-Check    the same with the Reels/TikTok zones drawn
 *   Chevre02-Cover-FR/AR    the cover as a still
 *   Chevre02-<scene>        each scene alone, in French
 */
export const Chevre02Compositions: React.FC = () => <Chevre02.Compositions prefix="Chevre02" folder="chevre-02" />;
