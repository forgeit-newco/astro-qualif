# DynamoDB table - Single table design
resource "aws_dynamodb_table" "astro_qualif" {
  name         = "${var.project_name}-db-${var.environment}"
  billing_mode = "PAY_PER_REQUEST" # On-Demand pricing (0$ when unused)

  hash_key  = "PK"
  range_key = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  # GSI pour filtrer les prospects par statut (Kanban columns)
  global_secondary_index {
    name            = "StatusIndex"
    hash_key        = "status"
    range_key       = "SK"
    projection_type = "ALL"
  }

  # GSI pour recherche par email
  global_secondary_index {
    name            = "EmailIndex"
    hash_key        = "email"
    range_key       = "SK"
    projection_type = "ALL"
  }

  # Point-in-time recovery (backup automatique)
  point_in_time_recovery {
    enabled = true
  }

  # Server-side encryption
  server_side_encryption {
    enabled = true
  }

  # TTL pour auto-suppression (optionnel)
  ttl {
    attribute_name = "expiresAt"
    enabled        = false
  }

  tags = {
    Name = "${var.project_name}-db"
  }
}

# Output pour référence
output "dynamodb_table_name" {
  description = "DynamoDB table name"
  value       = aws_dynamodb_table.astro_qualif.name
}

output "dynamodb_table_arn" {
  description = "DynamoDB table ARN"
  value       = aws_dynamodb_table.astro_qualif.arn
}
