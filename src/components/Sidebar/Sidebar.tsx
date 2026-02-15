import { useRef, useCallback, useState } from "react";
import { COLORS, ColorType } from "../../types/graph";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  selectedColor: ColorType | null;
  onColorChange: (color: ColorType) => void;
  onExport: () => void;
  onImport: () => void;
}

export function Sidebar({
  selectedColor,
  onColorChange,
  onExport,
  onImport,
}: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHelpExpanded, setIsHelpExpanded] = useState(true);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onImport();
      }
    },
    [onImport],
  );

  return (
    <div className={styles.sidebar}>
      <div className={styles.section}>
        <h3 className={styles.title}>Color</h3>
        <div className={styles.colorGrid}>
          {COLORS.map((color) => (
            <button
              key={color}
              className={`${styles.colorButton} ${selectedColor === color ? styles.selected : ""}`}
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.title}>File</h3>
        <button className={styles.actionButton} onClick={onExport}>
          Export JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <button className={styles.actionButton} onClick={handleImportClick}>
          Import JSON
        </button>
      </div>

      <div className={styles.section}>
        <button
          className={styles.helpHeader}
          onClick={() => setIsHelpExpanded(!isHelpExpanded)}
        >
          <h3 className={styles.title}>Help</h3>
          <span className={styles.expandIcon}>
            {isHelpExpanded ? "−" : "+"}
          </span>
        </button>

        {isHelpExpanded && (
          <div className={styles.helpContent}>
            <div className={styles.helpGroup}>
              <div className={styles.helpItem}>
                <kbd className={styles.kbd}>Space</kbd>
                <span>Link-parent mode</span>
              </div>
              <div className={styles.helpItem}>
                <kbd className={styles.kbd}>Double-click</kbd>
                <span>Add new node</span>
              </div>
              <div className={styles.helpItem}>
                <kbd className={styles.kbd}>Double-click node</kbd>
                <span>Edit note</span>
              </div>
              <div className={styles.helpItem}>
                <kbd className={styles.kbd}>Backspace</kbd>
                <span>Delete selected</span>
              </div>
              <div className={styles.helpItem}>
                <kbd className={styles.kbd}>Esc</kbd>
                <span>Cancel mode</span>
              </div>
            </div>
            <div className={styles.helpGuide}>
              <div className={styles.guideTitle}>Link-Parent Mode</div>
              <div className={styles.guideSteps}>
                <div className={styles.guideStep}>
                  <span className={styles.stepNumber}>1</span>
                  <span>Press "Space" hotkey</span>
                </div>
                <div className={styles.guideStep}>
                  <span className={styles.stepNumber}>2</span>
                  <span>
                    Click child node (step is skipped if some node is selected
                    already)
                  </span>
                </div>
                <div className={styles.guideStep}>
                  <span className={styles.stepNumber}>2</span>
                  <span>
                    Click parent node to link with (or self to remove link)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
