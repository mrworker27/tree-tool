import { memo, useCallback, useState, useRef, useEffect } from "react";
import { Handle, Position } from "@xyflow/react";
import styles from "./CustomNode.module.css";

interface CustomNodeProps {
  data: {
    uuid: string;
    parentUuid: string | null;
    color: string;
    note: string;
    parentModeActive?: boolean;
    editing?: boolean;
  };
  selected?: boolean;
}

export const CustomNode = memo(({ data, selected }: CustomNodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState(data.note);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNote(data.note);
  }, [data.note]);

  useEffect(() => {
    if (data.editing && !isEditing) {
      setIsEditing(true);
      data.editing = false;
    }
  }, [data.editing, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleNoteChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setNote(value);
      data.note = value;
    },
    [data],
  );

  const handleBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    }
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (!isEditing && !data.parentModeActive) {
      setIsEditing(true);
      data.editing = false;
    }
  }, [isEditing, data.parentModeActive, data]);

  const circleStroke = selected ? "#60A5FA" : "transparent";
  const circleStrokeWidth = selected ? 0 : 0;
  const circleFilter = selected
    ? "drop-shadow(0 0 4px rgba(96, 165, 250, 0.8))"
    : "none";

  return (
    <div className={styles.node}>
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className={styles.handleTop}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className={styles.handleBottom}
      />

      <svg
        width="50"
        height="50"
        className={`${styles.circleSvg} drag-handle`}
        onDoubleClick={handleDoubleClick}
        style={{ filter: circleFilter }}
      >
        <circle
          cx="25"
          cy="25"
          r="22"
          fill={data.color}
          stroke={circleStroke}
          strokeWidth={circleStrokeWidth}
        />
      </svg>

      <div
        className={styles.noteContainer}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={handleDoubleClick}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={note}
            onChange={handleNoteChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onDoubleClick={handleDoubleClick}
            className={styles.noteInput}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className={styles.noteText}
            onClick={(e) => e.stopPropagation()}
          >
            {note || "..."}
          </span>
        )}
      </div>
    </div>
  );
});

CustomNode.displayName = "CustomNode";
