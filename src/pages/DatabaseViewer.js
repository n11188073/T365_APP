// src/pages/DatabaseViewer.js
import React, { useEffect, useState } from 'react';

const DatabaseViewer = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch tables
  useEffect(() => {
    const fetchTables = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/tables');
        const data = await res.json();
        if (Array.isArray(data)) {
          setTables(data);
        } else {
          console.error('Unexpected tables response:', data);
          setError('Failed to load tables');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch tables');
      } finally {
        setLoading(false);
      }
    };
    fetchTables();
  }, []);

  // Fetch rows for selected table
  const handleSelectTable = async (table) => {
    setSelectedTable(table);
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/table/${table}`);
      const data = await res.json();
      setRows(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch table data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ padding: '20px' }}>
      <h1>📊 Database Viewer</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Loading...</p>}

      <h2>Tables</h2>
      <ul>
        {tables.map((t) => (
          <li key={t}>
            <button onClick={() => handleSelectTable(t)}>{t}</button>
          </li>
        ))}
      </ul>

      {selectedTable && (
        <div style={{ marginTop: '20px' }}>
          <h2>Table: {selectedTable}</h2>
          {rows.length > 0 ? (
            <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {Object.keys(rows[0]).map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i}>{val?.toString()}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No data in this table</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DatabaseViewer;
