import React, { useState } from 'react';
import { View, Text, Platform } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme';

const FONT = Platform.OS === 'web' ? '-apple-system, system-ui, Segoe UI, Roboto, sans-serif' : undefined;

/**
 * Courbe simple en SVG.
 * points : [{ x: label, y: nombre }]   (x est seulement affiché)
 * avg : courbe secondaire facultative (moyenne glissante), même longueur
 */
export default function LineChart({ points, avg, height = 170, color = colors.accent, unit = '', decimals = 1 }) {
  const [w, setW] = useState(0);
  if (points.length === 0) return null;
  const pad = { l: 36, r: 10, t: 12, b: 22 };
  const ys = [...points.map((p) => p.y), ...(avg || []).filter((v) => v != null)];
  let min = Math.min(...ys), max = Math.max(...ys);
  if (max - min < 1) { min -= 1; max += 1; }
  const span = max - min;
  min -= span * 0.1; max += span * 0.1;
  const iw = Math.max(1, w - pad.l - pad.r), ih = height - pad.t - pad.b;
  const X = (i) => pad.l + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const Y = (v) => pad.t + (1 - (v - min) / (max - min)) * ih;
  const path = (vals) => vals.map((v, i) => (v == null ? null : `${X(i).toFixed(1)},${Y(v).toFixed(1)}`)).filter(Boolean).map((p, i) => (i ? 'L' : 'M') + p).join(' ');
  const fmt = (v) => String(Math.round(v * 10 ** decimals) / 10 ** decimals).replace('.', ',');
  const ticks = [min + (max - min) * 0.15, (min + max) / 2, max - (max - min) * 0.15];
  const labelIdx = points.length <= 1 ? [0] : [0, Math.floor((points.length - 1) / 2), points.length - 1];

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height }}>
      {w > 0 && (
        <Svg width={w} height={height}>
          {ticks.map((t, i) => (
            <React.Fragment key={i}>
              <Line x1={pad.l} x2={w - pad.r} y1={Y(t)} y2={Y(t)} stroke={colors.border} strokeWidth={1} strokeDasharray="3 4" />
              <SvgText x={pad.l - 6} y={Y(t) + 4} fill={colors.sub} fontSize={10} fontFamily={FONT} textAnchor="end">{fmt(t)}</SvgText>
            </React.Fragment>
          ))}
          {avg ? <Path d={path(avg)} stroke={colors.sub} strokeWidth={2} fill="none" strokeDasharray="5 4" /> : null}
          <Path d={path(points.map((p) => p.y))} stroke={color} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
          {points.map((p, i) => (
            <Circle key={i} cx={X(i)} cy={Y(p.y)} r={points.length > 40 ? 0 : 3.5} fill={color} />
          ))}
          {[...new Set(labelIdx)].map((i) => (
            <SvgText key={i} x={X(i)} y={height - 6} fill={colors.sub} fontSize={10} fontFamily={FONT} textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}>
              {points[i].x}
            </SvgText>
          ))}
        </Svg>
      )}
      {unit ? <Text style={{ position: 'absolute', right: 10, top: 0, color: colors.sub, fontSize: 11 }}>{unit}</Text> : null}
    </View>
  );
}
