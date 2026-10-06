import React from 'react';
import { useCurrentFrame } from 'remotion';
import { fill, NOTIFS } from '../../shared/appCopy';
import { useBeat } from '../../shared/beat';
import { FAMILY } from '../../shared/demo';
import { SAFE } from '../../shared/fx';
import { useBi, useLang } from '../../shared/lang';
import { Sfx } from '../../shared/rig';
import { EASE_IN_OUT, tween } from '../../shared/tokens';
import { CHILD_AVERAGE_Y, ChildGradesScreen } from '../../shared/ui/childGrades';
import { InboxItem } from '../../shared/ui/inbox';
import { MarkerCircle, SpeechBubble } from '../../shared/ui/lineup';
import { makeEpisode } from '../../shared/verite/episode';
import { BustedScene, CheckScene, ClaimScene, HookScene, LANDED, OutroMoment, OutroScene, Shot, VoteScene } from '../../shared/verite/scenes';
import { headCenter, lookAt, ribbonAt, SuspectState, Who } from '../../shared/verite/stage';
import { COPY, TEASE } from './copy';
import { TEASE_BEATS, timelineFor } from './timeline';

/**
 * « Qui ne dit pas la vérité ? », episode 3, « Le bulletin ». The format
 * flips: Sidi's 12 of average is true, the father's payment is true, and
 * Zahra's sad « 11 » is FAUX: she has 17.5 and wanted to surprise her
 * parents. A gold BRAVO lands over the FAUX. The clues: an honour-roll
 * rosette peeking behind her placard from the first frame, and a smile that
 * flashes for four frames in the middle of her sad line.
 *
 * Two cuts: `tease` ends on the father's own average, long ago, stamped
 * INVÉRIFIABLE; the plain cut ends on the celebration.
 */

/**
 * Mum's inbox on the evening the report cards come out, newest first, so the
 * rows read in the order of the reveal: the father's payment at the desk this
 * afternoon, then the two report cards, published at noon a minute apart.
 * The check reads the payment here and the averages on the grades screen.
 */
const useFamilyInbox = (): InboxItem[] => {
  const { lang } = useLang();
  const n = (key: keyof typeof NOTIFS, params: Record<string, string>) => ({
    title: fill(NOTIFS[key].title[lang], params),
    message: fill(NOTIFS[key].message[lang], params),
  });
  const reportCard = (who: 'son' | 'daughter') =>
    n('report_card_available_parent', {
      student_name: FAMILY[who][lang],
      period: FAMILY.period[lang],
      overall_average: FAMILY.averages[who],
    });
  return [
    {
      category: 'finance',
      time: '17:40',
      ...n('payment_received', {
        student_name: FAMILY.daughter[lang],
        amount: FAMILY.termPayment.amount,
        receipt_number: FAMILY.termPayment.receipt,
      }),
    },
    // HIGH in the catalogue: a filled tile.
    { category: 'grades', elevated: true, time: '12:01', ...reportCard('son') },
    { category: 'grades', elevated: true, time: '12:00', ...reportCard('daughter') },
  ];
};

/**
 * The report-card rows clamp their message at two lines, before « Moyenne
 * générale : … »: the check opens the child's grades, where the notification
 * leads, and reads the term's average there.
 */
const grades = (who: 'son' | 'daughter') => ({
  screen: (emphasis: number) => <ChildGradesScreen name={FAMILY[who]} term={FAMILY.terms[who]} emphasis={emphasis} />,
  focusY: CHILD_AVERAGE_Y,
});

/**
 * The busted camera: the rosette, pulled up over her placard, held right of
 * centre and low, so her face is in the middle, under the words.
 */
const SHOT: Shot = {
  focus: (rtl) => ribbonAt('daughter', rtl, 1),
  hold: [640, 1400],
  zoom: 2.0,
};

/** Sidi and Zahra eye each other (after episode 2, who knows?); the father watches Sidi. */
const Hook: React.FC = () => <HookScene glances={{ son: 'daughter', daughter: 'son', father: 'son' }} />;

