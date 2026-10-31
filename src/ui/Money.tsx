import { useEffect, useRef, useState } from 'react';
import { Text, type TextStyle } from 'react-native';

import { formatINR } from '@/domain/money';
import { colors, type } from '@/theme/tokens';
import { useNumberFont } from '@/theme/useFont';

import { useReduceMotion } from './useReduceMotion';

type Props = { paise: number; size?: 'hero' | 'body'; sign?: boolean; color?: string; style?: TextStyle };

export function Money({ paise, size = 'body', sign, color = colors.text, style }: Props) {
  const font = useNumberFont();
  const reduceMotion = useReduceMotion();
  const [shown, setShown] = useState(paise);
  const from = useRef(paise);

  useEffect(() => {
    if (reduceMotion || from.current === paise) {
      from.current = paise;
      setShown(paise);
      return;
    }
    const start = from.current;
    const began = Date.now();
    let frame = 0;
    const tick = () => {
      const t = Math.min(1, (Date.now() - began) / 450);
      const eased = 1 - (1 - t) ** 3;
      setShown(Math.round(start + (paise - start) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
      else from.current = paise;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paise, reduceMotion]);

  return (
    <Text style={[size === 'hero' ? type.hero : type.body, { color, fontFamily: font }, style]}>
      {formatINR(shown, { sign })}
    </Text>
  );
}
