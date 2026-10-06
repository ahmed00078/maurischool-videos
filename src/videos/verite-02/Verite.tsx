import React from 'react';
import { useCurrentFrame } from 'remotion';
import { fill, NOTIFS } from '../../shared/appCopy';
import { useBeat } from '../../shared/beat';
import { FAMILY } from '../../shared/demo';
import { useLang } from '../../shared/lang';
import { EASE_IN_OUT, tween } from '../../shared/tokens';
import { InboxItem } from '../../shared/ui/inbox';
import { MarkerCircle } from '../../shared/ui/lineup';
import { makeEpisode } from '../../shared/verite/episode';
import { BustedScene, CheckScene, ClaimScene, HookScene, LANDED, OutroScene, Shot, VoteScene } from '../../shared/verite/scenes';
import { handsAt, lookAt } from '../../shared/verite/stage';
import { COPY } from './copy';
import { timelineFor } from './timeline';

/**
 * « Qui ne dit pas la vérité ? », episode 2, « Le henné ». Everyone expects
 * Sidi again: this time his 16 in French is true, the father's deadline is
 * true, and Zahra, the good student, was not at school all day. The clue:
 * henna on her hands, on the placard from the first frame. It was her
 * cousin's wedding.
 */

/**
 * Mum's inbox on Wednesday 14 October, newest first, so the rows read in the
 * order of the reveal: Sidi's grade at lunch, the school's reminder of the
 * November instalment, and at the bottom, from this morning, Zahra's absence.
 */
const useFamilyInbox = (): InboxItem[] => {
  const { lang } = useLang();
  const n = (key: keyof typeof NOTIFS, params: Record<string, string>) => ({
    title: fill(NOTIFS[key].title[lang], params),
    message: fill(NOTIFS[key].message[lang], params),
  });
  return [
    {
      category: 'grades',
      time: '12:10',
      ...n('grade_published_parent', {
        student_name: FAMILY.son[lang],
        grade: FAMILY.sonFrenchGrade.value,
        subject_name: FAMILY.sonFrenchGrade.subject[lang],
        period: FAMILY.period[lang],
      }),
    },
    {
      // HIGH in the catalogue: a filled tile.
      category: 'finance',
      elevated: true,
      time: '09:00',
      ...n('payment_reminder', {
        student_name: FAMILY.daughter[lang],
        due_date: FAMILY.reminder.due,
        amount_due: FAMILY.reminder.amount,
        invoice_number: FAMILY.reminder.invoice,
      }),
    },
    {
      category: 'attendance',
      elevated: true,
      time: '08:20',
      ...n('absence_marked', {
        student_name: FAMILY.daughter[lang],
        date: FAMILY.daughterAbsence,
        class_name: FAMILY.daughterClass[lang],
      }),
    },
  ];
};

/** Px: caught, Zahra raises her placard to her chin, and her hands with it. */
const LIFT = 150;

/** The busted camera: Zahra's two hands on the raised placard, her face just above. */
const SHOT: Shot = {
  focus: (rtl) => {
    const [[lx, y], [rx]] = handsAt('daughter', rtl, LIFT);
    return [(lx + rx) / 2, y];
  },
  hold: [505, 1330],
  zoom: 2.3,
};

/** Everyone looks at Sidi: after episode 1, who else? */
const Hook: React.FC = () => <HookScene glances={{ daughter: 'son', father: 'son' }} />;

/** 1. Sidi: a 16 in French, proudly. Nobody believes him, not after last time. */
const SonScene: React.FC = () => (
  <ClaimScene
    who="son"
    faces={(rtl, after) => ({
      son: { face: after ? { mouth: 'grin', brows: 0.8, blush: 0.3 } : { mouth: 'smile' }, tilt: after ? -4 : 0 },
      daughter: { face: { mouth: after ? 'smirk' : 'smile', brows: after ? -0.5 : 0, look: [lookAt('daughter', 'son', rtl), -0.1] } },
      father: { face: { mouth: after ? 'smirk' : 'smile', brows: after ? -0.4 : 0.2, look: [lookAt('father', 'son', rtl), 0.2] } },
    })}
  />
);

/** 2. Zahra: at school all day, calmly, eyes a little up and away. Her father is proud. */
const DaughterScene: React.FC = () => (
  <ClaimScene
    who="daughter"
    faces={(rtl, after) => ({
      son: { face: { mouth: after ? 'flat' : 'smile', brows: after ? -0.3 : 0.2, look: [lookAt('son', 'daughter', rtl), 0] } },
      daughter: { face: after ? { mouth: 'smile', brows: 0.8, look: [rtl ? -0.6 : 0.6, -0.5] } : { mouth: 'smile' }, tilt: after ? 5 : 0 },
      father: { face: { mouth: after ? 'grin' : 'smile', brows: 0.5, look: [lookAt('father', 'daughter', rtl), 0.3] } },
    })}
  />
);

