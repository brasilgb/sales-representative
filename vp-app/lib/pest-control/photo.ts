import * as Crypto from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.7;

export type CapturedPhoto = {
  localUri: string;
  mimeType: string;
  contentHash: string;
};

export type PhotoCaptureResult = { status: 'captured'; photo: CapturedPhoto } | { status: 'denied' } | { status: 'canceled' };

/**
 * Tira uma foto pela câmera do aparelho, comprime (sem eliminar detalhes
 * necessários para comprovação — ver app-tecnico.md, seção EVIDÊNCIAS),
 * copia para um diretório persistente (a `cache` do picker pode ser limpa
 * pelo sistema antes do upload) e calcula o hash de integridade do arquivo
 * final já comprimido.
 */
export async function capturePhoto(): Promise<PhotoCaptureResult> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) return { status: 'denied' };

  const result = await ImagePicker.launchCameraAsync({ quality: 1, allowsEditing: false });
  if (result.canceled || !result.assets?.[0]) return { status: 'canceled' };

  const manipulated = await manipulateAsync(result.assets[0].uri, [{ resize: { width: MAX_DIMENSION } }], {
    compress: JPEG_QUALITY,
    format: SaveFormat.JPEG,
  });

  const persisted = await persistLocally(manipulated.uri);
  const contentHash = await hashFile(persisted);

  return { status: 'captured', photo: { localUri: persisted.uri, mimeType: 'image/jpeg', contentHash } };
}

async function persistLocally(sourceUri: string): Promise<File> {
  const dir = new Directory(Paths.document, 'pest-control-media');
  dir.create({ intermediates: true, idempotent: true });

  const dest = new File(dir, `${Crypto.randomUUID()}.jpg`);
  await new File(sourceUri).copy(dest);

  return dest;
}

async function hashFile(file: File): Promise<string> {
  const bytes = await file.bytes();
  const digest = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, bytes);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/** Remove o arquivo local depois de confirmado no servidor — não precisa continuar ocupando espaço no aparelho. */
export function deleteLocalPhoto(localUri: string): void {
  try {
    new File(localUri).delete();
  } catch {
    // Já pode ter sido removido antes; não é um erro que precise de tratamento.
  }
}
