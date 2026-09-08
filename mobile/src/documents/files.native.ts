import { Asset } from 'expo-asset';
import * as FS from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import type { LocalDocument } from './types';
async function keep(uri: string, name: string, mime: string): Promise<LocalDocument> {
  const info = await FS.getInfoAsync(uri); if (!info.exists) throw new Error('The selected file is unavailable.');
  if (info.size > 2 * 1024 * 1024) throw new Error('Choose a document smaller than 2 MB for this demo.');
  const directory = `${FS.documentDirectory}evidence/`; await FS.makeDirectoryAsync(directory, { intermediates: true });
  const path = `${directory}${Date.now()}-${Math.random().toString(36).slice(2)}-${name.replace(/[^\w.\-]/g, '_')}`;
  await FS.copyAsync({ from: uri, to: path });
  const base64 = await FS.readAsStringAsync(path, { encoding: FS.EncodingType.Base64 });
  return { name, mime, size: info.size, path, base64 };
}
export async function sampleDocument(name: 'relieving-letter' | 'claim-rejection'): Promise<LocalDocument> {
  const module = name === 'relieving-letter' ? require('../../assets/fixtures/relieving-letter.png') : require('../../assets/fixtures/claim-rejection.png');
  const asset = await Asset.fromModule(module).downloadAsync(); return keep(asset.localUri || asset.uri, `${name}.png`, 'image/png');
}
export async function pickDocument(source: 'files' | 'camera' | 'gallery' = 'files'): Promise<LocalDocument | null> {
  if (source === 'files') { const result = await DocumentPicker.getDocumentAsync({ type: ['image/png', 'image/jpeg', 'application/pdf'], copyToCacheDirectory: true }); if (result.canceled) return null; const a = result.assets[0]; return keep(a.uri, a.name, a.mimeType || 'application/octet-stream'); }
  if (source === 'camera' && !(await ImagePicker.requestCameraPermissionsAsync()).granted) throw new Error('Camera access is off. You can choose a file instead.');
  const result = source === 'camera' ? await ImagePicker.launchCameraAsync({ quality: .7 }) : await ImagePicker.launchImageLibraryAsync({ quality: .7 });
  if (result.canceled) return null; const a = result.assets[0]; return keep(a.uri, a.fileName || 'sample-photo.jpg', a.mimeType || 'image/jpeg');
}
