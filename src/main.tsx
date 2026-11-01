// Defensive guard against browser wallet extensions trying to redefine frozen/non-configurable properties like window.ethereum.isZerion
if (typeof window !== 'undefined' && typeof Object.defineProperty === 'function') {
  const originalDefineProperty = Object.defineProperty;
  Object.defineProperty = function (obj: any, prop: PropertyKey, descriptor: PropertyDescriptor & ThisType<any>) {
    try {
      return originalDefineProperty.call(Object, obj, prop, descriptor);
    } catch (err: any) {
      if (err instanceof TypeError && typeof err.message === 'string' && err.message.includes('Cannot redefine property')) {
        // Return object safely without crashing the React application
        return obj;
      }
      throw err;
    }
  };
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { Providers } from './components/Providers.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
    </Providers>
  </StrictMode>,
);

