import { memo } from 'react';
import { EdgeProps, getStraightPath } from '@xyflow/react';
import styles from './CustomEdge.module.css';

export const CustomEdge = memo(({
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
}: EdgeProps) => {
  const isValid =
    typeof sourceX === 'number' &&
    typeof sourceY === 'number' &&
    typeof targetX === 'number' &&
    typeof targetY === 'number' &&
    !isNaN(sourceX) &&
    !isNaN(sourceY) &&
    !isNaN(targetX) &&
    !isNaN(targetY);

  if (!isValid) {
    return null;
  }

  const [path] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <path
      d={path}
      className={styles.edge}
      markerEnd={markerEnd}
    />
  );
});

CustomEdge.displayName = 'CustomEdge';