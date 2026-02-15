import { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { GraphCanvas } from './components/GraphCanvas';
import { ColorType } from './types/graph';
import styles from './App.module.css';

function App() {
  const [selectedColor, setSelectedColor] = useState<ColorType | null>(null);

  const handleColorApplied = useCallback(() => {
    setSelectedColor(null);
  }, []);

  const handleExport = useCallback(() => {
    const event = new CustomEvent('exportGraph');
    window.dispatchEvent(event);
  }, []);

  const handleImport = useCallback(() => {
    const event = new CustomEvent('importGraph');
    window.dispatchEvent(event);
  }, []);

  return (
    <div className={styles.app}>
      <Sidebar
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
        onExport={handleExport}
        onImport={handleImport}
      />
      
      <main className={styles.main}>
        <GraphCanvas
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
          onColorApplied={handleColorApplied}
        />
      </main>
    </div>
  );
}

export default App;