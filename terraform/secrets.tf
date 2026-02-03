# Generate random JWT secret if not provided
resource "random_password" "jwt_secret" {
  count   = var.jwt_secret == "" ? 1 : 0
  length  = 64
  special = true
}

# JWT Secret
resource "aws_secretsmanager_secret" "jwt_secret" {
  name                    = "${var.project_name}/jwt-secret-${var.environment}"
  description             = "JWT signing secret for authentication"
  recovery_window_in_days = 7

  tags = {
    Name = "${var.project_name}-jwt-secret"
  }
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id = aws_secretsmanager_secret.jwt_secret.id
  secret_string = var.jwt_secret != "" ? var.jwt_secret : (
    length(random_password.jwt_secret) > 0 ? random_password.jwt_secret[0].result : ""
  )
}

# reCAPTCHA Secret
resource "aws_secretsmanager_secret" "recaptcha_secret" {
  name                    = "${var.project_name}/recaptcha-secret-${var.environment}"
  description             = "Google reCAPTCHA secret key"
  recovery_window_in_days = 7

  tags = {
    Name = "${var.project_name}-recaptcha-secret"
  }
}

resource "aws_secretsmanager_secret_version" "recaptcha_secret" {
  secret_id     = aws_secretsmanager_secret.recaptcha_secret.id
  secret_string = var.recaptcha_secret_key != "" ? var.recaptcha_secret_key : "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
}

# Admin credentials (hashed password stored in DynamoDB via Lambda init)
resource "aws_secretsmanager_secret" "admin_credentials" {
  name                    = "${var.project_name}/admin-credentials-${var.environment}"
  description             = "Admin user credentials"
  recovery_window_in_days = 7

  tags = {
    Name = "${var.project_name}-admin-credentials"
  }
}

resource "aws_secretsmanager_secret_version" "admin_credentials" {
  secret_id = aws_secretsmanager_secret.admin_credentials.id
  secret_string = jsonencode({
    email    = var.admin_email
    password = var.admin_password != "" ? var.admin_password : "forge2024"
  })
}

# Outputs
output "jwt_secret_arn" {
  description = "JWT secret ARN"
  value       = aws_secretsmanager_secret.jwt_secret.arn
}

output "recaptcha_secret_arn" {
  description = "reCAPTCHA secret ARN"
  value       = aws_secretsmanager_secret.recaptcha_secret.arn
}

output "admin_credentials_arn" {
  description = "Admin credentials secret ARN"
  value       = aws_secretsmanager_secret.admin_credentials.arn
}
