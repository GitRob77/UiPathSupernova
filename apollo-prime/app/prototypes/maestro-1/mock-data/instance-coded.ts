import { ExecutionTrailStep, GlobalVariable } from "../types/debug";

/* ── Completed coded instance #5797120 ─────────────────────────── */

export const executionTrailV2_coded_5797120: ExecutionTrailStep = {
  id: "instance-root",
  name: "Instance: a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  type: "instance",
  status: "completed",
  duration: "2 min, 34 sec",
  endedAt: "2026-03-15 10:07:34",
  children: [
    {
      id: "doc-received",
      name: "Doc Received (Start event)",
      type: "start-event",
      status: "completed",
      duration: "< 1 sec",
      endedAt: "2026-03-15 10:05:00",
    },
    {
      id: "classify-doc",
      name: "Classify Document",
      type: "service-task",
      status: "completed",
      duration: "6 sec",
      endedAt: "2026-03-15 10:05:08",
      stepDetails: {
        input: [
          { name: "documentId", value: "DOC-2026-0315-0042" },
          { name: "source", value: "email-inbox" },
          { name: "fileName", value: "Acme_Corp_Invoice_4421.pdf" },
        ],
        output: [
          { name: "documentType", value: "invoice" },
          { name: "confidence", value: "0.97" },
          { name: "language", value: "en" },
        ],
        variables: [
          { name: "classificationModel", value: "doc-classifier-v3.2" },
          { name: "retryCount", value: "0" },
        ],
      },
    },
    {
      id: "gateway-invoice",
      name: "Is Invoice? (Gateway)",
      type: "gateway",
      status: "completed",
      duration: "< 1 sec",
      endedAt: "2026-03-15 10:05:08",
    },
    {
      id: "fetch-pdf",
      name: "Fetch PDF & Extract Data",
      type: "service-task",
      status: "completed",
      duration: "1 min, 47 sec",
      endedAt: "2026-03-15 10:06:55",
      stepDetails: {
        input: [
          { name: "documentId", value: "DOC-2026-0315-0042" },
          { name: "agentType", value: "Fetch PDF Agent" },
          { name: "maxRetries", value: "3" },
        ],
        output: [
          { name: "storageUrl", value: "orchestrator://buckets/invoice-processing-bucket/2026/03/15/Acme_Corp_Invoice_4421.zip" },
          { name: "totalPages", value: "3" },
          { name: "extractedFields", value: "12" },
        ],
        variables: [
          { name: "imageCount", value: "2" },
          { name: "pdfCount", value: "1" },
          { name: "mergedFileSize", value: "1.8 MB" },
          { name: "zipFileSize", value: "1.2 MB" },
        ],
      },
      children: [
        {
          id: "execute",
          name: "Execute ()",
          type: "service-task",
          status: "completed",
          duration: "< 1 sec",
          endedAt: "2026-03-15 10:05:10",
          stepDetails: {
            input: [
              { name: "workflowPath", value: "/workflows/fetch-pdf-extract.xaml" },
              { name: "documentId", value: "DOC-2026-0315-0042" },
            ],
            output: [
              { name: "initialized", value: "true" },
            ],
            variables: [
              { name: "executionContext", value: "Production" },
            ],
          },
        },
        {
          id: "look-for-files",
          name: "look for files",
          type: "service-task",
          status: "completed",
          duration: "8 sec",
          endedAt: "2026-03-15 10:05:18",
          stepDetails: {
            input: [
              { name: "searchPath", value: "/inbox/pending/" },
              { name: "pattern", value: "*.pdf,*.png,*.jpg,*.tiff" },
            ],
            output: [
              { name: "filesFound", value: "3" },
              { name: "fileList", value: "invoice_page1.png, invoice_page2.png, invoice_page3.pdf" },
            ],
            variables: [
              { name: "imageCount", value: "2" },
              { name: "pdfCount", value: "1" },
            ],
          },
        },
        {
          id: "any-images-found",
          name: "Any images found?",
          type: "gateway",
          status: "completed",
          duration: "< 1 sec",
          endedAt: "2026-03-15 10:05:18",
          stepDetails: {
            input: [
              { name: "imageCount", value: "2" },
            ],
            output: [
              { name: "result", value: "true" },
              { name: "branch", value: "Yes — convert images to PDF" },
            ],
          },
        },
        {
          id: "convert-to-pdf",
          name: "Convert to PDF",
          type: "service-task",
          status: "completed",
          duration: "26 sec",
          endedAt: "2026-03-15 10:05:44",
          stepDetails: {
            input: [
              { name: "sourceFiles", value: "invoice_page1.png, invoice_page2.png" },
              { name: "dpi", value: "300" },
              { name: "colorSpace", value: "RGB" },
            ],
            output: [
              { name: "convertedFiles", value: "invoice_page1.pdf, invoice_page2.pdf" },
              { name: "totalPages", value: "2" },
            ],
          },
        },
        {
          id: "any-pdfs-found",
          name: "Any PDFs found?",
          type: "gateway",
          status: "completed",
          duration: "< 1 sec",
          endedAt: "2026-03-15 10:05:44",
          stepDetails: {
            input: [
              { name: "pdfCount", value: "3" },
            ],
            output: [
              { name: "result", value: "true" },
              { name: "branch", value: "Yes — merge all PDFs" },
            ],
          },
        },
        {
          id: "merge-pdfs",
          name: "Merge PDFs in one file",
          type: "service-task",
          status: "completed",
          duration: "21 sec",
          endedAt: "2026-03-15 10:06:05",
          stepDetails: {
            input: [
              { name: "files", value: "invoice_page1.pdf, invoice_page2.pdf, invoice_page3.pdf" },
              { name: "outputName", value: "Acme_Corp_Invoice_4421_merged.pdf" },
            ],
            output: [
              { name: "mergedFile", value: "Acme_Corp_Invoice_4421_merged.pdf" },
              { name: "totalPages", value: "3" },
              { name: "fileSize", value: "1.8 MB" },
            ],
          },
        },
        {
          id: "create-zip",
          name: "Create ZIP file with merged PDF",
          type: "service-task",
          status: "completed",
          duration: "14 sec",
          endedAt: "2026-03-15 10:06:19",
          stepDetails: {
            input: [
              { name: "sourceFile", value: "Acme_Corp_Invoice_4421_merged.pdf" },
              { name: "compressionLevel", value: "optimal" },
            ],
            output: [
              { name: "zipFile", value: "Acme_Corp_Invoice_4421.zip" },
              { name: "zipSize", value: "1.2 MB" },
            ],
          },
        },
        {
          id: "upload-zip",
          name: "Upload ZIP to Google Drive",
          type: "service-task",
          status: "completed",
          duration: "36 sec",
          endedAt: "2026-03-15 10:06:55",
          stepDetails: {
            input: [
              { name: "file", value: "Acme_Corp_Invoice_4421.zip" },
              { name: "bucket", value: "invoice-processing-bucket" },
              { name: "folder", value: "/2026/03/15/" },
            ],
            output: [
              { name: "storageUrl", value: "orchestrator://buckets/invoice-processing-bucket/2026/03/15/Acme_Corp_Invoice_4421.zip" },
              { name: "blobId", value: "blob-9f8e7d6c-5b4a-3c2d-1e0f" },
            ],
            variables: [
              { name: "uploadRetries", value: "0" },
              { name: "bandwidth", value: "12.4 MB/s" },
            ],
          },
        },
      ],
    },
    {
      id: "archive-doc",
      name: "Archive Document",
      type: "service-task",
      status: "completed",
      duration: "15 sec",
      endedAt: "2026-03-15 10:07:10",
      stepDetails: {
        input: [
          { name: "documentId", value: "DOC-2026-0315-0042" },
          { name: "category", value: "invoice" },
          { name: "vendor", value: "Acme Corp" },
          { name: "storageUrl", value: "orchestrator://buckets/invoice-processing-bucket/2026/03/15/Acme_Corp_Invoice_4421.zip" },
        ],
        output: [
          { name: "archiveId", value: "ARC-2026-0315-0042" },
          { name: "location", value: "/archives/invoices/2026/03/" },
          { name: "retentionPolicy", value: "7 years" },
        ],
        variables: [
          { name: "archiveStatus", value: "indexed" },
          { name: "searchable", value: "true" },
        ],
      },
    },
    {
      id: "send-confirmation",
      name: "Send Confirmation",
      type: "service-task",
      status: "completed",
      duration: "24 sec",
      endedAt: "2026-03-15 10:07:34",
      stepDetails: {
        input: [
          { name: "to", value: "accounts@company.com" },
          { name: "cc", value: "procurement@company.com" },
          { name: "subject", value: "Invoice INV-2026-4421 from Acme Corp — processed and archived" },
          { name: "template", value: "invoice-confirmation-v2" },
        ],
        output: [
          { name: "status", value: "sent" },
          { name: "messageId", value: "MSG-2026-0315-7723" },
          { name: "deliveredAt", value: "2026-03-15 10:07:33" },
        ],
      },
    },
    {
      id: "end-event",
      name: "End event",
      type: "end-event",
      status: "completed",
      duration: "< 1 sec",
      endedAt: "2026-03-15 10:07:34",
    },
  ],
};

