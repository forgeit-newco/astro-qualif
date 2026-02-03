# Archive Lambda source code
data "archive_file" "lambda_auth" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/auth"
  output_path = "${path.module}/../lambda/auth.zip"
  excludes    = ["*.zip", "node_modules/.cache"]
}

data "archive_file" "lambda_authorizer" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/authorizer"
  output_path = "${path.module}/../lambda/authorizer.zip"
  excludes    = ["*.zip", "node_modules/.cache"]
}

data "archive_file" "lambda_crud" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/crud"
  output_path = "${path.module}/../lambda/crud.zip"
  excludes    = ["*.zip", "node_modules/.cache"]
}

data "archive_file" "lambda_recaptcha" {
  type        = "zip"
  source_dir  = "${path.module}/../lambda/recaptcha"
  output_path = "${path.module}/../lambda/recaptcha.zip"
  excludes    = ["*.zip", "node_modules/.cache"]
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "lambda_auth" {
  name              = "/aws/lambda/${var.project_name}-auth-${var.environment}"
  retention_in_days = var.cloudwatch_log_retention_days
}

resource "aws_cloudwatch_log_group" "lambda_authorizer" {
  name              = "/aws/lambda/${var.project_name}-authorizer-${var.environment}"
  retention_in_days = var.cloudwatch_log_retention_days
}

resource "aws_cloudwatch_log_group" "lambda_crud" {
  name              = "/aws/lambda/${var.project_name}-crud-${var.environment}"
  retention_in_days = var.cloudwatch_log_retention_days
}

resource "aws_cloudwatch_log_group" "lambda_recaptcha" {
  name              = "/aws/lambda/${var.project_name}-recaptcha-${var.environment}"
  retention_in_days = var.cloudwatch_log_retention_days
}

# Lambda Function: Auth
resource "aws_lambda_function" "auth" {
  filename         = data.archive_file.lambda_auth.output_path
  function_name    = "${var.project_name}-auth-${var.environment}"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.handler"
  runtime          = var.lambda_runtime
  source_code_hash = data.archive_file.lambda_auth.output_base64sha256
  timeout          = var.lambda_timeout
  memory_size      = var.lambda_memory_size

  environment {
    variables = {
      DYNAMODB_TABLE   = aws_dynamodb_table.astro_qualif.name
      JWT_SECRET_ARN   = aws_secretsmanager_secret.jwt_secret.arn
      NODE_OPTIONS     = "--enable-source-maps"
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.lambda_auth
  ]

  tags = {
    Name = "${var.project_name}-auth-lambda"
  }
}

# Lambda Function: Authorizer
resource "aws_lambda_function" "authorizer" {
  filename         = data.archive_file.lambda_authorizer.output_path
  function_name    = "${var.project_name}-authorizer-${var.environment}"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.handler"
  runtime          = var.lambda_runtime
  source_code_hash = data.archive_file.lambda_authorizer.output_base64sha256
  timeout          = var.lambda_timeout
  memory_size      = 128 # Authorizer needs less memory

  environment {
    variables = {
      JWT_SECRET_ARN = aws_secretsmanager_secret.jwt_secret.arn
      NODE_OPTIONS   = "--enable-source-maps"
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.lambda_authorizer
  ]

  tags = {
    Name = "${var.project_name}-authorizer-lambda"
  }
}

# Lambda Function: CRUD
resource "aws_lambda_function" "crud" {
  filename         = data.archive_file.lambda_crud.output_path
  function_name    = "${var.project_name}-crud-${var.environment}"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.handler"
  runtime          = var.lambda_runtime
  source_code_hash = data.archive_file.lambda_crud.output_base64sha256
  timeout          = var.lambda_timeout
  memory_size      = var.lambda_memory_size

  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.astro_qualif.name
      ADMIN_EMAIL    = var.admin_email
      NODE_OPTIONS   = "--enable-source-maps"
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.lambda_crud
  ]

  tags = {
    Name = "${var.project_name}-crud-lambda"
  }
}

# Lambda Function: reCAPTCHA
resource "aws_lambda_function" "recaptcha" {
  filename         = data.archive_file.lambda_recaptcha.output_path
  function_name    = "${var.project_name}-recaptcha-${var.environment}"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "index.handler"
  runtime          = var.lambda_runtime
  source_code_hash = data.archive_file.lambda_recaptcha.output_base64sha256
  timeout          = var.lambda_timeout
  memory_size      = 128

  environment {
    variables = {
      RECAPTCHA_SECRET_ARN = aws_secretsmanager_secret.recaptcha_secret.arn
      NODE_OPTIONS         = "--enable-source-maps"
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.lambda_recaptcha
  ]

  tags = {
    Name = "${var.project_name}-recaptcha-lambda"
  }
}

# Lambda Permissions for API Gateway
resource "aws_lambda_permission" "auth" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.auth.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "authorizer" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.authorizer.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "crud" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.crud.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "recaptcha" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.recaptcha.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.main.execution_arn}/*/*"
}

# Outputs
output "lambda_auth_arn" {
  description = "Auth Lambda ARN"
  value       = aws_lambda_function.auth.arn
}

output "lambda_authorizer_arn" {
  description = "Authorizer Lambda ARN"
  value       = aws_lambda_function.authorizer.arn
}

output "lambda_crud_arn" {
  description = "CRUD Lambda ARN"
  value       = aws_lambda_function.crud.arn
}

output "lambda_recaptcha_arn" {
  description = "reCAPTCHA Lambda ARN"
  value       = aws_lambda_function.recaptcha.arn
}
