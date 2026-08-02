"use client";

import React, { useState, useEffect } from "react";
import { EndpointCard } from "@/components/apis/EndpointCard";
import { Search, Filter, Loader2, ServerOff } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface Endpoint {
  id: string;
  method: string;
  path: string;
  handler_name: string;
  file_path: string;
  line_number?: number;
}

export default function APIsPage({ params }: { params: { repoId: string } }) {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");

  useEffect(() => {
    fetchApis();
  }, [params.repoId]);

  const fetchApis = async () => {
    try {
      const res = await fetch(`${API_BASE}/repositories/${params.repoId}/apis`);
      if (res.ok) {
        const data = await res.json();
        setEndpoints(data.endpoints || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEndpoints = endpoints.filter((ep) => {
    const matchesSearch = ep.path.toLowerCase().includes(search.toLowerCase()) || 
                         ep.handler_name.toLowerCase().includes(search.toLowerCase());
    const matchesMethod = methodFilter === "ALL" || ep.method.toUpperCase() === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const methods = ["ALL", "GET", "POST", "PUT", "DELETE", "PATCH"];

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", width: "100%", backgroundColor: "#11111b" }}>
        <Loader2 size={32} color="#89b4fa" style={{ animation: "spin 1s linear infinite" }} />
        <style dangerouslySetInnerHTML={{ __html: \`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }\`}} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", backgroundColor: "#11111b", padding: "32px", overflow: "hidden" }}>
      <div style={{ maxWidth: "1000px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", height: "100%" }}>
        
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#cdd6f4", marginBottom: "8px" }}>API Explorer</h1>
          <p style={{ color: "#a6adc8" }}>Automatically detected API routes and their handlers.</p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: "250px", position: "relative" }}>
            <Search size={18} color="#a6adc8" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search endpoints or handlers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px 10px 40px",
                backgroundColor: "#181825",
                border: "1px solid #313244",
                borderRadius: "8px",
                color: "#cdd6f4",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>
          
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Filter size={16} color="#a6adc8" />
            <div style={{ display: "flex", backgroundColor: "#181825", borderRadius: "8px", border: "1px solid #313244", padding: "2px" }}>
              {methods.map((m) => (
                <button
                  key={m}
                  onClick={() => setMethodFilter(m)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    backgroundColor: methodFilter === m ? "#313244" : "transparent",
                    color: methodFilter === m ? "#cdd6f4" : "#a6adc8",
                    fontSize: "12px",
                    fontWeight: methodFilter === m ? "bold" : "normal",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "8px" }}>
          {filteredEndpoints.length > 0 ? (
            filteredEndpoints.map((ep) => (
              <EndpointCard key={ep.id} endpoint={ep} repoId={params.repoId} />
            ))
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px", color: "#a6adc8", border: "1px dashed #313244", borderRadius: "12px", marginTop: "24px" }}>
              <ServerOff size={48} color="#45475a" style={{ marginBottom: "16px" }} />
              <h3 style={{ color: "#cdd6f4", fontSize: "18px", marginBottom: "8px" }}>No APIs detected</h3>
              <p>Try adjusting your search filters or make sure the repository contains recognized routing files.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