/* ── ExecutionTrailNode for step detail view (fetch-pdf) ─────────── */

import type { ExecutionTrailNode } from "./instance-5797111";

export const fetchPdfExecutionTrail: ExecutionTrailNode = {
  id: "fetch-pdf",
  label: "Fetch PDF & Extract Data",
  status: "completed",
  duration: "1 min, 47 sec",
  endedAt: "2026-03-15 10:06:55",
  children: [
    {
      id: "execute",
      label: "Execute ()",
      status: "completed",
      duration: "< 1 sec",
      endedAt: "2026-03-15 10:05:10",
      input: { workflowPath: "/workflows/fetch-pdf-extract.xaml", documentId: "DOC-2026-0315-0042" },
      output: { initialized: "true" },
    },
    {
      id: "look-for-files",
      label: "Look for files",
      status: "completed",
      duration: "8 sec",
      endedAt: "2026-03-15 10:05:18",
      input: { searchPath: "/inbox/pending/", pattern: "*.pdf,*.png,*.jpg,*.tiff" },
      output: { filesFound: "3", fileList: "invoice_page1.png, invoice_page2.png, invoice_page3.pdf" },
    },
    {
      id: "any-images-found",
      label: "Any images found?",
      status: "completed",
      duration: "< 1 sec",
      endedAt: "2026-03-15 10:05:18",
      input: { imageCount: "2" },
      output: { result: "true", branch: "Yes" },
    },
    {
      id: "convert-to-pdf",
      label: "Convert to PDF",
      status: "completed",
      duration: "26 sec",
      endedAt: "2026-03-15 10:05:44",
      input: { sourceFiles: "invoice_page1.png, invoice_page2.png", dpi: "300", colorSpace: "RGB" },
      output: { convertedFiles: "invoice_page1.pdf, invoice_page2.pdf", totalPages: "2" },
    },
    {
      id: "any-pdfs-found",
      label: "Any PDFs found?",
      status: "completed",
      duration: "< 1 sec",
      endedAt: "2026-03-15 10:05:44",
      input: { pdfCount: "3" },
      output: { result: "true", branch: "Yes" },
    },
    {
      id: "merge-pdfs",
      label: "Merge PDFs in one file",
      status: "completed",
      duration: "21 sec",
      endedAt: "2026-03-15 10:06:05",
      input: { files: "invoice_page1.pdf, invoice_page2.pdf, invoice_page3.pdf", outputName: "Acme_Corp_Invoice_4421_merged.pdf" },
      output: { mergedFile: "Acme_Corp_Invoice_4421_merged.pdf", totalPages: "3", fileSize: "1.8 MB" },
    },
    {
      id: "create-zip",
      label: "Create ZIP file with merged PDF",
      status: "completed",
      duration: "14 sec",
      endedAt: "2026-03-15 10:06:19",
      input: { sourceFile: "Acme_Corp_Invoice_4421_merged.pdf", compressionLevel: "optimal" },
      output: { zipFile: "Acme_Corp_Invoice_4421.zip", zipSize: "1.2 MB" },
    },
    {
      id: "upload-zip",
      label: "Upload ZIP to Google Drive",
      status: "completed",
      duration: "36 sec",
      endedAt: "2026-03-15 10:06:55",
      input: { file: "Acme_Corp_Invoice_4421.zip", bucket: "invoice-processing-bucket", folder: "/2026/03/15/" },
      output: { storageUrl: "orchestrator://buckets/invoice-processing-bucket/2026/03/15/Acme_Corp_Invoice_4421.zip", blobId: "blob-9f8e7d6c-5b4a-3c2d-1e0f" },
    },
    {
      id: "end",
      label: "End execution",
      status: "completed",
      duration: "< 1 sec",
      endedAt: "2026-03-15 10:06:55",
    },
  ],
};

