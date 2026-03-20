"use client";

import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  url: string;
  title: string;
}

export function PdfViewer({ url, title }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [loadError, setLoadError] = useState(false);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) setContainerWidth(node.clientWidth);
  }, []);

  if (loadError) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Unable to render PDF inline.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Open PDF
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants())}
      >
        Download PDF
      </a>

      <div
        ref={containerRef}
        className="rounded-lg border border-border overflow-hidden bg-muted"
      >
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => {
            setNumPages(numPages);
            setCurrentPage(1);
          }}
          onLoadError={() => setLoadError(true)}
          loading={
            <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
              Loading PDF…
            </div>
          }
        >
          <Page
            pageNumber={currentPage}
            width={containerWidth || undefined}
            renderTextLayer
            renderAnnotationLayer
          />
        </Document>
      </div>

      {numPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            ← Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {numPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
            disabled={currentPage >= numPages}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
}
