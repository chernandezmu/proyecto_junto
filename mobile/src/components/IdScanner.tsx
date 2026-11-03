import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useRef, useState, type ComponentRef } from 'react';
import { ActivityIndicator, Linking, Modal, Pressable, View, type LayoutRectangle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Icon, IconButton, Text } from '@/components/ui';
import type { PickedFile } from '@/lib/media';
import { borderWidth, fills, radius } from '@/theme/tokens';
import { useTheme } from '@/theme/theme';

// Tarjeta tipo carné (ISO/IEC 7810 ID-1): 85,6 × 54 mm.
const CARD_RATIO = 85.6 / 54;
const FRAME_WIDTH = 0.88; // fracción del ancho de la vista de cámara
const MARGIN = 0.04; // margen extra del recorte para no cortar bordes del carné

type Props = {
  visible: boolean;
  onClose: () => void;
  onCapture: (file: PickedFile) => void;
  /** Alternativa para quien no tiene el carné físico (certificado en PDF o foto guardada). */
  onPickFile: () => void;
};

/**
 * Escáner del carné: cámara a pantalla completa con un marco del tamaño de un carné.
 * Al disparar, recorta la foto exactamente al marco y pide confirmar que se lee bien.
 */
export function IdScanner({ visible, onClose, onCapture, onPickFile }: Props) {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<ComponentRef<typeof CameraView>>(null);
  const [ready, setReady] = useState(false);
  const [torch, setTorch] = useState(false);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<LayoutRectangle | null>(null);
  const [shot, setShot] = useState<PickedFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const frame = view
    ? (() => {
        const w = view.width * FRAME_WIDTH;
        const h = w / CARD_RATIO;
        return { x: (view.width - w) / 2, y: (view.height - h) / 2, w, h };
      })()
    : null;

  function close() {
    setShot(null);
    setError(null);
    setTorch(false);
    onClose();
  }

  async function capture() {
    if (!camera.current || !frame || !view || busy) return;
    setBusy(true);
    setError(null);
    try {
      const pic = await camera.current.takePictureAsync({ quality: 0.9, exif: false });
      // La vista previa llena la pantalla recortando la foto ("cover"): pasamos el marco
      // de coordenadas de pantalla a coordenadas de la foto.
      const scale = Math.max(view.width / pic.width, view.height / pic.height);
      const offX = (pic.width * scale - view.width) / 2;
      const offY = (pic.height * scale - view.height) / 2;
      const mx = frame.w * MARGIN;
      const my = frame.h * MARGIN;
      const originX = Math.max(0, Math.round((frame.x - mx + offX) / scale));
      const originY = Math.max(0, Math.round((frame.y - my + offY) / scale));
      const width = Math.min(pic.width - originX, Math.round((frame.w + 2 * mx) / scale));
      const height = Math.min(pic.height - originY, Math.round((frame.h + 2 * my) / scale));

      const ctx = ImageManipulator.manipulate(pic.uri);
      ctx.crop({ originX, originY, width, height });
      if (width > 1600) ctx.resize({ width: 1600, height: null });
      const rendered = await ctx.renderAsync();
      const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
      setShot({ uri: saved.uri, mimeType: 'image/jpeg', name: 'carne.jpg' });
    } catch {
      setError('No pudimos tomar la foto. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  }

  const content = () => {
    if (!permission) return <ActivityIndicator color="#fff" style={{ flex: 1 }} />;

    if (!permission.granted) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 16, justifyContent: 'center' }}>
          <View style={{ alignSelf: 'center', width: 96, height: 96, borderRadius: 999, borderWidth, borderColor: colors.border, backgroundColor: fills.sky, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="photo_camera" size={48} color={fills.onFill} />
          </View>
          <Text variant="h1" center>
            Necesitamos tu cámara
          </Text>
          <Text tone="muted" center>
            La usamos solo para escanear tu carné. No guardamos nada más.
          </Text>
          {permission.canAskAgain ? (
            <Button label="Permitir cámara" icon="photo_camera" onPress={requestPermission} />
          ) : (
            <Button label="Abrir ajustes del teléfono" icon="settings" onPress={() => Linking.openSettings()} />
          )}
          <Button label="Subir un archivo en su lugar" variant="secondary" icon="upload_file" onPress={() => { close(); onPickFile(); }} />
          <Button label="Cancelar" variant="secondary" onPress={close} />
        </SafeAreaView>
      );
    }

    if (shot) {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 20, gap: 16 }}>
          <Text variant="h1">¿Se lee bien?</Text>
          <Text tone="muted">Revisa que se vean tu nombre, tu foto y la vigencia, sin reflejos.</Text>
          <Image
            source={{ uri: shot.uri }}
            style={{ width: '100%', aspectRatio: CARD_RATIO, borderRadius: radius.md, borderWidth, borderColor: colors.border }}
            contentFit="contain"
            accessibilityLabel="Foto de tu carné"
          />
          <View style={{ flex: 1 }} />
          <Button label="Usar esta foto" icon="check" variant="success" onPress={() => { onCapture(shot); close(); }} />
          <Button label="Repetir" icon="photo_camera" variant="secondary" onPress={() => setShot(null)} />
        </SafeAreaView>
      );
    }

    return (
      <View style={{ flex: 1, backgroundColor: '#000' }} onLayout={(e) => setView(e.nativeEvent.layout)}>
        <CameraView ref={camera} style={{ flex: 1 }} facing="back" enableTorch={torch} onCameraReady={() => setReady(true)} />

        {frame ? (
          <>
            {/* Fondo oscurecido alrededor del marco */}
            <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: frame.y, backgroundColor: 'rgba(10,8,16,0.65)' }} />
            <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: frame.y + frame.h, bottom: 0, backgroundColor: 'rgba(10,8,16,0.65)' }} />
            <View pointerEvents="none" style={{ position: 'absolute', left: 0, width: frame.x, top: frame.y, height: frame.h, backgroundColor: 'rgba(10,8,16,0.65)' }} />
            <View pointerEvents="none" style={{ position: 'absolute', right: 0, width: frame.x, top: frame.y, height: frame.h, backgroundColor: 'rgba(10,8,16,0.65)' }} />
            {/* Marco del carné */}
            <View
              pointerEvents="none"
              style={{ position: 'absolute', left: frame.x, top: frame.y, width: frame.w, height: frame.h, borderRadius: 14, borderWidth: 3, borderColor: fills.lime }}
            />
            <View pointerEvents="none" style={{ position: 'absolute', left: 20, right: 20, top: frame.y - 72, alignItems: 'center', gap: 4 }}>
              <Text variant="title" color="#fff" center>
                Ubica tu carné dentro del marco
              </Text>
              <Text variant="small" color="#e6e1f2" center>
                Con buena luz, de frente y sin reflejos
              </Text>
            </View>
          </>
        ) : null}

        <SafeAreaView edges={['top', 'bottom']} style={{ position: 'absolute', inset: 0, justifyContent: 'space-between' }} pointerEvents="box-none">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8 }}>
            <IconButton icon="close" label="Cerrar cámara" onPress={close} />
            <IconButton icon="light_mode" label={torch ? 'Apagar linterna' : 'Encender linterna'} onPress={() => setTorch((t) => !t)} bg={torch ? fills.lime : undefined} color={torch ? fills.onFill : undefined} />
          </View>
          <View style={{ alignItems: 'center', gap: 14, paddingBottom: 20 }}>
            {error ? (
              <Text variant="small" color="#ffb4b4" center>
                {error}
              </Text>
            ) : null}
            <Pressable
              onPress={capture}
              disabled={!ready || busy}
              accessibilityRole="button"
              accessibilityLabel="Tomar foto del carné"
              style={({ pressed }) => ({
                width: 76,
                height: 76,
                borderRadius: 999,
                borderWidth: 4,
                borderColor: '#fff',
                backgroundColor: pressed ? fills.lime : 'rgba(255,255,255,0.25)',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: !ready ? 0.5 : 1,
              })}
            >
              {busy ? <ActivityIndicator color="#fff" /> : null}
            </Pressable>
            <Pressable onPress={() => { close(); onPickFile(); }} accessibilityRole="button" hitSlop={8} style={{ minHeight: 44, justifyContent: 'center' }}>
              <Text variant="small" color="#fff" style={{ textDecorationLine: 'underline' }}>
                ¿Tienes certificado en PDF? Sube un archivo
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close} statusBarTranslucent presentationStyle="fullScreen">
      {content()}
    </Modal>
  );
}
