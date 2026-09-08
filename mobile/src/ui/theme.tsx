// Visual language: white pages, soft grey rows, one green, a dark floating bottom bar. Matches docs/app_assets screenshot 5.
import React from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Leaf } from 'lucide-react-native';

// Palette follows the website hero: warm off-white ground, ink #242424, deep green accent, near-black primary.
export const C = {
  bg: '#FDFCFC', white: '#FFFFFF', surface: '#F3F4EF', ink: '#242424', muted: '#676763', green: '#2F7D5A', deep: '#1B211D',
  mint: '#E4F0E8', line: '#E2E4DE', amber: '#95612D', paleAmber: '#FCF1DE', red: '#B4432F', bar: '#1B211D',
};
/** Georgia on the web and iOS, the system serif (Noto Serif) on Android, matching the hero's display type. */
export const DISPLAY_FONT = Platform.select({ web: 'Georgia, "Times New Roman", serif', ios: 'Georgia', default: 'serif' }) as string;

/** The two-line brand from the website: Devanagari above the Latin wordmark, green full stop. */
export function Wordmark({ size = 18 }: { size?: number }) {
  return (
    <View style={{ gap: 0 }}>
      <Text style={{ fontSize: size + 1, fontWeight: '600', letterSpacing: -0.5, color: '#202520', lineHeight: size + 4, includeFontPadding: false }}>निवारण</Text>
      <Text style={{ fontSize: size, fontWeight: '700', letterSpacing: -0.7, color: '#202520', lineHeight: size + 2 }}>nivaran<Text style={{ color: '#488260' }}>.</Text></Text>
    </View>
  );
}

