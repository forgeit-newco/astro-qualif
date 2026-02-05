import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { randomUUID } from 'crypto';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const sesClient = new SESClient({});

const DYNAMODB_TABLE = process.env.DYNAMODB_TABLE;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// URL du logo Forge IT (hébergé sur CloudFront)
const LOGO_URL = "https://qualif.forgeit.fr/assets/logo-forgeit.png";

// Maturity levels for next steps
const MATURITY_LEVELS = [
  'Pas encore à l\'agenda',
  'En réflexion / POC prévu',
  'On a un Backstage ou une solution maison',
  'On cherche à scaler /industrialiser',
];

// Default email templates (empty - user will provide content via admin UI)
const DEFAULT_TEMPLATES = {
  'Productivité & Delivery': {
    constat: '',
    solution: '',
    nextSteps: {
      'Pas encore à l\'agenda': '',
      'En réflexion / POC prévu': '',
      'On a un Backstage ou une solution maison': '',
      'On cherche à scaler /industrialiser': '',
    },
  },
  'Onboarding & Rétention': {
    constat: '',
    solution: '',
    nextSteps: {
      'Pas encore à l\'agenda': '',
      'En réflexion / POC prévu': '',
      'On a un Backstage ou une solution maison': '',
      'On cherche à scaler /industrialiser': '',
    },
  },
  'Qualité & Conformité': {
    constat: '',
    solution: '',
    nextSteps: {
      'Pas encore à l\'agenda': '',
      'En réflexion / POC prévu': '',
      'On a un Backstage ou une solution maison': '',
      'On cherche à scaler /industrialiser': '',
    },
  },
  'Standardisation': {
    constat: '',
    solution: '',
    nextSteps: {
      'Pas encore à l\'agenda': '',
      'En réflexion / POC prévu': '',
      'On a un Backstage ou une solution maison': '',
      'On cherche à scaler /industrialiser': '',
    },
  },
  'Visibilité sur les releases': {
    constat: '',
    solution: '',
    nextSteps: {
      'Pas encore à l\'agenda': '',
      'En réflexion / POC prévu': '',
      'On a un Backstage ou une solution maison': '',
      'On cherche à scaler /industrialiser': '',
    },
  },
  'Maîtrise des coûts cloud': {
    constat: '',
    solution: '',
    nextSteps: {
      'Pas encore à l\'agenda': '',
      'En réflexion / POC prévu': '',
      'On a un Backstage ou une solution maison': '',
      'On cherche à scaler /industrialiser': '',
    },
  },
};