/** 3. The father: the date, like a man who reads the school's messages. The children wince: fees. */
const FatherScene: React.FC = () => (
  <ClaimScene
    who="father"
    faces={(rtl, after) => ({
      son: { face: { mouth: after ? 'o' : 'smile', brows: after ? 0.9 : 0, look: [lookAt('son', 'father', rtl), -0.2] } },
      daughter: { face: { mouth: after ? 'flat' : 'smile', brows: after ? 0.4 : 0, look: [lookAt('daughter', 'father', rtl), -0.2] } },
      father: { face: after ? { mouth: 'smile', brows: 0.6, look: [0, 0.1] } : { mouth: 'smile' }, tilt: after ? 3 : 0 },
    })}
  />
);

/**
 * check: Sidi's 16 holds (for once he is cleared first, and he lets everyone
 * know), the father's deadline holds, Zahra's day at school does not. She
 * sweats a little more with each row.
 */
const Check: React.FC = () => (
  <CheckScene
    items={useFamilyInbox()}
    rows={['son', 'father', 'daughter']}
    react={({ rtl, stamped, caught }) =>
      caught
        ? { son: { face: { mouth: 'smirk', brows: 0.9, look: [lookAt('son', 'daughter', rtl), 0] } } }
        : stamped(0)
          ? { son: { face: { mouth: 'grin', brows: 1, blush: 0.4, look: [0, -0.3] }, tilt: rtl ? 6 : -6 } }
          : {}
    }
  />
);

/** busted: the camera goes down to her hands, and a marker circles the henna on each. */
const Busted: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeat();
  const raise = tween(frame, [b(0.8), b(2)], [0, 1], EASE_IN_OUT);
  return (
    <BustedScene
      culprit="daughter"
      shot={SHOT}
      culpritState={(reveal, rtl) => ({
        // Caught, she hides behind her placard up to the chin, and looks down at her own hands.
        face: { mouth: 'wobble', worry: 1, sweat: 0.8, blush: 0.8, brows: 0.5, look: [rtl ? 0.3 : -0.3, 0.3 + 0.7 * reveal] },
        tilt: rtl ? -4 : 4,
        lift: LIFT * raise,
      })}
      clue={(rtl) => {
        const [[lx, ly], [rx, ry]] = handsAt('daughter', rtl, LIFT);
        // Reading order: the hand on the reading side first.
        const [first, second] = rtl ? [[rx, ry], [lx, ly]] : [[lx, ly], [rx, ry]];
        return (
          <>
            <MarkerCircle cx={first[0]} cy={first[1]} rx={42} ry={46} at={b(4)} dur={10} />
            <MarkerCircle cx={second[0]} cy={second[1]} rx={42} ry={46} at={b(4.8)} dur={10} />
          </>
        );
      }}
      strokes={[4, 4.8]}
    />
  );
};

/**
 * outro: the camera pulls back. Zahra, red, then laughing; Sidi triumphant,
 * finally not him; the father shakes his head, smiling.
 */
const Outro: React.FC = () => (
  <OutroScene
    shot={SHOT}
    states={({ frame, b, rtl, laugh }) => ({
      son: {
        face: { mouth: 'grin', brows: 1, look: [lookAt('son', 'daughter', rtl), 0] },
        tilt: rtl ? 6 : -6,
        verdict: LANDED.true,
        hop: frame > b(0.6) ? laugh * 0.9 : 0,
      },
      daughter: {
        face:
          frame > b(1.5)
            ? { mouth: 'grin', worry: 0.4, blush: 0.8, brows: 0.4 }
            : { mouth: 'wobble', worry: 1, blush: 0.8, sweat: 0.6, look: [0, 0.8] },
        verdict: LANDED.false,
        // The placard comes back down as the camera pulls back.
        lift: LIFT * (1 - tween(frame, [b(0.2), b(1.6)], [0, 1], EASE_IN_OUT)),
        hop: frame > b(1.5) ? laugh * 0.6 : 0,
      },
      father: {
        face: { mouth: frame > b(1) ? 'grin' : 'smile', brows: 0.3, look: [lookAt('father', 'daughter', rtl), 0.2] },
        // A slow shake of the head: no, no, no… and a smile.
        tilt: Math.sin(frame * 0.45) * 7 * Math.min(1, frame / 12),
        verdict: LANDED.true,
      },
    })}
  />
);

export const VERITE_02 = makeEpisode({
  episode: { copy: COPY, carry: { daughter: { hands: 'henna' } } },
  scenes: {
    hook: Hook,
    son: SonScene,
    daughter: DaughterScene,
    father: FatherScene,
    vote: VoteScene,
    check: Check,
    busted: Busted,
    outro: Outro,
  },
  timelineFor,
  music: 'verite-02/music.wav',
  coverFrame: 50,
});
