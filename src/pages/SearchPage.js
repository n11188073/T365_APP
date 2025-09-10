import React from "react";
import { useSearchParams } from "react-router-dom";

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  return (
    <div style={{ padding: 16 }}>
      <h2>Search results for “{q}”</h2>
      <p>(We’ll wire real results next.)</p>
    </div>
  );
}