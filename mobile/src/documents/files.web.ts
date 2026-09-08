import { Asset } from 'expo-asset';
import type { LocalDocument } from './types';
function read(file: File): Promise<LocalDocument> {
  if (file.size > 2 * 1024 * 1024) return Promise.reject(new Error('Choose a document smaller than 2 MB for this demo.'));
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(new Error('Could not read this file.')); reader.onload = () => { const path = String(reader.result); resolve({ name: file.name, mime: file.type, size: file.size, path, base64: path.split(',')[1] }); }; reader.readAsDataURL(file); });
}
export async function sampleDocument(name: 'relieving-letter' | 'claim-rejection'): Promise<LocalDocument> {
  const module = name === 'relieving-letter' ? require('../../assets/fixtures/relieving-letter.png') : require('../../assets/fixtures/claim-rejection.png');
  const asset = Asset.fromModule(module); const response = await fetch(asset.uri); if (!response.ok) throw new Error('Sample file could not be loaded.');
  return read(new File([await response.blob()], `${name}.png`, { type: 'image/png' }));
}
export function pickDocument(_source: 'files' | 'camera' | 'gallery' = 'files'): Promise<LocalDocument | null> {
  return new Promise((resolve, reject) => { const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/png,image/jpeg,application/pdf'; input.oncancel = () => resolve(null); input.onchange = () => { const file = input.files?.[0]; if (file) read(file).then(resolve, reject); else resolve(null); }; input.click(); });
}
