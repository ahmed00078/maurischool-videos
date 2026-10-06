import React from 'react';
import { fill, NOTIFS } from '../../shared/appCopy';
import { useBeat } from '../../shared/beat';
import { FAMILY } from '../../shared/demo';
import { useLang } from '../../shared/lang';
import { InboxItem } from '../../shared/ui/inbox';
import { MarkerCircle } from '../../shared/ui/lineup';
import { makeEpisode } from '../../shared/verite/episode';
import { BustedScene, CheckScene, ClaimScene, HookScene, LANDED, OutroScene, Shot, VoteScene } from '../../shared/verite/scenes';
import { lookAt, paperAt } from '../../shared/verite/stage';
import { COPY } from './copy';
import { timelineFor } from './timeline';

/**
 * « Qui ne dit pas la vérité ? », episode 1: a lineup of three (the son, the
 * daughter, the father), one claim each, a vote in the comments, then the
 * mother's notifications give the answer. It was Sidi: 7.5 became 17.5. The
 * clue: his marked test, in his shirt pocket from the first frame.
 */

/**
 * The parent's inbox tonight, newest first: Zahra's grade, the father's
 * payment, and at the bottom, from this morning, Sidi's maths test.
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
      time: '11:40',
      ...n('grade_published_parent', {
        student_name: FAMILY.daughter[lang],
        grade: FAMILY.daughterGrade.value,
        subject_name: FAMILY.daughterGrade.subject[lang],
        period: FAMILY.period[lang],
      }),
    },
    {
      category: 'finance',
      time: '10:12',
      ...n('payment_received', {
        student_name: FAMILY.son[lang],
        amount: FAMILY.payment.amount,
        receipt_number: FAMILY.payment.receipt,
      }),
    },
    {
      category: 'grades',
      time: '08:05',
      ...n('grade_published_parent', {
        student_name: FAMILY.son[lang],
        grade: FAMILY.sonGrade.value,
        subject_name: FAMILY.sonGrade.subject[lang],
        period: FAMILY.period[lang],
      }),
    },
  ];
};

/** The busted camera: Sidi's pocket, close. */
const SHOT: Shot = { focus: (rtl) => paperAt(rtl, 1), hold: [505, 1120], zoom: 1.9 };

/** 1. Sidi: a 17.5, said with a big smile. His family is proud: nothing gives him away. */
const SonScene: React.FC = () => (
  <ClaimScene
    who="son"
    faces={(rtl, after) => ({
      son: { face: after ? { mouth: 'grin', brows: 0.7, blush: 0.5 } : { mouth: 'smile' }, tilt: after ? -4 : 0 },
      daughter: { face: { mouth: 'smile', brows: 0.4, look: [lookAt('daughter', 'son', rtl), 0] } },
      father: { face: { mouth: after ? 'grin' : 'smile', brows: 0.6, look: [lookAt('father', 'son', rtl), 0.2] } },
    })}
  />
);

/** 2. The daughter: a 20 out of 20, said calmly. Her brother cannot believe it. */
const DaughterScene: React.FC = () => (
  <ClaimScene
    who="daughter"
    faces={(rtl, after) => ({
      son: { face: { mouth: after ? 'o' : 'flat', brows: 0.9, look: [lookAt('son', 'daughter', rtl), 0] } },
      daughter: { face: after ? { mouth: 'smile', brows: 0.8, look: [0, -0.3] } : { mouth: 'smile' }, tilt: after ? 5 : 0 },
      father: { face: { mouth: 'smile', look: [lookAt('father', 'daughter', rtl), 0.3] } },
    })}
  />
);

/** 3. The father: the line every family knows. His children are not so sure. */
const FatherScene: React.FC = () => (
  <ClaimScene
    who="father"
    faces={(rtl, after) => ({
      son: { face: { mouth: after ? 'smirk' : 'smile', brows: after ? -0.4 : 0, look: [lookAt('son', 'father', rtl), -0.2] } },
      daughter: { face: { mouth: after ? 'smirk' : 'smile', brows: after ? -0.5 : 0, look: [lookAt('daughter', 'father', rtl), -0.2] } },
      father: { face: after ? { mouth: 'smile', brows: 0.3, look: [0, 0.1] } : { mouth: 'smile' } },
    })}
  />
);

/** check: Zahra's 20 holds, the father's payment holds, Sidi's 7.5 does not. */
const Check: React.FC = () => <CheckScene items={useFamilyInbox()} rows={['daughter', 'father', 'son']} />;

/** busted: his test rises out of the pocket, and a marker circles the red 7.5. */
const Busted: React.FC = () => {
  const b = useBeat();
  return (
    <BustedScene
      culprit="son"
      shot={SHOT}
      culpritState={(rise, rtl) => ({
        face: { mouth: 'wobble', worry: 1, sweat: 1, blush: 0.7, brows: 0.5, look: [rtl ? -1 : 1, 0.5] },
        paper: rise,
        tilt: rtl ? 3 : -3,
      })}
      clue={(rtl) => {
        const [px, py] = paperAt(rtl, 1);
        return <MarkerCircle cx={px} cy={py} rx={46} ry={36} at={b(4)} dur={12} />;
      }}
    />
  );
};

/** outro: the camera pulls back and the whole family laughs, Sidi too. */
const Outro: React.FC = () => (
  <OutroScene
    shot={SHOT}
    states={({ frame, b, rtl, laugh }) => ({
      son: {
        face: frame > b(1.5) ? { mouth: 'grin', worry: 0.6, blush: 0.8, sweat: 0.4 } : { mouth: 'wobble', worry: 1, sweat: 1, blush: 0.7 },
        verdict: LANDED.false,
        paper: 1,
      },
      daughter: { face: { mouth: 'grin', brows: 0.5, look: [lookAt('daughter', 'son', rtl), 0] }, verdict: LANDED.true, hop: frame > b(1) ? laugh * 0.7 : 0 },
      father: { face: { mouth: 'grin', brows: 0.6, blush: 0.3, look: [lookAt('father', 'son', rtl), 0.2] }, verdict: LANDED.true, hop: frame > b(1) ? laugh * 0.5 : 0 },
    })}
  />
);

const Hook: React.FC = () => <HookScene glances={{ son: 'father', daughter: 'son' }} />;

export const VERITE_01 = makeEpisode({
  episode: { copy: COPY, carry: { son: { paper: COPY.busted.paper } } },
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
  music: 'verite-01/music.wav',
  coverFrame: 50,
});
