"use client";

import { useEffect, useRef, useState } from "react";

// PDF.js URLs
const PDFJS_URL = "https://unpkg.com/pdfjs-dist@3.9.179/build/pdf.min.js";
const PDF_WORKER_URL = "https://unpkg.com/pdfjs-dist@3.9.179/build/pdf.worker.min.js";

export default function Page() {
    const [file, setFile] = useState(null);
    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const canvasRef = useRef(null);
    const pdfRef = useRef(null);

    // Load PDF.js dynamically
    useEffect(() => {
        const script = document.createElement("script");
        script.src = PDFJS_URL;
        script.onload = () => {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
        };
        document.body.appendChild(script);
    }, []);

    // Handle file upload
    function handleFileChange(e) {
        const uploadedFile = e.target.files[0];
        if (uploadedFile) {
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
        }
    }

    // Render page with responsive scale
    async function renderPage(pageNumber, pdf = pdfRef.current) {
        if (!pdf) return;
        const page = await pdf.getPage(pageNumber);
        const containerWidth = window.innerWidth * 0.9; // 90% of screen width
        const viewport = page.getViewport({ scale: 1 });
        const scale = containerWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        const context = canvas.getContext("2d");

        const renderContext = { canvasContext: context, viewport: scaledViewport };
        await page.render(renderContext).promise;
    }

    function goToPage(delta) {
        const newPage = currentPage + delta;
        if (newPage > 0 && newPage <= numPages) {
            setCurrentPage(newPage);
            renderPage(newPage);
        }
    }

    // Rerender on window resize
    useEffect(() => {
        const handleResize = () => renderPage(currentPage);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [currentPage]);

    return (
        <div
            style={{
                fontFamily: "Arial, sans-serif",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f8f9fa, #e9ecef)"
            }}
        >
            <h1 style={{ marginBottom: "20px", color: "#343a40" }}>📄 Custom PDF Viewer</h1>

            <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                style={{
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ced4da",
                    marginBottom: "20px",
                    cursor: "pointer",
                    width: "90%",
                    maxWidth: "400px"
                }}
            />

            {file && (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "100%",
                        maxWidth: "800px",
                        background: "#fff",
                        padding: "20px",
                        borderRadius: "10px",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
                    }}
                >
                    <p style={{ marginBottom: "10px", fontWeight: "bold", color: "#495057" }}>
                        File: {file}
                    </p>

                    <canvas
                        ref={canvasRef}
                        style={{
                            border: "1px solid #dee2e6",
                            borderRadius: "5px",
                            maxWidth: "100%",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                        }}
                    ></canvas>

                    <div
                        style={{
                            marginTop: "15px",
                            display: "flex",
                            justifyContent: "center",
                            gap: "15px",
                            flexWrap: "wrap"
                        }}
                    >
                        <button
                            onClick={() => goToPage(-1)}
                            disabled={currentPage <= 1}
                            style={{
                                padding: "10px 20px",
                                border: "none",
                                borderRadius: "5px",
                                backgroundColor: "#343a40",
                                color: "#fff",
                                cursor: currentPage <= 1 ? "not-allowed" : "pointer",
                                transition: "0.3s"
                            }}
                        >
                            ⬅ Previous
                        </button>

                        <span
                            style={{
                                display: "flex",
                                alignItems: "center",
                                fontWeight: "bold",
                                color: "#495057"
                            }}
                        >
                            Page {currentPage} / {numPages}
                        </span>

                        <button
                            onClick={() => goToPage(1)}
                            disabled={currentPage >= numPages}
                            style={{
                                padding: "10px 20px",
                                border: "none",
                                borderRadius: "5px",
                                backgroundColor: "#343a40",
                                color: "#fff",
                                cursor: currentPage >= numPages ? "not-allowed" : "pointer",
                                transition: "0.3s"
                            }}
                        >
                            Next ➡
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
