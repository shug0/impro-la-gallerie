import { useEffect, useCallback } from "react";

export interface KeyboardShortcut {
  key?: string;
  code?: string;
  handler: () => void;
  preventDefault?: boolean;
}

/**
 * Hook pour gérer les raccourcis clavier de manière déclarative
 * @param shortcuts - Tableau de raccourcis clavier à enregistrer
 * @param deps - Dépendances pour recréer les handlers
 */
export const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[],
  deps: any[] = []
) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    shortcuts.forEach((shortcut) => {
      const keyMatch = shortcut.key ? e.key === shortcut.key : true;
      const codeMatch = shortcut.code ? e.code === shortcut.code : true;

      if (keyMatch && codeMatch) {
        if (shortcut.preventDefault) {
          e.preventDefault();
        }
        shortcut.handler();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};
