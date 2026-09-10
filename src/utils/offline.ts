/** Helpers offline / PWA */

export function isOnline() {
  return typeof navigator === 'undefined' ? true : navigator.onLine
}

export async function registerSW() {
  if (!('serviceWorker' in navigator)) return
  try {
    const { registerSW } = await import('virtual:pwa-register')
    registerSW({
      immediate: true,
      onOfflineReady() {
        console.info('[Baldor] Listo para usar sin conexion')
      },
    })
  } catch {
    /* en dev sin plugin o tipado */
  }
}
