"use client";

import { useEffect, useRef, useState } from "react";

// PDF.js URLs
const PDFJS_URL = "https://unpkg.com/pdfjs-dist@3.9.179/build/pdf.min.js";
const PDF_WORKER_URL = "https://unpkg.com/pdfjs-dist@3.9.179/build/pdf.worker.min.js";

export default function PDFViewer() {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const canvasRef = useRef(null);
  const pdfRef = useRef(null);

  // Load PDF.js
  useEffect(() => {
    const script = document.createElement("script");
    script.src = PDFJS_URL;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
    };
    document.body.appendChild(script);
  }, []);

  const handleFile = (uploadedFile) => {
    if (uploadedFile && uploadedFile.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = async function () {
        const typedArray = new Uint8Array(this.result);
        const pdf = await window.pdfjsLib.getDocument(typedArray).promise;
        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
        setCurrentPage(1);
        renderPage(1, pdf);
      };
      reader.readAsArrayBuffer(uploadedFile);
      setFile(uploadedFile.name);
    } else {
      alert("Please upload a valid PDF file!");
    }
  };

  const handleFileChange = (e) => {
    handleFile(e.target.files[0]);
  };

  const renderPage = async (pageNumber, pdf = pdfRef.current) => {
    if (!pdf) return;
    const page = await pdf.getPage(pageNumber);

    const containerWidth = Math.min(window.innerWidth * 0.9, 800);
    const viewport = page.getViewport({ scale: 1 });
    const scale = containerWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const dpr = window.devicePixelRatio || 1;
    canvas.width = scaledViewport.width * dpr;
    canvas.height = scaledViewport.height * dpr;
    canvas.style.width = `${scaledViewport.width}px`;
    canvas.style.height = `${scaledViewport.height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    await page.render({ canvasContext: context, viewport: scaledViewport }).promise;
  };

  const goToPage = (delta) => {
    const newPage = currentPage + delta;
    if (newPage > 0 && newPage <= numPages) {
      setCurrentPage(newPage);
      renderPage(newPage);
    }
  };

  const closePDF = () => {
    setFile(null);
    setNumPages(0);
    setCurrentPage(1);
    pdfRef.current = null;
  };

  useEffect(() => {
    const handleResize = () => renderPage(currentPage);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentPage]);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>📄 PDF Viewer</h1>

      {!file && (
        <label
          style={styles.uploadBox}
          onDragEnter={(e) => e.preventDefault()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFile(e.dataTransfer.files[0]);
            }
          }}
        >
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={styles.inputFile}
          />
          <span style={styles.uploadText}>
            Click or Drag & Drop your PDF here
          </span>
        </label>
      )}

      {file && (
        <div style={styles.viewerContainer}>
          {/* Top controls */}
          <div style={styles.topControls}>
            <p style={styles.fileName}>File: {file}</p>
            <div style={styles.navigation}>
              <button
                onClick={() => goToPage(-1)}
                disabled={currentPage <= 1}
                style={styles.navButton}
              >
                ⬅ Previous
              </button>
              <span style={styles.pageInfo}>
                Page {currentPage} / {numPages}
              </span>
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage >= numPages}
                style={styles.navButton}
              >
                Next ➡
              </button>
              <button onClick={closePDF} style={styles.closeButton}>
                ❌ Close PDF
              </button>
            </div>
          </div>

          {/* PDF canvas */}
          <canvas ref={canvasRef} style={styles.canvas}></canvas>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "30px 20px",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
  },
  heading: {
    fontSize: "2rem",
    marginBottom: "25px",
    color: "#343a40",
    textAlign: "center",
  },
  uploadBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: "450px",
    height: "200px",
    border: "3px dashed #4b5563",
    borderRadius: "15px",
    cursor: "pointer",
    textAlign: "center",
    padding: "20px",
    transition: "0.3s",
  },
  inputFile: { display: "none" },
  uploadText: { color: "#4b5563", fontSize: "1rem", fontWeight: "500" },
  viewerContainer: {
    width: "100%",
    maxWidth: "800px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    marginTop: "20px",
  },
  topControls: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "15px",
    width: "100%",
  },
  navigation: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: "5px",
  },
  navButton: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#343a40",
    color: "#fff",
    cursor: "pointer",
    transition: "0.3s",
  },
  closeButton: {
    padding: "8px 16px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#e63946",
    color: "#fff",
    cursor: "pointer",
    transition: "0.3s",
  },
  pageInfo: {
    fontWeight: "bold",
    color: "#495057",
    display: "flex",
    alignItems: "center",
    padding: "0 5px",
  },
  fileName: {
    fontWeight: "bold",
    color: "#495057",
    textAlign: "center",
  },
  canvas: {
    border: "1px solid #dee2e6",
    borderRadius: "5px",
    maxWidth: "100%",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
};
