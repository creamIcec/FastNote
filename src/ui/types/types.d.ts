import { MousetrapStatic } from "mousetrap";

declare module "mousetrap" {
  interface MousetrapInstance {
    paused: boolean;
    pause(): void;
    unpause(): void;
    stopCallback(
      e: ExtendedKeyboardEvent,
      element: Element,
      combo: string
    ): boolean;
  }

  interface MousetrapStatic {
    init(): void;
  }
}

declare global {
  interface Window {
    Mousetrap: MousetrapStatic & {
      prototype: MousetrapInstance;
    };
  }
  const Mousetrap: Window["Mousetrap"];
}