/** 1. Sidi: 12, with a shrug. Not bad, and he knows it. */
const SonScene: React.FC = () => (
  <ClaimScene
    who="son"
    faces={(rtl, after) => ({
      son: { face: after ? { mouth: 'smile', brows: 0.5 } : { mouth: 'smile' }, tilt: after ? (rtl ? 5 : -5) : 0 },
      daughter: { face: { mouth: 'flat', worry: 0.3, look: [lookAt('daughter', 'son', rtl), 0.3] } },
      father: { face: { mouth: 'smile', brows: after ? 0.4 : 0.2, look: [lookAt('father', 'son', rtl), 0.2] } },
    })}
  />
);

/** When, in Zahra's line, the smile gets away from her, and for how long. */
const SMILE = { beat: 1.4, frames: 4 };

/**
 * 2. Zahra: « 11 », eyes down, the saddest voice. Halfway through, for four
 * frames, the smile gets away from her. The others worry for her.
 */
const DaughterScene: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeat();
  const flash = frame >= b(SMILE.beat) && frame < b(SMILE.beat) + SMILE.frames;
  return (
    <ClaimScene
      who="daughter"
      faces={(rtl, after) => ({
        son: { face: { mouth: after ? 'o' : 'smile', brows: after ? 0.8 : 0, look: [lookAt('son', 'daughter', rtl), 0] } },
        daughter: flash
          ? // The slip: she stops talking and smiles, eyes still down.
            { face: { mouth: 'smile', brows: 0.3, look: [0, 0.7] }, talk: undefined }
          : { face: { mouth: 'flat', worry: 0.9, brows: 0.2, look: [0, 0.7] }, tilt: after ? 5 : 2 },
        father: { face: { mouth: 'flat', worry: after ? 0.7 : 0.2, brows: 0.3, look: [lookAt('father', 'daughter', rtl), 0.3] } },
      })}
    />
  );
};

/** 3. The father: paid this afternoon, like a man who has the receipt. */
const FatherScene: React.FC = () => (
  <ClaimScene
    who="father"
    faces={(rtl, after) => ({
      son: { face: { mouth: 'smile', brows: after ? 0.5 : 0, look: [lookAt('son', 'father', rtl), -0.2] } },
      daughter: { face: { mouth: 'flat', worry: 0.6, look: [lookAt('daughter', 'father', rtl), 0.2] } },
      father: { face: after ? { mouth: 'smile', brows: 0.6, look: [0, 0.1] } : { mouth: 'smile' }, tilt: after ? 3 : 0 },
    })}
  />
);

/** The beat of the check scene where BRAVO lands over the FAUX. */
const BRAVO_BEAT = 11.6;

/**
 * check: the father's payment holds, Sidi's 12 holds, Zahra's 11 does not.
 * She keeps her sad face through it all, no sweat: she is acting. FAUX lands
 * and everyone gasps; a beat later BRAVO lands over it, confetti, she beams
 * and the father throws his arms up.
 */
const Check: React.FC = () => {
  const frame = useCurrentFrame();
  const b = useBeat();
  return (
    <CheckScene
      items={useFamilyInbox()}
      rows={['father', 'son', 'daughter']}
      twist={{ kind: 'bravo', beat: BRAVO_BEAT }}
      details={{ 1: grades('son'), 2: grades('daughter') }}
      react={({ rtl, caught, twisted }) => {
        if (twisted) {
          const cheer = tween(frame, [b(BRAVO_BEAT) + 2, b(BRAVO_BEAT) + 9], [0, 1], EASE_IN_OUT);
          return {
            daughter: { face: { mouth: 'grin', brows: 0.6, blush: 0.7 }, hop: Math.max(0, Math.sin((frame - b(BRAVO_BEAT)) * 0.5)) * 0.4 },
            father: { face: { mouth: 'grin', brows: 1, look: [lookAt('father', 'daughter', rtl), 0] }, arms: { pose: 'up', amount: cheer } },
            son: { face: { mouth: 'o', brows: 1, look: [lookAt('son', 'daughter', rtl), 0] } },
          };
        }
        if (caught) return { daughter: { face: { mouth: 'flat', blush: 0.6, brows: 0.3, look: [0, 0.8] } } };
        return { daughter: { face: { mouth: 'flat', worry: 0.8, look: [0, 0.6] } } };
      }}
    />
  );
};

