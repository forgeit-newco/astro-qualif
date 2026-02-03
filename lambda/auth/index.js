import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const secretsClient = new SecretsManagerClient({});

const DYNAMODB_TABLE = process.env.DYNAMODB_TABLE;
const JWT_SECRET_ARN = process.env.JWT_SECRET_ARN;

let jwtSecretCache = null;

async function getJwtSecret() {
  if (jwtSecretCache) return jwtSecretCache;

  const command = new GetSecretValueCommand({ SecretId: JWT_SECRET_ARN });
  const response = await secretsClient.send(command);
  jwtSecretCache = response.SecretString;
  return jwtSecretCache;
}

function corsHeaders(origin = '*') {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

function response(statusCode, body, origin = '*') {
  return {
    statusCode,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}

export async function handler(event) {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return response(200, {}, event.headers?.origin || '*');
  }

  try {
    const { email, password } = JSON.parse(event.body || '{}');

    if (!email || !password) {
      return response(400, { error: 'Email and password are required' });
    }

    // 1. Retrieve user from DynamoDB
    const getCommand = new GetCommand({
      TableName: DYNAMODB_TABLE,
      Key: {
        PK: `USER#${email}`,
        SK: 'PROFILE',
      },
    });

    const result = await docClient.send(getCommand);

    if (!result.Item) {
      console.log('User not found:', email);
      return response(401, { error: 'Invalid credentials' });
    }

    const user = result.Item;

    // 2. Verify password with bcrypt
    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      console.log('Invalid password for user:', email);
      return response(401, { error: 'Invalid credentials' });
    }

    // 3. Generate JWT token
    const jwtSecret = await getJwtSecret();
    const token = jwt.sign(
      {
        email: user.email,
        role: user.role || 'user',
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    console.log('Login successful for user:', email);

    return response(200, {
      token,
      user: {
        email: user.email,
        role: user.role || 'user',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
}
