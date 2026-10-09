export function createKeyboardInput(canvas: HTMLCanvasElement) {
  const pressedKeys = new Set<string>();

 const Keys = new Set<string>([
    'KeyW',
    'KeyA',
    'KeyD',
    'KeyQ',
    'KeyE',
    'KeyS',
    'ArrowUp',
    'ArrowLeft',
    'ArrowRight',
    'ArrowDown',
    'Space'
  ]);

  function handleKeyDown(event: KeyboardEvent): void {
    if (!Keys.has(event.code)) {
      return;
    }

    event.preventDefault();
    pressedKeys.add(event.code);
  }

  function handleKeyUp(event: KeyboardEvent): void {
    pressedKeys.delete(event.code);
  }

  function clearKeys(): void {
    pressedKeys.clear();
  }

  canvas.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  canvas.addEventListener('blur', clearKeys);
  window.addEventListener('blur', clearKeys);

  function destroy(): void {
    canvas.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    canvas.removeEventListener('blur', clearKeys);
    window.removeEventListener('blur', clearKeys);
    clearKeys();
  }

  return {
    pressedKeys,
    destroy
  };
}