/** On her placard from the check on: FAUX, and BRAVO over it. */
const BRAVO = { kind: 'bravo' as const, at: -100 };

/**
 * busted: who it was, in gold. The camera goes to the rosette as she pulls it
 * up from behind her placard, proud, and the marker circles it.
 */
const Busted: React.FC = () => {
  const b = useBeat();
  return (
    <BustedScene
      culprit="daughter"
      shot={SHOT}
      accent="#ffd166"
      sting="pop"
      culpritState={(reveal) => ({
        face: { mouth: 'grin', brows: 0.5 + 0.3 * reveal, blush: 0.7, look: [0, 0.3 + 0.5 * reveal] },
        over: BRAVO,
        ribbon: reveal,
      })}
      react={({ rtl, frame }) => ({
        // Still cheering from the check, the arms come down as the camera leaves him.
        father: {
          face: { mouth: 'grin', brows: 0.8, look: [lookAt('father', 'daughter', rtl), 0.2] },
          arms: { pose: 'up', amount: 1 - tween(frame, [b(1.2), b(2)], [0, 1], EASE_IN_OUT) },
          dim: 0.2,
        },
        son: { face: { mouth: 'grin', brows: 0.8, look: [lookAt('son', 'daughter', rtl), 0] }, dim: 0.2 },
      })}
      clue={(rtl) => {
        const [x, y] = ribbonAt('daughter', rtl, 1);
        return <MarkerCircle cx={x} cy={y} rx={48} ry={50} at={b(4)} dur={12} />;
      }}
    />
  );
};

/** Sidi: hands together, and a quick look into the camera: « and me? » */
const sidiCelebrates = ({ frame, b, rtl, laugh }: OutroMoment, lookFrom: number, lookTo: number): SuspectState => {
  const asking = frame >= b(lookFrom) && frame < b(lookTo);
  return {
    face: asking
      ? { mouth: 'flat', brows: 0.9, worry: 0.4, look: [0, 0] }
      : { mouth: 'grin', brows: 0.7, look: [lookAt('son', 'daughter', rtl), 0] },
    tilt: asking ? (rtl ? -8 : 8) : 0,
    verdict: LANDED.true,
    // Asking, the hands stay apart: open palms.
    arms: { pose: 'clap', amount: tween(frame, [b(0.2), b(0.6)]), clap: asking ? 0 : Math.abs(Math.sin(frame * 0.42)) },
    hop: asking ? 0 : laugh * 0.5,
  };
};

/** The plain ending: the camera pulls back on a family celebrating. */
const Outro: React.FC = () => (
  <OutroScene
    shot={SHOT}
    states={(m) => ({
      son: sidiCelebrates(m, 1.4, 2.6),
      daughter: { face: { mouth: 'grin', brows: 0.5, blush: 0.6 }, verdict: LANDED.false, over: BRAVO, ribbon: 1, hop: m.laugh * 0.6 },
      father: {
        face: { mouth: 'grin', brows: 1, look: [lookAt('father', 'daughter', m.rtl), 0.2] },
        verdict: LANDED.true,
        arms: { pose: 'up', amount: tween(m.frame, [m.b(0.3), m.b(0.8)], [0, 1], EASE_IN_OUT) },
      },
    })}
  />
);

/** The tease: when the father speaks, and when his stamp lands (outro beats). */
const LINE = { at: 2, out: 3.9, talk: [2.1, 3.3] as const, stamp: 3.5 };

