import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';

// Check if the DATABASE_URL environment variable is set, throw an error if not
const connectionString = process.env.DATABASE_URL;

// Initialize the Prisma client with the PostgreSQL adapter and the connection string
if (!connectionString) {
	throw new Error('DATABASE_URL is not configured');
}

// Create a new instance of the PrismaPg adapter with the connection string
const adapter = new PrismaPg({ connectionString });

// Create a new instance of the PrismaClient using the PostgreSQL adapter
export const prisma = new PrismaClient({ adapter });
