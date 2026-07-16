-- Migration: Add TestSet model and update TestQuestion/TestAttempt
CREATE TABLE IF NOT EXISTS "TestSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "year" INTEGER,
    "month" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TestSet_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "TestSet" ADD CONSTRAINT "TestSet_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TestCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TestQuestion" ADD COLUMN IF NOT EXISTS "setId" TEXT;
ALTER TABLE "TestQuestion" ADD CONSTRAINT "TestQuestion_setId_fkey" FOREIGN KEY ("setId") REFERENCES "TestSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TestAttempt" ADD COLUMN IF NOT EXISTS "setId" TEXT;
ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_setId_fkey" FOREIGN KEY ("setId") REFERENCES "TestSet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
