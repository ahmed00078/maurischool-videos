import { TransitionPresentation } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { flip } from '@remotion/transitions/flip';
import { iris } from '@remotion/transitions/iris';
import { pushCut } from '@remotion/transitions/push-cut';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import type { TransitionType } from './beat';
import type { Lang } from './lang';

/** "Forward" is right in French and left in Arabic, so movement follows reading. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const presentation = (type: TransitionType, lang: Lang, width: number, height: number): TransitionPresentation<any> => {
  const forward = lang === 'ar' ? 'from-left' : 'from-right';
  switch (type) {
    case 'pushCut':
      return pushCut({ flashColor: '#ffffff', flashOpacity: 0.55 });
    case 'slideUp':
      return slide({ direction: 'from-bottom' });
    case 'slideForward':
      return slide({ direction: forward });
    case 'flip':
      return flip({ direction: forward });
    case 'iris':
      return iris({ width, height });
    case 'wipe':
      return wipe({ direction: forward });
    case 'fade':
    case 'cut':
    default:
      return fade();
  }
};
