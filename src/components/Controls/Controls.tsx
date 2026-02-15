import { useCallback } from 'react';
import { Panel, useReactFlow } from '@xyflow/react';
import styles from './Controls.module.css';

export function Controls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const handleZoomIn = useCallback(() => {
    zoomIn({ duration: 200 });
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut({ duration: 200 });
  }, [zoomOut]);

  const handleFitView = useCallback(() => {
    fitView({ duration: 200 });
  }, [fitView]);

  return (
    <Panel position="top-right" className={styles.panel}>
      <div className={styles.controls}>
        <button className={styles.button} onClick={handleZoomIn} aria-label="Zoom in">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <button className={styles.button} onClick={handleZoomOut} aria-label="Zoom out">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <button className={styles.button} onClick={handleFitView} aria-label="Fit view">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5 5L3 7M11 5L13 7M5 11L3 9M11 11L13 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </Panel>
  );
}