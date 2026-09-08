// The breathing orb on Home: the website hero's glossy sphere, with soft rings that pulse slowly and a small mic badge.
// Tapping it starts a voice chat.
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, Text, View } from 'react-native';
import { Mic } from 'lucide-react-native';
import { C } from './theme';

const ORB = require('../../assets/orb.png');

export function AnimatedOrb({ onPress, label = 'Tap to talk', accessibilityLabel = 'Talk about your issue', size = 168, disabled = false }: { onPress(): void; label?: string; accessibilityLabel?: string; size?: number; disabled?: boolean }) {
  const breath = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(breath, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      Animated.timing(breath, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [breath]);
  const outer = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] });
  const middle = breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const glow = breath.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.9] });
  const sphere = Math.round(size * 0.56);
  return (
    <View style={{ alignItems: 'center', gap: 14 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} disabled={disabled} onPress={onPress} style={({ pressed }) => ({ width: size, height: size, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.5 : pressed ? 0.85 : 1 })}>
        <Animated.View style={{ position: 'absolute', width: size, height: size, borderRadius: size, backgroundColor: '#DDEBF3', opacity: glow, transform: [{ scale: outer }] }} />
        <Animated.View style={{ position: 'absolute', width: size * 0.78, height: size * 0.78, borderRadius: size, backgroundColor: '#C6DEEA', opacity: 0.8, transform: [{ scale: middle }] }} />
        <View style={{ width: sphere, height: sphere, borderRadius: sphere, shadowColor: '#153846', shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8 }}>
          <Image source={ORB} style={{ width: sphere, height: sphere, borderRadius: sphere }} resizeMode="cover" accessibilityIgnoresInvertColors />
        </View>
        <View style={{ position: 'absolute', right: size * 0.16, bottom: size * 0.16, width: 34, height: 34, borderRadius: 17, backgroundColor: C.deep, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.bg }}>
          <Mic size={16} color="white" />
        </View>
      </Pressable>
      <Text style={{ fontSize: 13, fontWeight: '600', color: C.muted, letterSpacing: 0.3 }}>{label}</Text>
    </View>
  );
}
