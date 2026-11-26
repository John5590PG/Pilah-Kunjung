-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('OPERATING', 'PAUSED', 'CLOSED', 'UNCONFIRMED');

-- CreateEnum
CREATE TYPE "SourceRole" AS ENUM ('MANAGER', 'COORDINATOR');

-- CreateEnum
CREATE TYPE "ContactMode" AS ENUM ('CALL', 'VISIT');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('COORDINATOR', 'ADVISOR', 'ADMIN');

-- CreateTable
CREATE TABLE "SubDistrict" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubDistrict_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "subDistrictId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kelurahan" TEXT,
    "managerContact" TEXT,
    "currentStatus" "UnitStatus" NOT NULL DEFAULT 'UNCONFIRMED',
    "lastSignalAt" TIMESTAMP(3),
    "lastVisitedAt" TIMESTAMP(3),
    "isSynthetic" BOOLEAN NOT NULL DEFAULT true,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitToken" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "UnitToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportingCycle" (
    "id" TEXT NOT NULL,
    "periodLabel" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL,
    "cutoffAt" TIMESTAMP(3) NOT NULL,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportingCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckinSignal" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "reportedStatus" "UnitStatus" NOT NULL,
    "sourceRole" "SourceRole" NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "undoneAt" TIMESTAMP(3),
    "previousStatus" "UnitStatus",
    "previousLastSignalAt" TIMESTAMP(3),

    CONSTRAINT "CheckinSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "subDistrictId" TEXT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitConfirmation" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "coordinatorId" TEXT NOT NULL,
    "contactMode" "ContactMode" NOT NULL,
    "verifiedStatus" "UnitStatus" NOT NULL,
    "actionNote" TEXT,
    "verifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisitConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageDraft" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "messageText" TEXT NOT NULL,
    "sentById" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RankingSetting" (
    "id" TEXT NOT NULL,
    "subDistrictId" TEXT NOT NULL,
    "wSilent" INTEGER NOT NULL DEFAULT 2,
    "wUnconfirmed" INTEGER NOT NULL DEFAULT 3,
    "wPaused" INTEGER NOT NULL DEFAULT 2,
    "cutoffDays" INTEGER NOT NULL DEFAULT 7,

    CONSTRAINT "RankingSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Unit_subDistrictId_idx" ON "Unit"("subDistrictId");

-- CreateIndex
CREATE INDEX "Unit_currentStatus_idx" ON "Unit"("currentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "UnitToken_tokenHash_key" ON "UnitToken"("tokenHash");

-- CreateIndex
CREATE INDEX "UnitToken_unitId_idx" ON "UnitToken"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportingCycle_periodLabel_key" ON "ReportingCycle"("periodLabel");

-- CreateIndex
CREATE INDEX "ReportingCycle_openedAt_idx" ON "ReportingCycle"("openedAt");

-- CreateIndex
CREATE INDEX "CheckinSignal_unitId_cycleId_idx" ON "CheckinSignal"("unitId", "cycleId");

-- CreateIndex
CREATE INDEX "CheckinSignal_cycleId_idx" ON "CheckinSignal"("cycleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_subDistrictId_idx" ON "User"("subDistrictId");

-- CreateIndex
CREATE INDEX "VisitConfirmation_unitId_verifiedAt_idx" ON "VisitConfirmation"("unitId", "verifiedAt");

-- CreateIndex
CREATE INDEX "MessageDraft_unitId_idx" ON "MessageDraft"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageDraft_cycleId_unitId_key" ON "MessageDraft"("cycleId", "unitId");

-- CreateIndex
CREATE UNIQUE INDEX "RankingSetting_subDistrictId_key" ON "RankingSetting"("subDistrictId");

-- CreateIndex
CREATE INDEX "AuditLog_at_idx" ON "AuditLog"("at");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_subDistrictId_fkey" FOREIGN KEY ("subDistrictId") REFERENCES "SubDistrict"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitToken" ADD CONSTRAINT "UnitToken_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckinSignal" ADD CONSTRAINT "CheckinSignal_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckinSignal" ADD CONSTRAINT "CheckinSignal_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "ReportingCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_subDistrictId_fkey" FOREIGN KEY ("subDistrictId") REFERENCES "SubDistrict"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitConfirmation" ADD CONSTRAINT "VisitConfirmation_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitConfirmation" ADD CONSTRAINT "VisitConfirmation_coordinatorId_fkey" FOREIGN KEY ("coordinatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageDraft" ADD CONSTRAINT "MessageDraft_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "ReportingCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageDraft" ADD CONSTRAINT "MessageDraft_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageDraft" ADD CONSTRAINT "MessageDraft_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingSetting" ADD CONSTRAINT "RankingSetting_subDistrictId_fkey" FOREIGN KEY ("subDistrictId") REFERENCES "SubDistrict"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

