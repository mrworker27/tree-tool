import { useEffect, useCallback } from 'react';
import styles from './HelpModal.module.css';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Keyboard Shortcuts</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Node Operations</h3>
            <div className={styles.shortcutList}>
              <div className={styles.shortcut}>
                <kbd className={styles.kbd}>P</kbd>
                <span>Toggle parent assignment mode</span>
              </div>
              <div className={styles.shortcut}>
                <kbd className={styles.kbd}>Double-click canvas</kbd>
                <span>Add new node</span>
              </div>
              <div className={styles.shortcut}>
                <kbd className={styles.kbd}>Double-click node</kbd>
                <span>Edit node note</span>
              </div>
              <div className={styles.shortcut}>
                <kbd className={styles.kbd}>Backspace</kbd>
                <span>Delete selected node(s)</span>
              </div>
              <div className={styles.shortcut}>
                <kbd className={styles.kbd}>Esc</kbd>
                <span>Cancel current mode</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Navigation</h3>
            <div className={styles.shortcutList}>
              <div className={styles.shortcut}>
                <kbd className={styles.kbd}>Scroll</kbd>
                <span>Pan canvas</span>
              </div>
              <div className={styles.shortcut}>
                <kbd className={styles.kbd}>Ctrl + Scroll</kbd>
                <span>Zoom in/out</span>
              </div>
              <div className={styles.shortcut}>
                <kbd className={styles.kbd}>Drag canvas</kbd>
                <span>Pan canvas</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Parent Mode</h3>
            <div className={styles.shortcutList}>
              <div className={styles.shortcut}>
                <span>1. Press Space to activate</span>
              </div>
              <div className={styles.shortcut}>
                <span>2. Click child node (highlighted)</span>
              </div>
              <div className={styles.shortcut}>
                <span>3. Click parent node</span>
              </div>
              <div className={styles.shortcut}>
                <span>Click same node twice to clear parent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
