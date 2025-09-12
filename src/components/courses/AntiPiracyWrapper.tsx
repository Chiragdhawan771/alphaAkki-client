import React, { useEffect, useRef } from 'react';

interface AntiPiracyWrapperProps {
  children: React.ReactNode;
  userId?: string;
  courseId?: string;
}

const AntiPiracyWrapper: React.FC<AntiPiracyWrapperProps> = ({
  children,
  userId,
  courseId,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable text selection
    const disableSelection = (e: Event) => e.preventDefault();

    // Disable copy/paste
    const disableCopyPaste = (e: ClipboardEvent) => e.preventDefault();

    // Block dangerous keyboard shortcuts
    const blockShortcuts = (e: KeyboardEvent) => {
      const blocked = [
        { ctrl: true, shift: true, key: 'I' }, // Dev tools
        { ctrl: true, shift: true, key: 'J' },
        { ctrl: true, shift: true, key: 'C' },
        { ctrl: true, key: 'U' }, // View source
        { ctrl: true, key: 'S' }, // Save
        { ctrl: true, key: 'C' }, // Copy
        { ctrl: true, key: 'V' }, // Paste
        { ctrl: true, key: 'A' }, // Select all
        { key: 'PrintScreen' },
      ];

      for (const combo of blocked) {
        const ctrlMatch = combo.ctrl ? e.ctrlKey : !e.ctrlKey;
        const shiftMatch = combo.shift ? e.shiftKey : !e.shiftKey;
        const metaMatch = combo.meta ? e.metaKey : !e.metaKey;
        const keyMatch = combo.key === e.key;

        if (ctrlMatch && shiftMatch && metaMatch && keyMatch) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    // Blur content when window/tab loses focus
    const handleVisibility = () => {
      if (document.hidden && wrapperRef.current) {
        wrapperRef.current.style.filter = 'blur(6px)';
        setTimeout(() => {
          if (wrapperRef.current) wrapperRef.current.style.filter = 'none';
        }, 2000);
      }
    };

    // Add watermark overlay
    const addWatermark = () => {
      const wm = document.createElement('div');
      wm.id = 'anti-piracy-watermark';
      wm.textContent = `${userId ?? 'user'} - ${courseId ?? 'course'} - ${new Date().toISOString()}`;
      wm.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-30deg);
        font-size: 20px;
        color: rgba(255,255,255,0.12);
        pointer-events: none;
        z-index: 9999;
        user-select: none;
      `;
      document.body.appendChild(wm);
      return () => document.getElementById('anti-piracy-watermark')?.remove();
    };

    // Register listeners
    document.addEventListener('selectstart', disableSelection);
    document.addEventListener('copy', disableCopyPaste);
    document.addEventListener('paste', disableCopyPaste);
    document.addEventListener('keydown', blockShortcuts, true);
    document.addEventListener('visibilitychange', handleVisibility);

    const cleanupWatermark = addWatermark();

    // Cleanup
    return () => {
      document.removeEventListener('selectstart', disableSelection);
      document.removeEventListener('copy', disableCopyPaste);
      document.removeEventListener('paste', disableCopyPaste);
      document.removeEventListener('keydown', blockShortcuts, true);
      document.removeEventListener('visibilitychange', handleVisibility);
      cleanupWatermark();
    };
  }, [userId, courseId]);

  return (
    <div
      ref={wrapperRef}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      {children}
    </div>
  );
};

export default AntiPiracyWrapper;