/* ── Faulted fetch-pdf trail (stops at convert-to-pdf with error) ── */

export const fetchPdfExecutionTrail_faulted: ExecutionTrailNode = {
  id: "fetch-pdf",
  label: "Fetch PDF & Extract Data",
  status: "faulted",
  duration: "42 sec",
  endedAt: "2026-03-12 11:47:42",
  errorCode: "ACTIVITY.CONVERT_PDF_FAILED",
  errorMessage: "Failed to convert image to PDF: unsupported image format",
  errorDetail: "The file 'invoice_scan.tiff' uses an unsupported TIFF compression (LZW). The PDF conversion engine requires uncompressed or JPEG-compressed TIFF files.",
  errorCategory: "Application",
  errorStatus: 500,
  children: [
    {
      id: "execute",
      label: "Execute ()",
      status: "completed",
      duration: "< 1 sec",
      endedAt: "2026-03-12 11:47:01",
      input: { workflowPath: "/workflows/fetch-pdf-extract.xaml", documentId: "DOC-2026-0312-0089" },
      output: { initialized: "true" },
    },
    {
      id: "look-for-files",
      label: "Look for files",
      status: "completed",
      duration: "6 sec",
      endedAt: "2026-03-12 11:47:07",
      input: { searchPath: "/inbox/pending/", pattern: "*.pdf,*.png,*.jpg,*.tiff" },
      output: { filesFound: "2", fileList: "invoice_scan.tiff, attachment.pdf" },
    },
    {
      id: "any-images-found",
      label: "Any images found?",
      status: "completed",
      duration: "< 1 sec",
      endedAt: "2026-03-12 11:47:07",
      input: { imageCount: "1" },
      output: { result: "true", branch: "Yes" },
    },
    {
      id: "convert-to-pdf",
      label: "Convert to PDF",
      status: "faulted",
      duration: "35 sec",
      endedAt: "2026-03-12 11:47:42",
      input: { sourceFiles: "invoice_scan.tiff", dpi: "300", colorSpace: "RGB" },
      output: {},
      errorCode: "ACTIVITY.CONVERT_PDF_FAILED",
      errorMessage: "Failed to convert image to PDF: unsupported image format",
      errorDetail: "The file 'invoice_scan.tiff' uses an unsupported TIFF compression (LZW). The PDF conversion engine requires uncompressed or JPEG-compressed TIFF files.",
      errorCategory: "Application",
      errorStatus: 500,
    },
  ],
};

export const instanceGlobalVars_coded_5797120: GlobalVariable[] = [
  {
    name: "documentType",
    type: "string",
    source: "Classify Document",
    value: "invoice",
  },
  {
    name: "extractedData",
    type: "object",
    source: "Fetch PDF & Extract Data",
    value: '{"vendor":"Acme Corp","invoiceNumber":"INV-2026-4421","amount":"$12,450.00","dueDate":"2026-04-12"}',
  },
  {
    name: "dataValid",
    type: "boolean",
    source: "Data Valid? (Gateway)",
    value: "true",
  },
  {
    name: "archiveId",
    type: "string",
    source: "Archive Document",
    value: "ARC-2026-0312-001",
  },
  {
    name: "Error",
    type: "string",
    source: "Fetch PDF & Extract Data",
    value: null,
  },
];
