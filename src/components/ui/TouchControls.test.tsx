import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TouchControls } from './TouchControls';

describe('TouchControls', () => {
  it.each([
    ["Masquer l'interface", 'onHide'],
    ['Plein écran', 'onToggleFullscreen'],
    ['Suivante', 'onNext'],
    ['Fin', 'onEnd'],
  ] as const)('le bouton « %s » appelle %s', (name, handlerName) => {
    const handlers = {
      onHide: vi.fn(),
      onToggleFullscreen: vi.fn(),
      onNext: vi.fn(),
      onEnd: vi.fn(),
    };
    render(<TouchControls {...handlers} />);

    fireEvent.click(screen.getByRole('button', { name }));

    expect(handlers[handlerName]).toHaveBeenCalledTimes(1);
    for (const [otherName, otherHandler] of Object.entries(handlers)) {
      if (otherName !== handlerName) expect(otherHandler).not.toHaveBeenCalled();
    }
  });
});
