import { useEffect } from "react";

export interface KeyboardShortcut {
  key?: string;
  code?: string;
  handler: () => void;
  preventDefault?: boolean;
}

/**
 * Hook pour gérer les raccourcis clavier de manière déclarative
 * @param shortcuts - Tableau de raccourcis clavier à enregistrer. L'écouteur est réinscrit
 * à chaque nouvelle référence du tableau : le mémoriser avec `useMemo`.
 */
export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
};
