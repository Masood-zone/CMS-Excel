-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    CONSTRAINT "Record_submitedBy_fkey" FOREIGN KEY ("submitedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Record_payedBy_fkey" FOREIGN KEY ("payedBy") REFERENCES "Student" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Record_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Record" ("amount", "classId", "hasPaid", "id", "isAbsent", "isPrepaid", "payedBy", "settingsAmount", "submitedAt", "submitedBy") SELECT "amount", "classId", "hasPaid", "id", "isAbsent", "isPrepaid", "payedBy", "settingsAmount", "submitedAt", "submitedBy" FROM "Record";
DROP TABLE "Record";
ALTER TABLE "new_Record" RENAME TO "Record";
CREATE INDEX "Record_submitedBy_idx" ON "Record"("submitedBy");
CREATE INDEX "Record_payedBy_idx" ON "Record"("payedBy");
CREATE INDEX "Record_classId_idx" ON "Record"("classId");
CREATE UNIQUE INDEX "Record_payedBy_submitedAt_key" ON "Record"("payedBy", "submitedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
