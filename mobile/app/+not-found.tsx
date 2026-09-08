import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Frame, Body, Button, s } from '../src/ui/theme';
export default function Missing() { const router = useRouter(); return <Frame title="Not found"><View style={s.page}><Body>This page could not be found. Your saved drafts are in Chats.</Body><Button onPress={() => router.replace('/')}>Back home</Button></View></Frame>; }
