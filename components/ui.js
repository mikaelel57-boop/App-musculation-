import React from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { s, colors } from '../theme';

export const Card = ({ style, children, onPress }) =>
  onPress ? (
    <Pressable onPress={onPress} style={({ pressed }) => [s.card, style, pressed && { opacity: 0.75 }]}>{children}</Pressable>
  ) : (
    <View style={[s.card, style]}>{children}</View>
  );

export function Button({ title, onPress, icon, variant = 'primary', style, disabled, small }) {
  const v = {
    primary: { bg: colors.accent, fg: '#08130C', border: colors.accent },
    secondary: { bg: colors.card2, fg: colors.text, border: colors.border },
    danger: { bg: 'transparent', fg: colors.danger, border: colors.danger },
    ghost: { bg: 'transparent', fg: colors.accent, border: 'transparent' },
  }[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: v.bg, borderWidth: 1, borderColor: v.border, flexDirection: 'row', gap: 8 },
        small && { paddingVertical: 8, paddingHorizontal: 12 },
        (pressed || disabled) && { opacity: disabled ? 0.4 : 0.75 },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={small ? 16 : 18} color={v.fg} /> : null}
      <Text style={[s.btnText, { color: v.fg }, small && { fontSize: 14 }]}>{title}</Text>
    </Pressable>
  );
}

export const Chip = ({ label, active, onPress, icon }) => (
  <Pressable
    onPress={onPress}
    style={[styles.chip, active && { borderColor: colors.accent, backgroundColor: colors.accentDim }]}
  >
    {icon ? <Ionicons name={icon} size={14} color={active ? colors.accent : colors.sub} /> : null}
    <Text style={{ color: active ? colors.accent : colors.text, fontSize: 14, fontWeight: active ? '700' : '500' }}>{label}</Text>
  </Pressable>
);

export const SectionTitle = ({ title, action, onAction }) => (
  <View style={[s.row, { marginTop: 8, marginBottom: 10 }]}>
    <Text style={[s.h1, { fontSize: 18 }]}>{title}</Text>
    {action ? (
      <Pressable onPress={onAction} hitSlop={10}>
        <Text style={{ color: colors.accent, fontWeight: '600' }}>{action}</Text>
      </Pressable>
    ) : null}
  </View>
);

export const Empty = ({ icon = 'leaf-outline', title, sub }) => (
  <View style={{ alignItems: 'center', paddingVertical: 28, gap: 6 }}>
    <Ionicons name={icon} size={34} color={colors.sub} />
    <Text style={[s.text, { fontWeight: '600', textAlign: 'center' }]}>{title}</Text>
    {sub ? <Text style={[s.sub, { textAlign: 'center' }]}>{sub}</Text> : null}
  </View>
);

export function Bar({ value, max, color = colors.accent, height = 8 }) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <View style={{ height, borderRadius: height, backgroundColor: colors.card2, overflow: 'hidden' }}>
      <View style={{ width: `${pct * 100}%`, height, borderRadius: height, backgroundColor: value > max * 1.08 ? colors.orange : color }} />
    </View>
  );
}

// Anneau de progression
export function Ring({ value, max, size = 120, stroke = 12, color = colors.accent, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.card2} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r} stroke={value > max * 1.08 ? colors.orange : color} strokeWidth={stroke} fill="none"
          strokeDasharray={`${c} ${c}`} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

export const Field = ({ label, suffix, style, ...props }) => (
  <View style={[{ marginBottom: 12 }, style]}>
    {label ? <Text style={[s.sub, { marginBottom: 6 }]}>{label}</Text> : null}
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <TextInput style={[s.input, { flex: 1 }]} placeholderTextColor={colors.sub} {...props} />
      {suffix ? <Text style={[s.sub, { marginTop: 0 }]}>{suffix}</Text> : null}
    </View>
  </View>
);

export function Stepper({ value, onChange, step = 1, min = 0, format = (v) => v, width = 64 }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Pressable style={styles.stepBtn} onPress={() => onChange(Math.max(min, +(value - step).toFixed(2)))} hitSlop={6}>
        <Ionicons name="remove" size={18} color={colors.text} />
      </Pressable>
      <Text style={[s.text, { minWidth: width, textAlign: 'center', fontWeight: '700' }]}>{format(value)}</Text>
      <Pressable style={styles.stepBtn} onPress={() => onChange(+(value + step).toFixed(2))} hitSlop={6}>
        <Ionicons name="add" size={18} color={colors.text} />
      </Pressable>
    </View>
  );
}

export const ListRow = ({ icon, title, sub, onPress, right, color = colors.accent }) => (
  <Pressable onPress={onPress} style={({ pressed }) => [s.card, s.row, { paddingVertical: 12 }, pressed && { opacity: 0.75 }]}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
      {icon ? (
        <View style={[styles.iconBox, { backgroundColor: color + '22' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={s.text}>{title}</Text>
        {sub ? <Text style={s.sub}>{sub}</Text> : null}
      </View>
    </View>
    {right !== undefined ? right : <Ionicons name="chevron-forward" size={18} color={colors.sub} />}
  </Pressable>
);

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, marginRight: 8,
  },
  stepBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.card2, alignItems: 'center', justifyContent: 'center' },
  iconBox: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
});
