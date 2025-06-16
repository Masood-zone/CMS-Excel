import * as XLSX from "xlsx";
import { studentService } from "./student-service";
import { ApiError } from "../utils/api-error";

interface ImportError {
  row: number;
  field: string;
  value: any;
  message: string;
}

interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulImports: number;
  errors: ImportError[];
  duplicates: string[];
}

interface StudentRow {
  name?: string;
  age?: string | number;
  gender?: string;
  [key: string]: any;
}

export const importService = {
  async importStudentsFromExcel(
    fileBuffer: Buffer,
    filename: string,
    classId?: number,
    userId?: number
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      totalRows: 0,
      successfulImports: 0,
      errors: [],
      duplicates: [],
    };

    try {
      // Parse Excel file
      const workbook = XLSX.read(fileBuffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        throw new ApiError(400, "Excel file contains no sheets");
      }

      const worksheet = workbook.Sheets[sheetName];
      const jsonData: StudentRow[] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
      });

      if (jsonData.length < 2) {
        throw new ApiError(
          400,
          "Excel file must contain at least a header row and one data row"
        );
      }

      // Get headers from first row
      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1);

      // Validate required columns
      const requiredColumns = ["name", "age", "gender"];
      const headerMap = this.createHeaderMap(headers, requiredColumns);

      if (Object.keys(headerMap).length < requiredColumns.length) {
        const missingColumns = requiredColumns.filter((col) => !headerMap[col]);
        throw new ApiError(
          400,
          `Missing required columns: ${missingColumns.join(", ")}`
        );
      }

      result.totalRows = dataRows.length;

      // Process each row
      for (let i = 0; i < dataRows.length; i++) {
        const rowIndex = i + 2; // +2 because Excel rows start at 1 and we skip header
        const row = dataRows[i] as any[];

        try {
          const studentData = this.extractStudentData(row, headerMap, rowIndex);

          // Validate student data
          const validationErrors = this.validateStudentData(
            studentData,
            rowIndex
          );
          if (validationErrors.length > 0) {
            result.errors.push(...validationErrors);
            continue;
          }

          // Check for duplicates
          const existingStudents = await studentService.getAllStudents();
          const isDuplicate = existingStudents.some(
            (student) =>
              student.name.toLowerCase() === studentData.name.toLowerCase()
          );

          if (isDuplicate) {
            result.duplicates.push(studentData.name);
            continue;
          }

          // Create student
          await studentService.createStudent({
            name: studentData.name,
            age: studentData.age,
            gender: studentData.gender,
            classId: classId,
          });

          result.successfulImports++;
        } catch (error) {
          result.errors.push({
            row: rowIndex,
            field: "general",
            value: "",
            message:
              error instanceof Error ? error.message : "Unknown error occurred",
          });
        }
      }

      result.success =
        result.errors.length === 0 || result.successfulImports > 0;
      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        400,
        `Failed to process Excel file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  createHeaderMap(
    headers: string[],
    requiredColumns: string[]
  ): Record<string, number> {
    const headerMap: Record<string, number> = {};

    headers.forEach((header, index) => {
      const normalizedHeader = header.toString().toLowerCase().trim();
      requiredColumns.forEach((column) => {
        if (
          normalizedHeader === column ||
          normalizedHeader === column.replace("_", " ") ||
          normalizedHeader.includes(column)
        ) {
          headerMap[column] = index;
        }
      });
    });

    return headerMap;
  },

  extractStudentData(
    row: any[],
    headerMap: Record<string, number>,
    rowIndex: number
  ): {
    name: string;
    age: number;
    gender: string;
  } {
    const name = row[headerMap.name]?.toString().trim() || "";
    const ageValue = row[headerMap.age];
    const gender = row[headerMap.gender]?.toString().toLowerCase().trim() || "";

    // Parse age
    let age: number;
    if (typeof ageValue === "number") {
      age = ageValue;
    } else if (typeof ageValue === "string") {
      age = Number.parseInt(ageValue.trim());
    } else {
      throw new Error(`Invalid age value at row ${rowIndex}`);
    }

    return { name, age, gender };
  },

  validateStudentData(
    data: { name: string; age: number; gender: string },
    rowIndex: number
  ): ImportError[] {
    const errors: ImportError[] = [];

    // Validate name
    if (!data.name || data.name.length < 2) {
      errors.push({
        row: rowIndex,
        field: "name",
        value: data.name,
        message: "Name is required and must be at least 2 characters long",
      });
    }

    // Validate age
    if (isNaN(data.age) || data.age < 1 || data.age > 100) {
      errors.push({
        row: rowIndex,
        field: "age",
        value: data.age,
        message: "Age must be a valid number between 1 and 100",
      });
    }

    // Validate gender
    if (!["male", "female"].includes(data.gender)) {
      errors.push({
        row: rowIndex,
        field: "gender",
        value: data.gender,
        message: 'Gender must be either "male" or "female"',
      });
    }

    return errors;
  },
};
