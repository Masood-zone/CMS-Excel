/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Settings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Class` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Reference` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Class" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "supervisorId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Class_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Class" ("description", "id", "name", "supervisorId") SELECT "description", "id", "name", "supervisorId" FROM "Class";
DROP TABLE "Class";
ALTER TABLE "new_Class" RENAME TO "Class";
CREATE UNIQUE INDEX "Class_name_key" ON "Class"("name");
CREATE UNIQUE INDEX "Class_supervisorId_key" ON "Class"("supervisorId");
CREATE INDEX "Class_supervisorId_idx" ON "Class"("supervisorId");
CREATE TABLE "new_Expense" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "referenceId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "submitedBy" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Expense_referenceId_fkey" FOREIGN KEY ("referenceId") REFERENCES "Reference" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Expense" ("amount", "date", "description", "id", "referenceId", "submitedBy") SELECT "amount", "date", "description", "id", "referenceId", "submitedBy" FROM "Expense";
DROP TABLE "Expense";
ALTER TABLE "new_Expense" RENAME TO "Expense";
CREATE INDEX "Expense_referenceId_idx" ON "Expense"("referenceId");
CREATE INDEX "Expense_submitedBy_idx" ON "Expense"("submitedBy");
CREATE INDEX "Expense_date_idx" ON "Expense"("date");
CREATE TABLE "new_OtpCodes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "OtpCodes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_OtpCodes" ("code", "createdAt", "expiresAt", "id", "userId") SELECT "code", "createdAt", "expiresAt", "id", "userId" FROM "OtpCodes";
DROP TABLE "OtpCodes";
ALTER TABLE "new_OtpCodes" RENAME TO "OtpCodes";
CREATE INDEX "OtpCodes_userId_idx" ON "OtpCodes"("userId");
CREATE INDEX "OtpCodes_code_idx" ON "OtpCodes"("code");
CREATE TABLE "new_Record" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" INTEGER NOT NULL,
    "submitedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitedBy" INTEGER NOT NULL,
    "payedBy" INTEGER,
    "isPrepaid" BOOLEAN NOT NULL DEFAULT false,
    "hasPaid" BOOLEAN NOT NULL DEFAULT false,
    "isAbsent" BOOLEAN NOT NULL DEFAULT false,
    "settingsAmount" INTEGER,
    "classId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Record_submitedBy_fkey" FOREIGN KEY ("submitedBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Record_payedBy_fkey" FOREIGN KEY ("payedBy") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Record_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Record" ("amount", "classId", "hasPaid", "id", "isAbsent", "isPrepaid", "payedBy", "settingsAmount", "submitedAt", "submitedBy") SELECT "amount", "classId", "hasPaid", "id", "isAbsent", "isPrepaid", "payedBy", "settingsAmount", "submitedAt", "submitedBy" FROM "Record";
DROP TABLE "Record";
ALTER TABLE "new_Record" RENAME TO "Record";
CREATE INDEX "Record_submitedBy_idx" ON "Record"("submitedBy");
CREATE INDEX "Record_payedBy_idx" ON "Record"("payedBy");
CREATE INDEX "Record_classId_idx" ON "Record"("classId");
CREATE INDEX "Record_submitedAt_idx" ON "Record"("submitedAt");
CREATE UNIQUE INDEX "Record_payedBy_submitedAt_key" ON "Record"("payedBy", "submitedAt");
CREATE TABLE "new_Reference" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Reference" ("description", "id", "name") SELECT "description", "id", "name" FROM "Reference";
DROP TABLE "Reference";
ALTER TABLE "new_Reference" RENAME TO "Reference";
CREATE UNIQUE INDEX "Reference_id_key" ON "Reference"("id");
CREATE TABLE "new_Student" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "parentPhone" TEXT,
    "gender" TEXT,
    "classId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Student" ("age", "classId", "gender", "id", "name", "parentPhone") SELECT "age", "classId", "gender", "id", "name", "parentPhone" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE INDEX "Student_classId_idx" ON "Student"("classId");
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "gender" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("email", "gender", "id", "name", "password", "phone", "role") SELECT "email", "gender", "id", "name", "password", "phone", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Settings_name_key" ON "Settings"("name");
