import { useEffect, useRef } from 'react';

interface InputDebugOptions {
  logEvents?: boolean;
  debugMode?: boolean;
  autoFocus?: boolean;
}

export function useInputDebug(options: InputDebugOptions = {}) {
  const { logEvents = false, debugMode = false, autoFocus = false } = options;
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    // Apply debug styles if enabled
    if (debugMode) {
      input.classList.add('input-debug');
      input.style.pointerEvents = 'auto';
      input.style.userSelect = 'auto';
      input.style.cursor = 'text';
      input.style.zIndex = '9999';
    }

    // Auto focus if enabled
    if (autoFocus) {
      input.focus();
    }

    if (logEvents) {
      const events = ['click', 'focus', 'blur', 'input', 'change', 'keydown', 'keyup'];
      
      const handlers = events.map(eventType => {
        const handler = (e: Event) => {
          console.log(`Input Event: ${eventType}`, {
            target: e.target,
            value: (e.target as HTMLInputElement).value,
            disabled: (e.target as HTMLInputElement).disabled,
            readonly: (e.target as HTMLInputElement).readOnly,
            pointerEvents: getComputedStyle(e.target as Element).pointerEvents,
            cursor: getComputedStyle(e.target as Element).cursor,
            userSelect: getComputedStyle(e.target as Element).userSelect,
          });
        };
        
        input.addEventListener(eventType, handler);
        return { eventType, handler };
      });

      // Check initial state
      console.log('Input Debug Info:', {
        element: input,
        disabled: input.disabled,
        readonly: input.readOnly,
        styles: {
          pointerEvents: getComputedStyle(input).pointerEvents,
          cursor: getComputedStyle(input).cursor,
          userSelect: getComputedStyle(input).userSelect,
          zIndex: getComputedStyle(input).zIndex,
          position: getComputedStyle(input).position,
        },
        boundingRect: input.getBoundingClientRect(),
      });

      return () => {
        handlers.forEach(({ eventType, handler }) => {
          input.removeEventListener(eventType, handler);
        });
      };
    }
  }, [logEvents, debugMode, autoFocus]);

  const forceEnable = () => {
    const input = inputRef.current;
    if (!input) return;

    // Force enable the input
    input.disabled = false;
    input.readOnly = false;
    input.style.pointerEvents = 'auto';
    input.style.userSelect = 'auto';
    input.style.cursor = 'text';
    input.style.zIndex = '9999';
    input.tabIndex = 0;
    
    // Try to focus
    input.focus();
    
    console.log('Input force enabled:', input);
  };

  const checkOverlays = () => {
    const input = inputRef.current;
    if (!input) return;

    const rect = input.getBoundingClientRect();
    const elementAtPoint = document.elementFromPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2
    );

    console.log('Element at input center:', {
      input: input,
      elementAtPoint: elementAtPoint,
      isInputAtPoint: elementAtPoint === input,
      inputRect: rect,
    });

    if (elementAtPoint !== input) {
      console.warn('Input is being covered by another element!', elementAtPoint);
    }
  };

  return {
    inputRef,
    forceEnable,
    checkOverlays,
  };
}

export default useInputDebug;
