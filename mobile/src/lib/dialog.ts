import { Alert, Platform, Share } from 'react-native';

type DialogButton = { text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void };

/**
 * Igual que Alert.alert, pero también funciona en la web (allí Alert.alert no hace nada).
 * En la web usa los diálogos del navegador: confirm() si hay una acción y "Cancelar", y
 * si hay varias acciones pregunta por cada una hasta que la persona acepte una.
 */
export function showAlert(title: string, message?: string, buttons?: DialogButton[]) {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }
  const text = [title, message].filter(Boolean).join('\n\n');
  const actions = (buttons ?? []).filter((b) => b.style !== 'cancel');
  const cancellable = (buttons ?? []).some((b) => b.style === 'cancel');
  if (!cancellable) {
    window.alert(text);
    actions[0]?.onPress?.();
    return;
  }
  if (actions.length === 1) {
    if (window.confirm(`${text}\n\n→ ${actions[0].text}`)) actions[0].onPress?.();
    return;
  }
  for (const a of actions) {
    if (window.confirm(`${title}\n\n¿${a.text}?`)) {
      a.onPress?.();
      return;
    }
  }
}

/** Compartir un texto. En la web usa el menú de compartir del celular o copia el texto. */
export async function shareText(message: string, title?: string) {
  if (Platform.OS !== 'web') {
    await Share.share({ message, title });
    return;
  }
  const nav = window.navigator;
  if (nav.share) {
    try {
      await nav.share({ title, text: message, url: window.location.origin + window.location.pathname });
      return;
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
    }
  }
  try {
    await nav.clipboard.writeText(message);
    showAlert('Copiado', 'El texto quedó copiado. Pégalo donde quieras compartirlo.');
  } catch {
    showAlert('No se pudo compartir', 'Tu navegador no permite compartir ni copiar desde aquí.');
  }
}

/** Entrega un archivo de texto: en el teléfono lo comparte; en la web lo descarga. */
export async function saveTextFile(fileName: string, content: string, title: string) {
  if (Platform.OS !== 'web') {
    await Share.share({ title, message: content });
    return;
  }
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
