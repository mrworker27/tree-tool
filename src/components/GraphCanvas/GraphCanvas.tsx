import { useCallback, useRef, useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Panel,
  useReactFlow,
  MarkerType,
  ReactFlowProvider,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { v4 as uuidv4 } from "uuid";
import { COLORS, ColorType } from "../../types/graph";
import { CustomNode } from "../CustomNode";
import { CustomEdge } from "../CustomEdge";
import { Controls } from "../Controls";
import styles from "./GraphCanvas.module.css";

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  default: CustomEdge,
};

interface GraphCanvasProps {
  selectedColor: ColorType | null;
  onColorChange: (color: ColorType) => void;
  onColorApplied: () => void;
}

type ParentModeState = {
  active: boolean;
  childUuid: string | null;
};

function GraphCanvasContent({
  selectedColor,
  onColorApplied,
}: GraphCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [parentMode, setParentMode] = useState<ParentModeState>({
    active: false,
    childUuid: null,
  });
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
const { screenToFlowPosition, setViewport, getViewport } = useReactFlow();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressSelectionRef = useRef(false);
  const exportRef = useRef<() => void>(() => {});
  const importRef = useRef<() => void>(() => void 0);

  useEffect(() => {
    const handleExportRequest = () => exportRef.current();
    const handleImportRequest = () => importRef.current();

    window.addEventListener("exportGraph", handleExportRequest);
    window.addEventListener("importGraph", handleImportRequest);

    return () => {
      window.removeEventListener("exportGraph", handleExportRequest);
      window.removeEventListener("importGraph", handleImportRequest);
    };
  }, []);

  const deriveEdgesFromNodes = useCallback((nodesList: Node[]) => {
    const edgesList: Edge[] = [];
    nodesList.forEach((node) => {
      const parentUuid = node.data.parentUuid as string | null;
      if (parentUuid) {
        edgesList.push({
          id: `${parentUuid}-${node.id}`,
          source: parentUuid,
          target: node.id,
          sourceHandle: "bottom",
          targetHandle: "top",
          type: "default",
          animated: false,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "black",
          },
          style: {
            stroke: "black",
            strokeWidth: 0.2,
          },
        });
      }
    });
    return edgesList;
  }, []);

  const updateEdgesFromNodes = useCallback(() => {
    const newEdges = deriveEdgesFromNodes(nodes);
    setEdges(newEdges);
  }, [nodes, deriveEdgesFromNodes, setEdges]);

  useEffect(() => {
    updateEdgesFromNodes();
  }, [updateEdgesFromNodes]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({ ...n, data: { ...n.data, parentModeActive: parentMode.active } })),
    );
  }, [parentMode.active, setNodes]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (parentMode.active) {
        if (!parentMode.childUuid) {
          setParentMode({ active: true, childUuid: node.id });
        } else {
          if (parentMode.childUuid === node.id) {
            const updatedNodes = nodes.map((n) => {
              if (n.id === parentMode.childUuid) {
                return {
                  ...n,
                  data: { ...n.data, parentUuid: null },
                  selected: false,
                };
              }
              return { ...n, selected: false };
            });
            setParentMode({ active: false, childUuid: null });
            setSelectedNodes(new Set());
            setNodes(updatedNodes);
            return;
          } else {
            const updatedNodes = nodes.map((n) => {
              if (n.id === parentMode.childUuid) {
                return {
                  ...n,
                  data: { ...n.data, parentUuid: node.id },
                  selected: false,
                };
              }
              return { ...n, selected: false };
            });
            setParentMode({ active: false, childUuid: null });
            setSelectedNodes(new Set());
            setNodes(updatedNodes);
            return;
          }
        }
      } else {
        if (selectedNodes.has(node.id)) {
          setSelectedNodes(new Set());
        } else {
          setSelectedNodes(new Set([node.id]));
        }
      }
    },
    [parentMode, nodes, selectedNodes, setNodes],
  );

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      setSelectedNodes(new Set());

      if (parentMode.active) {
        setParentMode({ active: false, childUuid: null });
        return;
      }

      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;

        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const nodeId = uuidv4();
        const newNode: Node = {
          id: nodeId,
          type: "custom",
          position: { x: position.x - 25, y: position.y - 25 },
          data: {
            uuid: nodeId,
            parentUuid: null,
            color: selectedColor || COLORS[0],
            note: "",
            parentModeActive: parentMode.active,
            editing: true,
          },
          draggable: true,
          dragHandle: ".drag-handle",
        };

        setNodes((nds) => [...nds, newNode]);
      } else {
        clickTimeoutRef.current = setTimeout(() => {
          clickTimeoutRef.current = null;
        }, 300);
      }
    },
    [screenToFlowPosition, setNodes, selectedColor, parentMode],
  );

  const onNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      const deletedIds = new Set(deletedNodes.map((n) => n.id));

      const updatedNodes = nodes
        .filter((n) => !deletedIds.has(n.id))
        .map((n) => {
          const parentUuid = n.data.parentUuid as string | null;
          if (deletedIds.has(parentUuid || "")) {
            return {
              ...n,
              data: { ...n.data, parentUuid: null },
            };
          }
          return n;
        });

      setNodes(updatedNodes);
      setSelectedNodes(new Set());
    },
    [nodes, setNodes],
  );

  const onSelectionChange = useCallback(
    ({ nodes: selected }: { nodes: Node[] }) => {
      if (suppressSelectionRef.current) {
        return;
      }
      setSelectedNodes(new Set(selected.map((n) => n.id)));
    },
    [],
  );

  const applyNodeColor = useCallback(
    (color: ColorType) => {
      const updatedNodes = nodes.map((n) => {
        if (selectedNodes.has(n.id)) {
          return {
            ...n,
            data: { ...n.data, color },
          };
        }
        return n;
      });
      setNodes(updatedNodes);
    },
    [nodes, selectedNodes, setNodes],
  );

  useEffect(() => {
    if (selectedColor) {
      applyNodeColor(selectedColor);
      onColorApplied();
    }
  }, [selectedColor, applyNodeColor, onColorApplied]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace" || e.key === "Delete") {
        if (selectedNodes.size > 0 && !parentMode.active) {
          const updatedNodes = nodes
            .filter((n) => !selectedNodes.has(n.id))
            .map((n) => {
              const parentUuid = n.data.parentUuid as string | null;
              if (selectedNodes.has(parentUuid || "")) {
                return {
                  ...n,
                  data: { ...n.data, parentUuid: null },
                };
              }
              return n;
            });
          setNodes(updatedNodes);
          setSelectedNodes(new Set());
        }
      } else if (e.key === "Escape") {
        if (parentMode.active) {
          setParentMode({ active: false, childUuid: null });
        }
        setSelectedNodes(new Set());
      } else if (e.key === " " && !e.ctrlKey && !e.metaKey) {
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        ) {
          return;
        }
        e.preventDefault();
        if (parentMode.active) {
          setParentMode({ active: false, childUuid: null });
        } else {
          const firstSelected =
            selectedNodes.size > 0 ? Array.from(selectedNodes)[0] : null;
          setParentMode({ active: true, childUuid: firstSelected });
          setSelectedNodes(new Set());
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedNodes, nodes, parentMode, setNodes]);

  const handleExport = useCallback(() => {
    const viewport = getViewport();
    const exportData = {
      nodes: nodes.map((n) => ({
        id: n.id,
        type: n.type || "custom",
        position: n.position,
        data: { ...n.data },
      })),
      viewport: { x: viewport.x, y: viewport.y, zoom: viewport.zoom },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "graph.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, getViewport]);

  const handleImportClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            const importedNodes: Node[] = data.nodes.map(
              (n: {
                id: string;
                type: string;
                position: { x: number; y: number };
                data: Record<string, unknown>;
              }) => ({
                id: n.id,
                type: n.type,
                position: n.position,
                data: n.data,
                draggable: true,
              }),
            );
            setNodes(importedNodes);
            if (data.viewport) {
              setViewport(data.viewport);
            }
          } catch (error) {
            console.error("Failed to import graph:", error);
          }
        };
        reader.readAsText(file);
      }
    };

    input.click();
  }, [setNodes, setViewport]);

  exportRef.current = handleExport;
  importRef.current = handleImportClick;

  return (
    <div className={styles.canvas} ref={wrapperRef}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange as OnNodesChange<Node>}
        onEdgesChange={onEdgesChange as OnEdgesChange<Edge>}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodesDelete={onNodesDelete}
        onSelectionChange={onSelectionChange}
        deleteKeyCode={null}
        fitView
        zoomOnDoubleClick={false}
        nodesDraggable={!parentMode.active}
        className={styles.reactFlow}
        defaultEdgeOptions={{
          type: "default",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#6B7280",
          },
          style: {
            stroke: "#6B7280",
            strokeWidth: 2,
          },
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#D1D5DB"
        />

        {parentMode.active && (
          <Panel position="top-center">
            <div className={styles.parentModeIndicator}>
              {parentMode.childUuid
                ? "Select parent node"
                : "Select child node"}
            </div>
          </Panel>
        )}
      </ReactFlow>

      <Controls />

      <div className={styles.actions}>
        <button className={styles.actionButton} onClick={handleExport}>
          Export
        </button>
        <button className={styles.actionButton} onClick={handleImportClick}>
          Import
        </button>
      </div>
    </div>
  );
}

export function GraphCanvas(props: GraphCanvasProps) {
  return (
    <ReactFlowProvider>
      <GraphCanvasContent {...props} />
    </ReactFlowProvider>
  );
}
