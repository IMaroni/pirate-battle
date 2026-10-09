import type { PointerEvent } from 'react';
import './TouchControls.css';

interface TouchControlsProps {
  disabled: boolean;
  onPress: (key: string, pointerId: number) => void;
  onRelease: (pointerId: number) => void;
}

const controls = [
  { key: 'KeyW', label: 'Forward', text: '↑' },
  { key: 'KeyS', label: 'Reverse', text: '↓' },
  { key: 'KeyA', label: 'Turn left', text: '←' },
  { key: 'KeyD', label: 'Turn right', text: '→' },
  { key: 'Space', label: 'Front fire', text: 'Front' },
  { key: 'KeyQ', label: 'Left fire', text: 'Left' },
  { key: 'KeyE', label: 'Right fire', text: 'Right' }
];

export function TouchControls({
  disabled,
  onPress,
  onRelease
}: TouchControlsProps) {
  function handlePointerDown(
    event: PointerEvent<HTMLButtonElement>,
    key: string
  ): void {
    if (disabled || event.button !== 0) {
      return;
    }

    event.preventDefault();
    // Continua recebendo, mesmo fora do botão.
    event.currentTarget.setPointerCapture(event.pointerId);
    onPress(key, event.pointerId);
  }

  return (
    <div className="touch-controls" aria-label="Game controls">
      {controls.map((control, index) => (
        <button
          key={control.key}
          className={index < 4 ? 'movement-control' : 'attack-control'}
          type="button"
          disabled={disabled}
          aria-label={control.label}
          onPointerDown={(event) => {
            handlePointerDown(event, control.key);
          }}
          onPointerUp={(event) => {
            onRelease(event.pointerId);
          }}
          onPointerCancel={(event) => {
            onRelease(event.pointerId);
          }}
          onLostPointerCapture={(event) => {
            onRelease(event.pointerId);
          }}
          onKeyDown={(event) => {
            if (event.code === 'Space' || event.code === 'Enter') {
              event.preventDefault();
              // Identificador separado para ativação.
              onPress(control.key, -(index + 1));
            }
          }}
          onKeyUp={(event) => {
            if (event.code === 'Space' || event.code === 'Enter') {
              onRelease(-(index + 1));
            }
          }}
          onBlur={() => {
            onRelease(-(index + 1));
          }}
        >
          {control.text}
        </button>
      ))}
    </div>
  );
}