import React, { useState } from "react";
import WorkflowCanvas from "./components/Workflow_Canvas";
import FileUpload from "./components/File_Upload";
import "./App.css";

function App() {
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleWorkflowStart = () => {
    setIsExecuting(true);
    setWorkflowStatus(null);
  };

  const handleWorkflowComplete = (workflow) => {
    setIsExecuting(false);
    setWorkflowStatus(workflow);
  };

  return (
    <div className="App">
      <header
        style={{
          backgroundColor: "#2c3e50",
          padding: "30px 20px",
          color: "white",
          textAlign: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "32px" }}>
          🤖 Document Upload Automation System
        </h1>
        <p style={{ margin: "10px 0 0 0", fontSize: "16px", opacity: 0.9 }}>
          MERN Stack with React Flow | Automated Workflow Demo
        </p>
      </header>

      <main
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "20px",
          minHeight: "calc(100vh - 200px)",
        }}
      >
        <WorkflowCanvas
          workflowStatus={workflowStatus}
          isExecuting={isExecuting}
        />
        <FileUpload
          onWorkflowStart={handleWorkflowStart}
          onWorkflowComplete={handleWorkflowComplete}
        />
      </main>

      <footer
        style={{
          textAlign: "center",
          padding: "30px 20px",
          color: "#666",
          backgroundColor: "#f5f5f5",
          borderTop: "1px solid #e0e0e0",
        }}
      >
        <div style={{ marginBottom: "15px" }}>
          <p style={{ margin: "5px 0", fontSize: "16px", fontWeight: "600" }}>
            💡 How it works
          </p>
          <p style={{ margin: "5px 0", fontSize: "14px" }}>
            Upload a document → Automated workflow executes → Email notification
            sent → File stored in Google Drive
          </p>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "30px",
            flexWrap: "wrap",
            fontSize: "13px",
            color: "#999",
          }}
        >
          <span>⚡ Real-time Updates</span>
          <span>📧 Email Notifications</span>
          <span>☁️ Google Drive Integration</span>
          <span>🎨 React Flow Visualization</span>
        </div>
        <p style={{ marginTop: "15px", fontSize: "12px", color: "#999" }}>
          Built with MongoDB, Express, React & Node.js
        </p>
      </footer>
    </div>
  );
}

export default App;
