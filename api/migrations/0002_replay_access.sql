-- AlterTable
ALTER TABLE "organizations" ADD COLUMN "replayEnabled" BOOLEAN;
ALTER TABLE "organizations" ADD COLUMN "replaySessionsLimit" INTEGER;

