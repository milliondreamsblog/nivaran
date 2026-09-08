// Dark floating bottom bar with Home, Chats and Profile. The active item becomes a white pill with its label.
import React, { useEffect, useState } from 'react';
import { Keyboard, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { House, MessageCircle, User } from 'lucide-react-native';
import { C } from './theme';

/** True while the soft keyboard is up, so the floating bar can get out of the way of the input. */
function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setOpen(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  return open;
}

export type BarTab = 'home' | 'chats' | 'profile';
const ITEMS: { key: BarTab; label: string; path: '/' | '/chats' | '/profile'; Icon: typeof House }[] = [
  { key: 'home', label: 'Home', path: '/', Icon: House },
  { key: 'chats', label: 'Chats', path: '/chats', Icon: MessageCircle },
  { key: 'profile', label: 'Profile', path: '/profile', Icon: User },
];

export function BottomBar({ active }: { active: BarTab }) {
  const router = useRouter();
  const keyboardOpen = useKeyboardOpen();
  if (keyboardOpen) return null;
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 14, alignItems: 'center', pointerEvents: 'box-none' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.bar, borderRadius: 40, padding: 6, shadowColor: '#000', shadowOpacity: .18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8 }}>
        {ITEMS.map(({ key, label, path, Icon }) => {
          const selected = key === active;
          return (
            <Pressable key={key} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected }} onPress={() => { if (!selected) router.replace(path); }} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, height: 52, paddingHorizontal: selected ? 20 : 18, borderRadius: 30, backgroundColor: selected ? C.white : 'transparent' }}>
              <Icon size={22} color={selected ? C.ink : '#C9CCC6'} strokeWidth={selected ? 2.2 : 1.8} />
              {selected && <Text style={{ fontSize: 15, fontWeight: '700', color: C.ink }}>{label}</Text>}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
