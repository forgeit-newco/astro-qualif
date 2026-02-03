#!/usr/bin/env node

/**
 * Script to initialize admin user in DynamoDB
 *
 * Usage:
 *   node scripts/init-admin-user.js <table-name> <email> <password>
 *
 * Example:
 *   node scripts/init-admin-user.js astro-qualif-db-production admin@example.com forge2024
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';

const [,, tableName, email, password] = process.argv;

if (!tableName || !email || !password) {
  console.error('Usage: node init-admin-user.js <table-name> <email> <password>');
  process.exit(1);
}

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

async function createAdminUser() {
  try {
    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    console.log(`Creating admin user: ${email}`);

    const command = new PutCommand({
      TableName: tableName,
      Item: {
        PK: `USER#${email}`,
        SK: 'PROFILE',
        email,
        passwordHash,
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
    });

    await docClient.send(command);

    console.log('Admin user created successfully!');
    console.log({
      email,
      role: 'admin',
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
