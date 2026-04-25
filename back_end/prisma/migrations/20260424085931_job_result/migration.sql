-- CreateTable
CREATE TABLE "JobResult" (
    "jobId" TEXT NOT NULL,
    "products" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobResult_pkey" PRIMARY KEY ("jobId")
);