/** The father's bubble over his head, clamped in the safe band like a claim's. */
const FatherLine: React.FC = () => {
  const b = useBeat();
  const bi = useBi();
  const { rtl } = useLang();
  const [hx] = headCenter('father', rtl);
  const width = 780;
  const x = Math.max(SAFE.side + width / 2 + 10, Math.min(1080 - SAFE.right - width / 2, hx));
  return (
    <>
      <SpeechBubble text={bi(TEASE.line)} at={b(LINE.at)} out={b(LINE.out)} tailX={hx} x={x} top={360} width={width} />
      <Sfx at={b(LINE.at)} name="pop" volume={0.5} />
      <Sfx at={b(LINE.stamp) - 1} name="stamp" volume={0.85} />
    </>
  );
};

/**
 * The tease ending: the celebration, then the father lowers his arms and
 * remembers his own average. INVÉRIFIABLE lands under his VRAI, the children
 * look at each other and everyone laughs, him too.
 */
const TeaseOutro: React.FC = () => (
  <OutroScene
    shot={SHOT}
    delay={TEASE_BEATS + 0.2}
    states={(m) => {
      const { frame, b, rtl, laugh } = m;
      const talking = frame >= b(LINE.at) && frame < b(LINE.out);
      const stamped = frame >= b(LINE.stamp);
      const laughing = frame >= b(LINE.stamp) + 8;
      const skeptical = (who: Who): SuspectState['face'] => ({ mouth: 'smirk', brows: -0.3, look: [lookAt(who, 'father', rtl), 0] });
      return {
        son: laughing
          ? { face: { mouth: 'grin', brows: 0.6, look: [lookAt('son', 'daughter', rtl), 0] }, verdict: LANDED.true, hop: laugh }
          : talking || stamped
            ? { face: skeptical('son'), verdict: LANDED.true }
            : sidiCelebrates(m, 1.1, 1.9),
        daughter: {
          face: laughing ? { mouth: 'grin', brows: 0.5, blush: 0.6 } : talking || stamped ? skeptical('daughter') : { mouth: 'grin', brows: 0.5, blush: 0.6 },
          verdict: LANDED.false,
          over: BRAVO,
          ribbon: 1,
          hop: laughing || !(talking || stamped) ? laugh * 0.6 : 0,
        },
        father: {
          face: laughing
            ? { mouth: 'grin', brows: 0.4, blush: 0.5, look: [0, 0.2] }
            : stamped
              ? { mouth: 'o', brows: 1, look: [0, 0.6] }
              : talking
                ? { mouth: 'smile', brows: 0.8, look: [rtl ? 0.5 : -0.5, -0.5] }
                : { mouth: 'grin', brows: 1, look: [lookAt('father', 'daughter', rtl), 0.2] },
          tilt: talking ? 4 : 0,
          talk: [b(LINE.talk[0]), b(LINE.talk[1])],
          verdict: LANDED.true,
          // Size and nudge keep the long word clear of Zahra's BRAVO and of the button column.
          over: { kind: 'unverifiable', at: b(LINE.stamp), size: 36, dy: 44, dx: rtl ? -10 : 25 },
          arms: { pose: 'up', amount: tween(frame, [b(0.3), b(0.8)], [0, 1], EASE_IN_OUT) * (1 - tween(frame, [b(1.6), b(2)], [0, 1], EASE_IN_OUT)) },
          hop: laughing ? laugh * 0.4 : 0,
        },
      };
    }}
  >
    <FatherLine />
  </OutroScene>
);

const make = (tease: boolean) =>
  makeEpisode({
    episode: { copy: tease ? { ...COPY, outro: { ...COPY.outro, tag: TEASE.tag } } : COPY, carry: { daughter: { ribbon: true } } },
    scenes: {
      hook: Hook,
      son: SonScene,
      daughter: DaughterScene,
      father: FatherScene,
      vote: VoteScene,
      check: Check,
      busted: Busted,
      outro: tease ? TeaseOutro : Outro,
    },
    timelineFor: timelineFor(tease),
    music: tease ? 'verite-03/music.wav' : 'verite-03/music-plain.wav',
    coverFrame: 50,
  });

/** With the father's last line: the cut to publish. */
export const VERITE_03 = make(true);
/** Without it, ending on the celebration. */
export const VERITE_03_PLAIN = make(false);
