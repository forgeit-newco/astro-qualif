import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import jwt from 'jsonwebtoken';

const secretsClient = new SecretsManagerClient({});
const JWT_SECRET_ARN = process.env.JWT_SECRET_ARN;

let jwtSecretCache = null;

async function getJwtSecret() {
  if (jwtSecretCache) return jwtSecretCache;

  const command = new GetSecretValueCommand({ SecretId: JWT_SECRET_ARN });
  const response = await secretsClient.send(command);
  jwtSecretCache = response.SecretString;
  return jwtSecretCache;
}

function generatePolicy(principalId, effect, resource, context = {}) {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
    context,
  };
}

export async function handler(event) {
  console.log('Authorizer event:', JSON.stringify(event, null, 2));

  const token = event.authorizationToken?.replace('Bearer ', '');

  if (!token) {
    console.log('No token provided');
    return generatePolicy('unauthorized', 'Deny', event.methodArn);
  }

  try {
    const jwtSecret = await getJwtSecret();
    const decoded = jwt.verify(token, jwtSecret);

    console.log('Token verified for user:', decoded.email);

    // Generate wildcard resource to allow access to all API endpoints
    // Convert: arn:aws:execute-api:region:account:api-id/stage/method/resource
    // To: arn:aws:execute-api:region:account:api-id/stage/*/*
    const arnParts = event.methodArn.split('/');
    const apiGatewayArn = arnParts.slice(0, 2).join('/') + '/*/*';

    return generatePolicy(decoded.email, 'Allow', apiGatewayArn, {
      email: decoded.email,
      role: decoded.role || 'user',
    });
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return generatePolicy('unauthorized', 'Deny', event.methodArn);
  }
}
