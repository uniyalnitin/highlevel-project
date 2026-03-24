"use client";

import { useEffect, useState } from "react";

export default function HealthCheck() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((body) => setStatus(body.data))
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <p style={{ color: "red" }}>Backend not reachable: {error}</p>;
  }

  if (!status) {
    return <p style={{ color: "gray" }}>Checking backend…</p>;
  }

  return (
    <div style={{ marginTop: 20, padding: 16, background: "#f0fdf4", borderRadius: 8, border: "1px solid #86efac" }}>
      <strong>Backend Status:</strong> {status.status} &nbsp;|&nbsp;
      <strong>Database:</strong> {status.database} &nbsp;|&nbsp;
      <strong>Uptime:</strong> {Math.round(status.uptime)}s
    </div>
  );
}
