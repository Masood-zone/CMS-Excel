"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
} from "lucide-react";
import { toast } from "sonner";

interface ImportError {
  row: number;
  field: string;
  value: string;
  message: string;
}

interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulImports: number;
  errors: ImportError[];
  duplicates: string[];
}

interface ImportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File, classId?: number) => Promise<ImportResult>;
  classId?: number;
}

export function ImportStudentsModal({
  isOpen,
  onClose,
  onImport,
  classId,
}: ImportStudentsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        ".xlsx",
        ".xls",
      ];

      const isValidType = validTypes.some(
        (type) =>
          selectedFile.type === type ||
          selectedFile.name.toLowerCase().endsWith(type)
      );

      if (!isValidType) {
        toast.error("Please select a valid Excel file (.xlsx or .xls)");
        return;
      }

      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setFile(selectedFile);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await onImport(file, classId);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setImportResult(result);

      if (result.success) {
        toast.success(
          `Successfully imported ${result.successfulImports} students`
        );
      } else {
        toast.error(`Import completed with ${result.errors.length} errors`);
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import students. Please try again.");
      setImportResult({
        success: false,
        totalRows: 0,
        successfulImports: 0,
        errors: [
          {
            row: 0,
            field: "file",
            value: "",
            message: "Failed to process file",
          },
        ],
        duplicates: [],
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setImportResult(null);
    setUploadProgress(0);
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const downloadTemplate = () => {
    // Create a simple CSV template with class column
    const csvContent =
      "name,age,gender,class\nJohn Doe,15,male,Grade 10A\nJane Smith,14,female,Grade 9B\nSample Student,16,male,Grade 11C";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_import_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Students from Excel
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file (.xlsx or .xls) containing student data. The
            file should have columns for name, age, and gender.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <p className="text-sm font-medium text-blue-900">
                Need a template?
              </p>
              <p className="text-xs text-blue-700">
                Download our sample template to get started
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select Excel File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file-upload"
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="flex-1"
              />
              {file && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <FileSpreadsheet className="h-3 w-3" />
                  {file.name}
                </Badge>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Importing students...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Import Results */}
          {importResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      Successful
                    </span>
                  </div>
                  <p className="text-lg font-bold text-green-700">
                    {importResult.successfulImports}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-900">
                      Errors
                    </span>
                  </div>
                  <p className="text-lg font-bold text-red-700">
                    {importResult.errors.length}
                  </p>
                </div>
              </div>

              {/* Duplicates Warning */}
              {importResult.duplicates.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Duplicate students found:</strong>{" "}
                    {importResult.duplicates.join(", ")}
                    <br />
                    These students were skipped as they already exist in the
                    system.
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Details */}
              {importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-900">
                    Import Errors:
                  </h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {importResult.errors.map((error, index) => (
                      <Alert key={index} variant="destructive" className="py-2">
                        <AlertDescription className="text-xs">
                          <strong>Row {error.row}:</strong> {error.message}
                          {error.field && error.value && (
                            <span className="ml-2 text-gray-600">
                              ({error.field}: "{error.value}")
                            </span>
                          )}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="p-3 bg-gray-50 rounded-lg border">
            <h4 className="text-sm font-medium mb-2">File Requirements:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• File format: Excel (.xlsx or .xls)</li>
              <li>• Maximum file size: 5MB</li>
              <li>• Required columns: name, age, gender</li>
              <li>
                • Optional column: class (must match existing class names)
              </li>
              <li>• Gender values: "male" or "female"</li>
              <li>• Age must be a valid number</li>
              <li>• First row should contain column headers</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            {importResult ? "Close" : "Cancel"}
          </Button>
          {!importResult && (
            <Button
              onClick={handleImport}
              disabled={!file || isUploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? "Importing..." : "Import Students"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