export function Label({ children, color = C.muted }: { children: React.ReactNode; color?: string }) { return <Text style={{ fontSize: 11, letterSpacing: 1.6, fontWeight: '700', color }}>{children}</Text>; }
export function Body({ children, color = C.muted, style }: { children: React.ReactNode; color?: string; style?: any }) { return <Text style={[{ fontSize: 16, lineHeight: 25, color }, style]}>{children}</Text>; }
export function Button({ children, onPress, secondary = false, disabled = false, icon, testID }: { children: React.ReactNode; onPress: () => void; secondary?: boolean; disabled?: boolean; icon?: React.ReactNode; testID?: string }) {
  return <Pressable testID={testID} accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [s.button, secondary && { backgroundColor: C.surface }, { opacity: disabled ? .4 : pressed ? .75 : 1 }]}>{icon}<Text style={{ fontSize: 15, fontWeight: '700', color: secondary ? C.ink : C.white }}>{children}</Text></Pressable>;
}
export function Chip({ children, warning = false }: { children: React.ReactNode; warning?: boolean }) { return <View style={{ alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: warning ? C.paleAmber : C.mint }}><Text style={{ fontSize: 11, fontWeight: '600', color: warning ? C.amber : C.deep }}>{children}</Text></View>; }
export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) { return <View style={[s.card, style]}>{children}</View>; }
export function Avatar({ size = 44 }: { size?: number }) { return <View style={{ width: size, height: size, borderRadius: size, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' }}><Leaf size={size * .48} color={C.deep} strokeWidth={1.6} /></View>; }

/** Reference-style segmented control: a light track with a white active pill. */
export function Segmented({ options, labels, value, onChange }: { options: string[]; labels?: string[]; value: string; onChange(value: string): void }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: C.surface, borderRadius: 30, padding: 4, alignSelf: 'flex-start' }}>
      {options.map((option, index) => (
        <Pressable key={option} accessibilityRole="button" accessibilityState={{ selected: value === option }} onPress={() => onChange(option)} style={{ paddingVertical: 8, paddingHorizontal: 16, borderRadius: 30, backgroundColor: value === option ? C.white : 'transparent', shadowColor: '#000', shadowOpacity: value === option ? .08 : 0, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: value === option ? 1 : 0 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: value === option ? C.ink : C.muted }}>{labels?.[index] ?? option}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function Frame({ children, back, title, subtitle, right, footer, avatar = false, online = false, compact = false, brand = false }: { children: React.ReactNode; back?: () => void; title?: string; subtitle?: string; right?: React.ReactNode; footer?: React.ReactNode; avatar?: boolean; online?: boolean; compact?: boolean; brand?: boolean }) {
  return (
    <SafeAreaView style={s.outer} edges={['top', 'bottom']}>
      <View style={s.shell}>
        <View style={[s.header, compact && { minHeight: 56 }]}>
          {brand && <View style={{ flex: 1 }}><Wordmark /></View>}
          {back && <Pressable onPress={back} accessibilityRole="button" accessibilityLabel="Back" style={s.iconButton}><ArrowLeft size={22} color={C.ink} /></Pressable>}
          {avatar && (
            <View>
              <Avatar size={42} />
              {online && <View style={{ position: 'absolute', right: 0, bottom: 1, width: 12, height: 12, borderRadius: 6, backgroundColor: C.green, borderWidth: 2, borderColor: C.white }} />}
            </View>
          )}
          {!brand && (
            <View style={{ flex: 1, gap: 1 }}>
              <Text style={[s.brand, !!subtitle && { fontSize: 18 }, compact && { fontSize: 22 }]} numberOfLines={1}>{title || 'Nivaran'}</Text>
              {!!subtitle && <Text style={{ fontSize: 12, color: C.muted }}>{subtitle}</Text>}
            </View>
          )}
          {right}
        </View>
        {children}
        {footer}
      </View>
    </SafeAreaView>
  );
}
export function Loader({ text = 'Opening your drafts…' }: { text?: string }) { return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 18 }}><ActivityIndicator color={C.green} /><Body>{text}</Body></View>; }
export function ErrorBox({ text }: { text: string }) { if (!text) return null; return <View accessibilityRole="alert" style={{ backgroundColor: '#FAEAE2', borderRadius: 14, padding: 14, marginVertical: 8 }}><Text style={{ color: C.red, fontSize: 14, lineHeight: 21 }}>{text}</Text></View>; }
export function Orb({ small = false }: { small?: boolean }) { const size = small ? 96 : 154; return <View style={{ width: size, height: size, borderRadius: size, backgroundColor: '#EAF3EC', alignItems: 'center', justifyContent: 'center' }}><View style={{ width: size * .8, height: size * .8, borderRadius: size, backgroundColor: '#CFE8D6', alignItems: 'center', justifyContent: 'center' }}><View style={{ width: size * .57, height: size * .57, borderRadius: size, backgroundColor: '#A9D8B8', alignItems: 'center', justifyContent: 'center' }}><Leaf size={small ? 26 : 40} color={C.deep} strokeWidth={1.3} /></View></View></View>; }

export const s = StyleSheet.create({
  // Grey gutters only on the web; on the phone the safe-area band above the header stays white.
  outer: { flex: 1, backgroundColor: Platform.OS === 'web' ? '#EEF0EB' : C.bg }, shell: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center', backgroundColor: C.bg },
  header: { minHeight: 72, paddingHorizontal: 20, paddingTop: 6, flexDirection: 'row', alignItems: 'center', gap: 12 }, brand: { fontSize: 30, fontWeight: '700', letterSpacing: -.8, color: C.ink },
  iconButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface },
  circleButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface },
  page: { paddingHorizontal: 20, paddingBottom: 110, gap: 16 },
  title: { fontFamily: DISPLAY_FONT, fontSize: 34, lineHeight: 40, letterSpacing: -1.2, fontWeight: '400', color: C.ink }, subtitle: { fontFamily: DISPLAY_FONT, fontSize: 24, fontWeight: '400', letterSpacing: -.5, color: C.ink, lineHeight: 30 },
  card: { padding: 18, borderRadius: 22, backgroundColor: C.surface, gap: 12 },
  rowItem: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 20, backgroundColor: C.surface },
  button: { minHeight: 52, borderRadius: 26, backgroundColor: C.green, paddingVertical: 13, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 }, between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  input: { minHeight: 50, padding: 14, borderRadius: 26, backgroundColor: C.surface, color: C.ink, fontSize: 16, lineHeight: 22 },
  footer: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: C.bg, gap: 8 },
});
