import React from 'react';
import { AbsoluteFill } from 'remotion';
import { FAMILY, FEES_PAYMENT } from './demo';
import { Backdrop } from './fx';
import { Lang, LangProvider } from './lang';
import { Device, DEVICE_H, DEVICE_W } from './ui/Device';
import { ParentFeesScreen } from './ui/fees';
import { ReceiptPdfScreen } from './ui/receiptDoc';

/**
 * The parent's fees, from the tab to the receipt, side by side: « Frais » on
 * its pending tab (all paid), on its history, and the receipt PDF opened from
 * it. Check them against the app and a downloaded receipt.
 */
export const KitFees: React.FC<{ lang: Lang }> = ({ lang }) => {
  const payment = { description: FEES_PAYMENT.description, student: FAMILY.son, invoice: FEES_PAYMENT.invoice, amount: FEES_PAYMENT.amount, date: FEES_PAYMENT.date };
  const phones = [
    <ParentFeesScreen key="p" tab="pending" payment={payment} />,
    <ParentFeesScreen key="h" tab="history" payment={payment} />,
    <ReceiptPdfScreen key="r" />,
  ];
  const s = 0.55;
  return (
    <LangProvider lang={lang}>
      <AbsoluteFill>
        <Backdrop mood="paper" grid={false} />
        {phones.map((screen, i) => (
          <div key={i} style={{ position: 'absolute', left: 30 + i * 345 + (DEVICE_W * s) / 2 - DEVICE_W / 2, top: 960 - DEVICE_H / 2, scale: String(s) }}>
            <Device statusTone={i === 2 ? 'light' : 'dark'}>{screen}</Device>
          </div>
        ))}
      </AbsoluteFill>
    </LangProvider>
  );
};
