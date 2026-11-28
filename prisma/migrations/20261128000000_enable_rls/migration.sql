-- Enable Row Level Security on all tables in public so Supabase PostgREST
-- (anon / authenticated roles) cannot read or mutate Prisma-managed tables.
-- Prisma connects as the postgres role (bypassrls), so server routes keep working.
ALTER TABLE "public"."SubDistrict" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Unit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."UnitToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ReportingCycle" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."CheckinSignal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."VisitConfirmation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."MessageDraft" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."RankingSetting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."AuditLog" ENABLE ROW LEVEL SECURITY;
