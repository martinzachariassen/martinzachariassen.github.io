import { useCallback, useEffect } from "react";
import type { Dispatch } from "react";
import { useKonami } from "../../easter/useKonami.js";
import type { CommandEffect } from "../../terminal/commands.js";
import type { Action, TerminalState } from "./terminalReducer.js";

interface UseEasterEggsOptions {
  state: TerminalState;
  dispatch: Dispatch<Action>;
  reducedMotion: boolean;
}

export function useEasterEggs({ state, dispatch, reducedMotion }: UseEasterEggsOptions) {
  const setBodyClass = useCallback((cls: string, on: boolean) => {
    document.body.classList.toggle(cls, on);
  }, []);

  const startGlitch = useCallback((ms = 1200) => {
    if (!state.easterEnabled || reducedMotion) return;
    dispatch({ type: "setGlitch", on: true });
    window.setTimeout(() => dispatch({ type: "setGlitch", on: false }), ms);
  }, [dispatch, reducedMotion, state.easterEnabled]);

  useKonami({
    enabled: state.easterEnabled,
    onToggle: (next) => {
      setBodyClass("konami", next);
      dispatch({
        type: "append",
        lines: [{ text: next ? "Konami mode: ON" : "Konami mode: OFF", tone: "ok" }],
      });
    },
  });

  // Disable all easter effects when easter eggs are turned off
  useEffect(() => {
    if (!state.easterEnabled) {
      setBodyClass("konami", false);
      setBodyClass("matrix", false);
      dispatch({ type: "setMatrixRunning", running: false });
      dispatch({ type: "setGlitch", on: false });
    }
  }, [dispatch, setBodyClass, state.easterEnabled]);

  // Sync matrix body class
  useEffect(() => {
    setBodyClass("matrix", state.matrixRunning);
  }, [setBodyClass, state.matrixRunning]);

  const applyEffects = useCallback((effects: CommandEffect[]) => {
    for (const eff of effects) {
      if (eff.type === "EASTER") {
        dispatch({ type: "setEasterEnabled", enabled: eff.enabled });
        continue;
      }

      if (eff.type === "MATRIX") {
        if (!state.easterEnabled) continue;

        if (reducedMotion) {
          dispatch({ type: "append", lines: [
            { text: "(matrix) Reduced motion is on; printing vibes instead of animation.", tone: "info" },
            { text: "01001101 01100001 01110100 01110010 01101001 01111000", tone: "ok" },
            { text: "Wake up, Neo.", tone: "ok" },
          ]});
          continue;
        }

        if (eff.mode === "off") dispatch({ type: "setMatrixRunning", running: false });
        else if (eff.mode === "on") dispatch({ type: "setMatrixRunning", running: true });
        else dispatch({ type: "setMatrixRunning", running: !state.matrixRunning });
      }
    }
  }, [dispatch, reducedMotion, state.easterEnabled, state.matrixRunning]);

  return { startGlitch, applyEffects };
}

