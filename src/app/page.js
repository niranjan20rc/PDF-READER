"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function Home() {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
      <h1>Next.js PDF Reader</h1>

      {/* File Upload */}
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ margin: "20px 0" }}
      />

      {/* PDF Viewer */}
      {file && (
        <div>
          <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
            <Page pageNumber={pageNumber} />
          </Document>

          {/* Page Navigation */}
          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
              disabled={pageNumber <= 1}
              style={{ marginRight: 10 }}
            >
              Prev
            </button>

            <span>
              Page {pageNumber} of {numPages}
            </span>

            <button
              onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages))}
              disabled={pageNumber >= numPages}
              style={{ marginLeft: 10 }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
