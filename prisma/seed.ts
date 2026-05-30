// prisma/seed.ts
/* eslint-disable */

import 'dotenv/config';

import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';

import { PrismaPg } from '@prisma/adapter-pg';

import {
  Currency,
  Priority,
  PrismaClient,
  Stage,
  UserRole,
} from '../src/generated/prisma/client';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const usersSeed = [
  {
    email: 'admin@apiux.test',
    firstName: 'Admin',
    lastName: 'Labs',
    password: 'Admin123!',
    role: UserRole.ADMIN,
  },
  {
    email: 'sales@apiux.test',
    firstName: 'Sales',
    lastName: 'Rep',
    password: 'Sales123!',
    role: UserRole.SALES,
  },
  {
    email: 'viewer@apiux.test',
    firstName: 'Viewer',
    lastName: 'User',
    password: 'View123!',
    role: UserRole.VIEWER,
  },
];

async function main(): Promise<void> {
  console.log('🌱 Starting database seed...');

  await prisma.$transaction(async (tx) => {
    console.log('🧼 Cleaning existing demo data...');

    await tx.aiConversation.deleteMany();
    await tx.opportunity.deleteMany();
    await tx.user.deleteMany();

    console.log('👥 Creating demo users...');

    const createdUsers: Record<string, string> = {};

    for (const userData of usersSeed) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await tx.user.create({
        data: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          password: hashedPassword,
          role: userData.role,
        },
      });

      createdUsers[userData.firstName] = user.id;

      console.log(`✅ User created: ${user.email}`);
    }

    const defaultSalesId =
      createdUsers['Sales'] ?? createdUsers['Admin'];

    const defaultAdminId = createdUsers['Admin'];

    const opportunitiesData = [
      {
        companyName: 'Banco Andino',
        contactName: 'Laura Pérez',
        contactEmail: 'laura.perez@bancoandino.com',
        opportunityName: 'Asistente IA para atención interna',
        description:
          'Implementación de un asistente de IA para consultas internas sobre políticas, procesos y documentos.',
        estimatedValue: 85000,
        currency: Currency.USD,
        stage: Stage.DIAGNOSTICO,
        priority: Priority.ALTA,
        probability: 65,
        ownerId: defaultSalesId,
        nextFollowUpDate: new Date('2026-06-05'),
        lastInteractionSummary:
          'Cliente solicitó revisar alcance técnico y modelo de seguridad.',
        aiRecommendation:
          'Priorizar levantamiento de restricciones de datos y arquitectura cloud/local.',
      },
      {
        companyName: 'Retail Nova',
        contactName: 'Carlos Ríos',
        contactEmail: 'carlos.rios@retailnova.com',
        opportunityName:
          'Automatización de seguimiento comercial con IA',
        description:
          'Sistema para registrar oportunidades, generar recordatorios y sugerir acciones comerciales.',
        estimatedValue: 42000,
        currency: Currency.USD,
        stage: Stage.PROPUESTA_ENVIADA,
        priority: Priority.MEDIA,
        probability: 55,
        ownerId: defaultSalesId,
        nextFollowUpDate: new Date('2026-06-10'),
        lastInteractionSummary:
          'Se envió propuesta inicial y se espera feedback del área de innovación.',
        aiRecommendation:
          'Enviar caso de uso comparable y reforzar beneficios de eficiencia.',
      },
      {
        companyName: 'Minería Horizonte',
        contactName: 'Patricia Gómez',
        contactEmail: 'patricia.gomez@mhorizonte.com',
        opportunityName:
          'Modelo predictivo de mantenimiento',
        description:
          'Proyecto de IA para predecir fallas de maquinaria crítica utilizando datos históricos.',
        estimatedValue: 120000,
        currency: Currency.USD,
        stage: Stage.NEGOCIACION,
        priority: Priority.CRITICA,
        probability: 80,
        ownerId: defaultAdminId,
        nextFollowUpDate: new Date('2026-06-02'),
        lastInteractionSummary:
          'Cliente validó alcance técnico y solicitó propuesta económica final.',
        aiRecommendation:
          'Acelerar cierre comercial y preparar plan de implementación inicial.',
      },
      {
        companyName: 'Salud Integral',
        contactName: 'Andrés Molina',
        contactEmail: 'andres.molina@saludintegral.com',
        opportunityName: 'Chatbot clínico interno',
        description:
          'Asistente conversacional para soporte interno del personal médico y administrativo.',
        estimatedValue: 65000,
        currency: Currency.USD,
        stage: Stage.CONTACTADO,
        priority: Priority.ALTA,
        probability: 40,
        ownerId: defaultSalesId,
        nextFollowUpDate: new Date('2026-06-07'),
        lastInteractionSummary:
          'Cliente interesado en capacidades de seguridad y compliance.',
        aiRecommendation:
          'Enviar arquitectura híbrida y enfoque de protección de datos.',
      },
      {
        companyName: 'Logística Global',
        contactName: 'María Fernández',
        contactEmail: 'maria.fernandez@logisticaglobal.com',
        opportunityName:
          'Optimización logística con IA',
        description:
          'Sistema de análisis y recomendación de rutas utilizando modelos de optimización.',
        estimatedValue: 98000,
        currency: Currency.USD,
        stage: Stage.LEAD_NUEVO,
        priority: Priority.MEDIA,
        probability: 25,
        ownerId: defaultSalesId,
        nextFollowUpDate: new Date('2026-06-12'),
        lastInteractionSummary:
          'Se realizó reunión inicial con el área de operaciones.',
        aiRecommendation:
          'Profundizar en requerimientos de integración y fuentes de datos disponibles.',
      },
    ];

    console.log('💼 Creating opportunities...');

    for (const opportunity of opportunitiesData) {
      await tx.opportunity.create({
        data: opportunity,
      });
    }
  });

  console.log('🚀 Database seed completed successfully.');
}

main()
  .catch((error: unknown) => {
    console.error('❌ Seed execution failed:', error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
