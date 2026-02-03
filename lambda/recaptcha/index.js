import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const secretsClient = new SecretsManagerClient({});
const RECAPTCHA_SECRET_ARN = process.env.RECAPTCHA_SECRET_ARN;

let recaptchaSecretCache = null;

async function getRecaptchaSecret() {
  if (recaptchaSecretCache) return recaptchaSecretCache;

  const command = new GetSecretValueCommand({ SecretId: RECAPTCHA_SECRET_ARN });
  const response = await secretsClient.send(command);
  recaptchaSecretCache = response.SecretString;
  return recaptchaSecretCache;
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

  const origin = event.headers?.origin || '*';

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return response(200, {}, origin);
  }

  try {
    const { token } = JSON.parse(event.body || '{}');

    if (!token) {
      return response(400, { error: 'reCAPTCHA token is required' }, origin);
    }

    const recaptchaSecret = await getRecaptchaSecret();

    // Verify reCAPTCHA with Google
    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const params = new URLSearchParams({
      secret: recaptchaSecret,
      response: token,
    });

    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      body: params,
    });

    const verifyData = await verifyResponse.json();

    console.log('reCAPTCHA verification result:', verifyData);

    if (verifyData.success) {
      return response(200, {
        success: true,
        score: verifyData.score || null,
        action: verifyData.action || null,
      }, origin);
    } else {
      return response(400, {
        success: false,
        error: 'reCAPTCHA verification failed',
        errorCodes: verifyData['error-codes'] || [],
      }, origin);
    }
  } catch (error) {
    console.error('Error:', error);
    return response(500, {
      error: 'Internal server error',
      message: error.message,
    }, origin);
  }
}
