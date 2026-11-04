import React from 'react';
import { Chevre01 } from './Chevre';

/**
 * chevre-01 — « La chèvre a encore frappé », ép. 1 « Le reçu » (fee
 * collection, October 2026), French and Arabic, 30 s, no voice, looping.
 *
 *   Chevre01-FR/AR          the published cuts, cover on frame 0
 *   Chevre01-FR/AR-Check    the same with the Reels/TikTok zones drawn
 *   Chevre01-Cover-FR/AR    the cover as a still
 *   Chevre01-<scene>        each scene alone, in French
 */
export const Chevre01Compositions: React.FC = () => <Chevre01.Compositions prefix="Chevre01" folder="chevre-01" />;
