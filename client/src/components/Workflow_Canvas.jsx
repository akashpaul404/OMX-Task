import React, { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

const initialNodes = [
  {
    id: "trigger",
    type: "input",
    data: { label: "📁 Document Upload Trigger" },
    position: { x: 250, y: 0 },
    style: {
      background: "#fff3cd",
      border: "2px solid #ffc107",
      borderRadius: "8px",
      padding: "12px 20px",
      fontSize: "14px",
      fontWeight: "bold",
      minWidth: "200px",
      textAlign: "center",
    },
  },
  {
    id: "node1",
    data: { label: "📧 Node 1: Send Email Notification" },
    position: { x: 250, y: 120 },
    style: {
      background: "#e3f2fd",
      border: "2px solid #2196f3",
      borderRadius: "8px",
      padding: "12px 20px",
      fontSize: "14px",
      minWidth: "200px",
      textAlign: "center",
    },
  },
  {
    id: "node2",
    data: { label: "📁 Node 2: Upload to Google Drive" },
    position: { x: 250, y: 240 },
    style: {
      background: "#e8f5e9",
      border: "2px solid #4caf50",
      borderRadius: "8px",
      padding: "12px 20px",
      fontSize: "14px",
      minWidth: "200px",
      textAlign: "center",
    },
  },
];

const initialEdges = [
  {
    id: "e1",
    source: "trigger",
    target: "node1",
    animated: false,
    style: { stroke: "#ffc107", strokeWidth: 2 },
  },
  {
    id: "e2",
    source: "node1",
    target: "node2",
    animated: false,
    style: { stroke: "#2196f3", strokeWidth: 2 },
  },
];

function WorkflowCanvas({ workflowStatus, isExecuting }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update node styles based on workflow status
  useEffect(() => {
    if (!workflowStatus) {
      // Reset to initial state
      setNodes(initialNodes);
      setEdges(initialEdges);
      return;
    }

    // Update nodes based on workflow steps
    const updatedNodes = nodes.map((node) => {
      let stepStatus = "pending";
      let stepData = null;

      if (workflowStatus.steps) {
        if (node.id === "trigger") {
          stepData = workflowStatus.steps.find((s) => s.id === "trigger");
        } else if (node.id === "node1") {
          stepData = workflowStatus.steps.find((s) => s.id === "node1");
        } else if (node.id === "node2") {
          stepData = workflowStatus.steps.find((s) => s.id === "node2");
        }

        if (stepData) {
          stepStatus = stepData.status;
        }
      }

      // Style based on status
      let newStyle = { ...node.style };

      if (stepStatus === "completed") {
        newStyle.background = "#4caf50";
        newStyle.color = "white";
        newStyle.border = "3px solid #2e7d32";
        newStyle.boxShadow = "0 4px 12px rgba(76, 175, 80, 0.4)";
        newStyle.animation = "pulse 0.5s ease-in-out";
      } else if (stepStatus === "running") {
        newStyle.background = "#ff9800";
        newStyle.color = "white";
        newStyle.border = "3px solid #f57c00";
        newStyle.boxShadow = "0 4px 12px rgba(255, 152, 0, 0.6)";
        newStyle.animation = "pulse 1s ease-in-out infinite";
      } else if (stepStatus === "failed") {
        newStyle.background = "#f44336";
        newStyle.color = "white";
        newStyle.border = "3px solid #c62828";
        newStyle.boxShadow = "0 4px 12px rgba(244, 67, 54, 0.4)";
      }

      return {
        ...node,
        style: newStyle,
      };
    });

    setNodes(updatedNodes);

    // Animate edges based on execution
    const updatedEdges = edges.map((edge) => {
      let shouldAnimate = false;

      if (workflowStatus.steps) {
        if (edge.id === "e1") {
          const triggerStep = workflowStatus.steps.find(
            (s) => s.id === "trigger"
          );
          const node1Step = workflowStatus.steps.find((s) => s.id === "node1");
          shouldAnimate =
            triggerStep?.status === "completed" ||
            node1Step?.status === "running";
        } else if (edge.id === "e2") {
          const node1Step = workflowStatus.steps.find((s) => s.id === "node1");
          const node2Step = workflowStatus.steps.find((s) => s.id === "node2");
          shouldAnimate =
            node1Step?.status === "completed" ||
            node2Step?.status === "running";
        }
      }

      return {
        ...edge,
        animated: shouldAnimate,
      };
    });

    setEdges(updatedEdges);
  }, [workflowStatus]);

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <h2 style={{ margin: 0, color: "#2c3e50" }}>⚙️ Automation Workflow</h2>
        {isExecuting && (
          <div
            style={{
              padding: "8px 16px",
              backgroundColor: "#ff9800",
              color: "white",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span className="spinner">⚡</span>
            Executing...
          </div>
        )}
        {workflowStatus?.status === "completed" && (
          <div
            style={{
              padding: "8px 16px",
              backgroundColor: "#4caf50",
              color: "white",
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            ✅ Completed
          </div>
        )}
      </div>

      <div
        style={{
          height: "500px",
          border: "2px solid #e0e0e0",
          borderRadius: "12px",
          backgroundColor: "#fafafa",
          overflow: "hidden",
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
        >
          <Background color="#e0e0e0" gap={16} />
          <Controls />
        </ReactFlow>
      </div>

      {/* Workflow Status Panel */}
      {workflowStatus && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
          }}
        >
          <h3 style={{ marginTop: 0, color: "#2c3e50" }}>📊 Workflow Status</h3>
          <div style={{ display: "grid", gap: "10px" }}>
            {workflowStatus.steps?.map((step, index) => (
              <div
                key={step.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "6px",
                  borderLeft: `4px solid ${
                    step.status === "completed"
                      ? "#4caf50"
                      : step.status === "running"
                      ? "#ff9800"
                      : step.status === "failed"
                      ? "#f44336"
                      : "#ccc"
                  }`,
                }}
              >
                <span style={{ fontSize: "20px" }}>
                  {step.status === "completed"
                    ? "✅"
                    : step.status === "running"
                    ? "⏳"
                    : step.status === "failed"
                    ? "❌"
                    : "⏸️"}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "600", color: "#2c3e50" }}>
                    {step.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#999" }}>
                    {step.timestamp
                      ? new Date(step.timestamp).toLocaleTimeString()
                      : "Waiting..."}
                  </div>
                </div>
                <div
                  style={{
                    padding: "4px 12px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    backgroundColor:
                      step.status === "completed"
                        ? "#e8f5e9"
                        : step.status === "running"
                        ? "#fff3e0"
                        : step.status === "failed"
                        ? "#ffebee"
                        : "#f5f5f5",
                    color:
                      step.status === "completed"
                        ? "#2e7d32"
                        : step.status === "running"
                        ? "#e65100"
                        : step.status === "failed"
                        ? "#c62828"
                        : "#999",
                  }}
                >
                  {step.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>

          {/* Drive Links */}
          {workflowStatus.driveLink && (
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                backgroundColor: "#e3f2fd",
                borderRadius: "6px",
              }}
            >
              <strong style={{ color: "#1976d2" }}>
                📁 Google Drive Links:
              </strong>
              <div
                style={{
                  marginTop: "10px",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <a
                  href={workflowStatus.driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#4285f4",
                    color: "white",
                    textDecoration: "none",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  📄 View File
                </a>
                {workflowStatus.folderLink && (
                  <a
                    href={workflowStatus.folderLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#34a853",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "4px",
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    📁 View Folder
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add CSS animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        .spinner {
          display: inline-block;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default WorkflowCanvas;
