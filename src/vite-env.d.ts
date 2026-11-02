/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_JENNY_API_KEY?: string;
  readonly VITE_JENNY_PROJECT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'react-dom/client' {
  import { ReactNode } from 'react';
  export interface Root {
    render(children: ReactNode): void;
    unmount(): void;
  }
  export function createRoot(container: Element | DocumentFragment): Root;
  const ReactDOM: {
    createRoot: typeof createRoot;
  };
  export default ReactDOM;
}

