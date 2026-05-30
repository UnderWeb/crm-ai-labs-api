-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('LEAD_NUEVO', 'CONTACTADO', 'DIAGNOSTICO', 'PROPUESTA_ENVIADA', 'NEGOCIACION', 'GANADO', 'PERDIDO');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'CRITICA');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'COP', 'CLP', 'UF', 'EUR');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'SALES', 'VIEWER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunities" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "contact_name" TEXT NOT NULL,
    "contact_email" VARCHAR(320) NOT NULL,
    "opportunity_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedValue" DECIMAL(14,2) NOT NULL,
    "currency" "Currency" NOT NULL,
    "stage" "Stage" NOT NULL DEFAULT 'LEAD_NUEVO',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIA',
    "probability" INTEGER NOT NULL,
    "owner_id" TEXT NOT NULL,
    "next_follow_up_date" TIMESTAMP(3) NOT NULL,
    "last_interaction_summary" TEXT,
    "ai_recommendation" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "message" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "toolsUsed" TEXT[],
    "sources" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "opportunities_stage_idx" ON "opportunities"("stage");

-- CreateIndex
CREATE INDEX "opportunities_priority_idx" ON "opportunities"("priority");

-- CreateIndex
CREATE INDEX "opportunities_owner_id_idx" ON "opportunities"("owner_id");

-- CreateIndex
CREATE INDEX "opportunities_next_follow_up_date_idx" ON "opportunities"("next_follow_up_date");

-- CreateIndex
CREATE INDEX "opportunities_estimatedValue_idx" ON "opportunities"("estimatedValue");

-- CreateIndex
CREATE INDEX "opportunities_contact_email_idx" ON "opportunities"("contact_email");

-- CreateIndex
CREATE INDEX "ai_conversations_userId_idx" ON "ai_conversations"("userId");

-- CreateIndex
CREATE INDEX "ai_conversations_createdAt_idx" ON "ai_conversations"("createdAt");

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