function corsHeaders(origin = '*') {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
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

// Format prospect data as HTML email
function formatProspectEmail(prospect) {
  const {
    identity,
    techEcosystem,
    diagnostic,
    challenges,
    status,
    createdAt,
  } = prospect;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { background-color: #29624D; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .section { background-color: #f8f9fa; padding: 15px; margin-bottom: 15px; border-radius: 5px; border-left: 4px solid #67E083; }
    .section-title { color: #29624D; font-weight: bold; font-size: 16px; margin-bottom: 10px; }
    .info-row { display: flex; padding: 8px 0; border-bottom: 1px solid #dee2e6; }
    .info-label { font-weight: bold; min-width: 180px; color: #29624D; }
    .info-value { flex: 1; }
    .chip { display: inline-block; background-color: #e9ecef; padding: 4px 12px; margin: 2px; border-radius: 12px; font-size: 13px; }
    .badge { display: inline-block; padding: 6px 12px; border-radius: 4px; font-weight: bold; }
    .badge-nouveau { background-color: #67E083; color: white; }
    .footer { text-align: center; color: #6c757d; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0;">🎯 Nouveau Prospect Astrolabe</h1>
    <p style="margin: 5px 0 0 0; opacity: 0.9;">Une nouvelle qualification prospect a été soumise</p>
  </div>

  <!-- Section Identité -->
  <div class="section">
    <div class="section-title">👤 Identité</div>
    <div class="info-row">
      <div class="info-label">Nom complet :</div>
      <div class="info-value">${identity.firstName} ${identity.lastName}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Email :</div>
      <div class="info-value"><a href="mailto:${identity.email}">${identity.email}</a></div>
    </div>
    <div class="info-row">
      <div class="info-label">Téléphone :</div>
      <div class="info-value">${identity.phone}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Entreprise :</div>
      <div class="info-value">${identity.company}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Poste :</div>
      <div class="info-value">${identity.position}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Statut :</div>
      <div class="info-value"><span class="badge badge-nouveau">${status}</span></div>
    </div>
  </div>

  <!-- Section Écosystème Tech -->
  <div class="section">
    <div class="section-title">🔧 Écosystème Tech</div>
    <div class="info-row">
      <div class="info-label">Taille d'équipe :</div>
      <div class="info-value"><span class="chip">${techEcosystem.teamSize}</span></div>
    </div>
    <div class="info-row">
      <div class="info-label">Forges :</div>
      <div class="info-value">
        ${techEcosystem.forges.map(f => `<span class="chip">${f}</span>`).join(' ')}
      </div>
    </div>
    <div class="info-row">
      <div class="info-label">Cloud :</div>
      <div class="info-value">
        ${techEcosystem.clouds.map(c => `<span class="chip">${c}</span>`).join(' ')}
      </div>
    </div>
    <div class="info-row">
      <div class="info-label">Déploiement :</div>
      <div class="info-value">
        ${techEcosystem.deployments.map(d => `<span class="chip">${d}</span>`).join(' ')}
      </div>
    </div>
    <div class="info-row">
      <div class="info-label">Gestion de tickets :</div>
      <div class="info-value">
        ${techEcosystem.ticketManagers.map(t => `<span class="chip">${t}</span>`).join(' ')}
      </div>
    </div>
    <div class="info-row">
      <div class="info-label">Monitoring :</div>
      <div class="info-value">
        ${techEcosystem.monitoringTools.map(m => `<span class="chip">${m}</span>`).join(' ')}
      </div>
    </div>
  </div>

  <!-- Section Diagnostic -->
  <div class="section">
    <div class="section-title">📊 Diagnostic</div>
    <div class="info-row">
      <div class="info-label">Niveau de maturité :</div>
      <div class="info-value"><strong>${diagnostic.maturityLevel}</strong></div>
    </div>
  </div>

  <!-- Section Enjeux Prioritaires -->
  <div class="section">
    <div class="section-title">🎯 Enjeux Prioritaires</div>
    <div class="info-value">
      <span class="chip">${challenges.priorities}</span>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p><strong>Date de création :</strong> ${new Date(createdAt).toLocaleString('fr-FR')}</p>
    <p>Cet email a été généré automatiquement par le système de qualification Astrolabe.</p>
    <p style="color: #29624D; font-weight: bold;">Forge IT - Platform Engineering Excellence</p>
  </div>
</body>
</html>
  `.trim();
}

// Send email notification
async function sendProspectNotification(prospect) {
  if (!ADMIN_EMAIL) {
    console.warn('ADMIN_EMAIL not configured, skipping email notification');
    return;
  }

  const emailParams = {
    Source: ADMIN_EMAIL, // Must be verified in SES
    Destination: {
      ToAddresses: [ADMIN_EMAIL],
    },
    Message: {
      Subject: {
        Data: `🎯 Nouveau Prospect: ${prospect.identity.firstName} ${prospect.identity.lastName} - ${prospect.identity.company}`,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: formatProspectEmail(prospect),
          Charset: 'UTF-8',
        },
      },
    },
  };

  try {
    const command = new SendEmailCommand(emailParams);
    await sesClient.send(command);
    console.log(`Email notification sent successfully to ${ADMIN_EMAIL}`);
  } catch (error) {
    console.error('Failed to send email notification:', error);
    // Don't throw - we don't want email failures to block prospect creation
  }
}

// Format text with HTML escaping, line breaks, and basic markdown
function formatText(str) {
  if (!str) return '';

  // 1. HTML escaping
  let formatted = str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // 2. Convert **text** to <strong>text</strong> (markdown bold)
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // 3. Convert line breaks to <br>
  formatted = formatted.replace(/\n/g, '<br>');

  return formatted;
}

// Generate challenge-specific content for email
function generateChallengeContent(prospect, templates) {
  if (!prospect.challenges?.priorities || !templates) {
    return '';
  }

  const challenge = prospect.challenges.priorities;

  // Handle "Autre: ..." custom challenges - no personalization
  if (challenge.startsWith('Autre:')) {
    return '';
  }

  const template = templates[challenge];
  if (!template) {
    return '';
  }

  // Get the appropriate nextSteps based on maturity level
  const maturityLevel = prospect.diagnostic?.maturityLevel || '';
  const nextStepsText = template.nextSteps?.[maturityLevel] || '';

  // Check if we have any content to display
  if (!template.constat && !template.solution && !nextStepsText) {
    return '';
  }

  return `
    <div class="challenge-section">
      ${template.constat ? `
        <div class="challenge-block-constat">
          <h3>Le constat</h3>
          <p>${formatText(template.constat)}</p>
        </div>
      ` : ''}
      ${template.solution ? `
        <div class="challenge-block-solution">
          <h3>Ce qu'Astrolabe apporte</h3>
          <p>${formatText(template.solution)}</p>
        </div>
      ` : ''}
      ${nextStepsText ? `
        <div class="challenge-block-next-steps">
          <h3>Prochaines étapes</h3>
          <p>${formatText(nextStepsText)}</p>
        </div>
      ` : ''}
    </div>
  `;
}

// Format client welcome email
function formatWelcomeEmail(prospect, templates = null) {
  const { identity } = prospect;

  // Generate challenge-specific content
  const challengeContent = generateChallengeContent(prospect, templates);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F1F7F7; }
    .container { background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background-color: #0A2222; color: white; padding: 40px 30px; text-align: center; }
    .logo { max-width: 200px; height: auto; margin-bottom: 20px; }
    .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
    .content { padding: 40px 30px; }
    .greeting { color: #29624D; font-size: 20px; font-weight: bold; margin-bottom: 20px; }
    .message { color: #333; font-size: 16px; line-height: 1.8; margin-bottom: 20px; }
    .highlight { color: #29624D; font-weight: bold; }
    .challenge-section { margin: 30px 0; }
    .challenge-block-constat {
      background-color: #FFF5F0;
      border-left: 4px solid #FF8C42;
      padding: 20px;
      margin-bottom: 15px;
      border-radius: 8px;
    }
    .challenge-block-constat h3 {
      color: #FF8C42;
      font-size: 16px;
      font-weight: bold;
      margin: 0 0 10px 0;
    }
    .challenge-block-constat p {
      margin: 0;
      line-height: 1.6;
      color: #333;
    }
    .challenge-block-solution {
      background-color: #F1F7F7;
      border-left: 4px solid #29624D;
      padding: 20px;
      margin-bottom: 15px;
      border-radius: 8px;
    }
    .challenge-block-solution h3 {
      color: #29624D;
      font-size: 16px;
      font-weight: bold;
      margin: 0 0 10px 0;
    }
    .challenge-block-solution p {
      margin: 0;
      line-height: 1.6;
      color: #333;
    }
    .challenge-block-next-steps {
      background-color: #F1F7F7;
      border-left: 4px solid #67E083;
      padding: 20px;
      margin: 30px 0;
      border-radius: 8px;
    }
    .challenge-block-next-steps h3 {
      color: #29624D;
      font-size: 16px;
      font-weight: bold;
      margin: 0 0 10px 0;
    }
    .challenge-block-next-steps p {
      margin: 0;
      line-height: 1.6;
      color: #333;
      font-size: 15px;
    }
    .cta-box { background-color: #F1F7F7; border-left: 4px solid #67E083; border-radius: 8px; padding: 20px; margin: 30px 0; }
    .cta-box p { margin: 0; color: #29624D; font-size: 15px; }
    .contact { background-color: #F1F7F7; border-radius: 8px; padding: 20px; margin-top: 30px; text-align: center; }
    .contact p { margin: 5px 0; color: #29624D; }
    .contact a { color: #67E083; text-decoration: none; font-weight: bold; }
    .footer { text-align: center; color: #6c757d; font-size: 12px; padding: 20px 30px; border-top: 1px solid #dee2e6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${LOGO_URL}" alt="Forge IT" class="logo" />
      <h1>Bienvenue chez Forge IT</h1>
    </div>

    <div class="content">
      <div class="greeting">
        Bonjour ${identity.firstName} ${identity.lastName},
      </div>

      <div class="message">
        Nous vous remercions sincèrement pour votre intérêt envers <span class="highlight">Astrolabe</span>, notre solution de Platform Engineering.
      </div>

      ${challengeContent ? `
        <div class="message">
          Retrouvez ci dessous la solution à votre contexte et vos en-jeux.
        </div>

        <!-- Personalized challenge content -->
        ${challengeContent}
      ` : `
        <div class="message">
          Votre demande a bien été reçue et nous avons pris connaissance de vos besoins. Notre équipe d'experts va étudier votre profil et reviendra vers vous très prochainement pour enclencher la suite de notre collaboration.
        </div>

        <div class="cta-box">
          <p>💡 <strong>Prochaines étapes :</strong> Un de nos experts Platform Engineering vous contactera sous peu pour échanger sur votre projet et vos enjeux de maturité DevOps.</p>
        </div>
      `}

      <div class="message">
        En attendant, si vous avez des questions ou souhaitez obtenir plus d'informations, n'hésitez pas à nous contacter directement.
      </div>

      <div class="contact">
        <p><strong>Nous contacter :</strong></p>
        <p><a href="mailto:${ADMIN_EMAIL}">${ADMIN_EMAIL}</a></p>
      </div>
    </div>

    <div class="footer">
      <p style="color: #29624D; font-weight: bold;">Forge IT - Platform Engineering Excellence</p>
      <p>Cet email a été généré automatiquement suite à votre demande de qualification.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Send welcome email to client
async function sendWelcomeEmail(prospect) {
  const clientEmail = prospect.identity?.email;

  if (!clientEmail) {
    console.warn('Client email not found, skipping welcome email');
    return;
  }

  if (!ADMIN_EMAIL) {
    console.warn('ADMIN_EMAIL not configured, skipping welcome email');
    return;
  }

  // Fetch templates configuration
  let templates = null;
  try {
    const config = await getEmailTemplateConfig();
    templates = config.templates;
  } catch (error) {
    console.error('Failed to fetch email templates:', error);
    // Continue without personalization
  }

  const emailParams = {
    Source: ADMIN_EMAIL,
    Destination: {
      ToAddresses: [clientEmail],
    },
    Message: {
      Subject: {
        Data: `Bienvenue chez Forge IT`,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: formatWelcomeEmail(prospect, templates),
          Charset: 'UTF-8',
        },
      },
    },
  };

  try {
    const command = new SendEmailCommand(emailParams);
    await sesClient.send(command);
    console.log(`Welcome email sent successfully to ${clientEmail}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    // Don't throw - we don't want email failures to block prospect creation
  }
}

// === EMAIL TEMPLATE CONFIGURATION ===

// Normalize key to handle apostrophe variations
function normalizeKey(key) {
  // Replace different apostrophe characters with standard one
  return key
    .replace(/'/g, "'")  // Replace right single quotation mark
    .replace(/`/g, "'")  // Replace backtick
    .replace(/'/g, "'"); // Replace left single quotation mark
}

// Migrate old nextSteps format (string) to new format (object by maturity level)
function migrateNextStepsFormat(templates) {
  const migratedTemplates = {};

  for (const [challenge, template] of Object.entries(templates)) {
    migratedTemplates[challenge] = {
      constat: template.constat || '',
      solution: template.solution || '',
      nextSteps: {},
    };

    // Check if nextSteps is old format (string) or new format (object)
    if (typeof template.nextSteps === 'string') {
      // Old format: migrate by placing the old text in all maturity levels
      // This preserves the user's data
      console.log(`[Migration] ${challenge}: Old format (string) detected, migrating to object`);
      MATURITY_LEVELS.forEach(level => {
        migratedTemplates[challenge].nextSteps[level] = template.nextSteps;
      });
    } else if (typeof template.nextSteps === 'object' && template.nextSteps !== null) {
      // Already new format - normalize keys and consolidate
      const normalizedNextSteps = {};

      console.log(`[Migration] ${challenge}: Object format detected. Keys:`, Object.keys(template.nextSteps));

      // First, try to find values for each expected maturity level
      MATURITY_LEVELS.forEach(expectedLevel => {
        const normalizedExpected = normalizeKey(expectedLevel);
        let found = false;

        // Look for matching keys (exact or normalized)
        for (const [existingKey, value] of Object.entries(template.nextSteps)) {
          const normalizedExisting = normalizeKey(existingKey);
          console.log(`[Migration] Comparing "${existingKey}" (normalized: "${normalizedExisting}") with "${expectedLevel}" (normalized: "${normalizedExpected}")`);
          if (normalizedExisting === normalizedExpected || existingKey === expectedLevel) {
            normalizedNextSteps[expectedLevel] = value || '';
            console.log(`[Migration] ✓ Match found for "${expectedLevel}": value length = ${(value || '').length}`);
            found = true;
            break;
          }
        }

        // If not found, use empty string
        if (!found) {
          console.log(`[Migration] ✗ No match found for "${expectedLevel}", using empty string`);
          normalizedNextSteps[expectedLevel] = '';
        }
      });

      migratedTemplates[challenge].nextSteps = normalizedNextSteps;
    } else {
      // Missing or invalid: use default empty object
      console.log(`[Migration] ${challenge}: Invalid or missing nextSteps, using defaults`);
      MATURITY_LEVELS.forEach(level => {
        migratedTemplates[challenge].nextSteps[level] = '';
      });
    }
  }

  return migratedTemplates;
}

// GET /config/email-templates - Get email template configuration
async function getEmailTemplateConfig() {
  const command = new GetCommand({
    TableName: DYNAMODB_TABLE,
    Key: {
      PK: 'CONFIG#email_templates',
      SK: 'METADATA',
    },
  });

  const result = await docClient.send(command);

  if (!result.Item) {
    // Return default empty templates
    return {
      PK: 'CONFIG#email_templates',
      SK: 'METADATA',
      version: '1.0',
      templates: DEFAULT_TEMPLATES,
      updatedAt: null,
      updatedBy: null,
    };
  }

  // Migrate templates if needed
  const migratedTemplates = migrateNextStepsFormat(result.Item.templates);

  return {
    ...result.Item,
    templates: migratedTemplates,
  };
}

// PUT /config/email-templates - Update email template configuration
async function updateEmailTemplateConfig(data, userEmail) {
  const now = new Date().toISOString();

  // Normalize templates before saving to ensure consistent keys
  const normalizedTemplates = migrateNextStepsFormat(data.templates);

  const config = {
    PK: 'CONFIG#email_templates',
    SK: 'METADATA',
    version: '1.0',
    templates: normalizedTemplates,
    updatedAt: now,
    updatedBy: userEmail || 'unknown',
  };

  const command = new PutCommand({
    TableName: DYNAMODB_TABLE,
    Item: config,
  });

  await docClient.send(command);
  return config;
}

// === PROSPECT CRUD ===

// GET /prospects - List all prospects
async function listProspects() {
  const command = new ScanCommand({
    TableName: DYNAMODB_TABLE,
    FilterExpression: 'begins_with(PK, :pk)',
    ExpressionAttributeValues: {
      ':pk': 'PROSPECT#',
    },
  });

  const result = await docClient.send(command);
  return result.Items || [];
}

// GET /prospects/:id - Get single prospect
async function getProspect(id) {
  const command = new GetCommand({
    TableName: DYNAMODB_TABLE,
    Key: {
      PK: `PROSPECT#${id}`,
      SK: 'METADATA',
    },
  });

  const result = await docClient.send(command);

  if (!result.Item) {
    throw new Error('Prospect not found');
  }

  return result.Item;
}

// POST /prospects - Create prospect
async function createProspect(data) {
  const id = randomUUID();
  const now = new Date().toISOString();

  const prospect = {
    PK: `PROSPECT#${id}`,
    SK: 'METADATA',
    id,
    ...data,
    status: data.status || 'Nouveau',
    createdAt: now,
    updatedAt: now,
  };

  // Create email index entry if email provided
  if (data.email) {
    prospect.email = data.email;
  }

  const command = new PutCommand({
    TableName: DYNAMODB_TABLE,
    Item: prospect,
  });

  await docClient.send(command);

  // Send email notification to admin
  await sendProspectNotification(prospect);

  // Send welcome email to client
  await sendWelcomeEmail(prospect);

  return prospect;
}

// PATCH /prospects/:id - Update prospect
async function updateProspect(id, updates) {
  const now = new Date().toISOString();

  // Build update expression dynamically
  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  Object.keys(updates).forEach((key, index) => {
    if (key !== 'id' && key !== 'PK' && key !== 'SK' && key !== 'createdAt') {
      const placeholder = `#attr${index}`;
      const valuePlaceholder = `:val${index}`;

      updateExpressions.push(`${placeholder} = ${valuePlaceholder}`);
      expressionAttributeNames[placeholder] = key;
      expressionAttributeValues[valuePlaceholder] = updates[key];
    }
  });

  // Always update updatedAt
  updateExpressions.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = now;

  const command = new UpdateCommand({
    TableName: DYNAMODB_TABLE,
    Key: {
      PK: `PROSPECT#${id}`,
      SK: 'METADATA',
    },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  });

  const result = await docClient.send(command);
  return result.Attributes;
}

// DELETE /prospects/:id - Delete prospect
async function deleteProspect(id) {
  const command = new DeleteCommand({
    TableName: DYNAMODB_TABLE,
    Key: {
      PK: `PROSPECT#${id}`,
      SK: 'METADATA',
    },
  });

  await docClient.send(command);
}

export async function handler(event) {
  console.log('Event:', JSON.stringify(event, null, 2));

  const origin = event.headers?.origin || '*';

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return response(200, {}, origin);
  }

  try {
    const { httpMethod, pathParameters, body } = event;
    const id = pathParameters?.id;
    const path = event.path || event.rawPath || '';

    // Handle config endpoints
    if (path.includes('/config/email-templates')) {
      switch (httpMethod) {
        case 'GET':
          const config = await getEmailTemplateConfig();
          return response(200, config, origin);

        case 'PUT':
          const updateData = JSON.parse(body || '{}');
          const userEmail = event.requestContext?.authorizer?.email || 'admin';
          const updatedConfig = await updateEmailTemplateConfig(updateData, userEmail);
          return response(200, updatedConfig, origin);

        default:
          return response(405, { error: 'Method not allowed' }, origin);
      }
    }

    // Handle prospect endpoints
    switch (httpMethod) {
      case 'GET':
        if (id) {
          const prospect = await getProspect(id);
          return response(200, prospect, origin);
        } else {
          const prospects = await listProspects();
          return response(200, prospects, origin);
        }

      case 'POST':
        const createData = JSON.parse(body || '{}');
        const newProspect = await createProspect(createData);
        return response(201, newProspect, origin);

      case 'PATCH':
      case 'PUT':
        if (!id) {
          return response(400, { error: 'Prospect ID is required' }, origin);
        }
        const updateData = JSON.parse(body || '{}');
        const updatedProspect = await updateProspect(id, updateData);
        return response(200, updatedProspect, origin);

      case 'DELETE':
        if (!id) {
          return response(400, { error: 'Prospect ID is required' }, origin);
        }
        await deleteProspect(id);
        return response(204, null, origin);

      default:
        return response(405, { error: 'Method not allowed' }, origin);
    }
  } catch (error) {
    console.error('Error:', error);

    if (error.message === 'Prospect not found') {
      return response(404, { error: error.message }, origin);
    }

    return response(500, { error: 'Internal server error', message: error.message }, origin);
  }
}
