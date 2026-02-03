variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "eu-west-3"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "astro-qualif"
}

variable "domain_name" {
  description = "Custom domain name (e.g., qualif.example.com)"
  type        = string
  default     = ""
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID (if using custom domain)"
  type        = string
  default     = ""
}

variable "recaptcha_site_key" {
  description = "Google reCAPTCHA site key (public)"
  type        = string
  default     = "6LeIVFgsAAAAAMT-LniBYSISWF1ZxzNSzkggcMZT" # Test key
}

variable "recaptcha_secret_key" {
  description = "Google reCAPTCHA secret key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "admin_email" {
  description = "Admin user email"
  type        = string
  default     = "admin@example.com"
}

variable "admin_password" {
  description = "Admin user password (will be hashed)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "jwt_secret" {
  description = "JWT signing secret (auto-generated if empty)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "lambda_runtime" {
  description = "Lambda runtime version"
  type        = string
  default     = "nodejs20.x"
}

variable "lambda_memory_size" {
  description = "Lambda memory size in MB"
  type        = number
  default     = 256
}

variable "lambda_timeout" {
  description = "Lambda timeout in seconds"
  type        = number
  default     = 10
}

variable "api_throttle_rate_limit" {
  description = "API Gateway throttle rate limit (req/sec)"
  type        = number
  default     = 100
}

variable "api_throttle_burst_limit" {
  description = "API Gateway throttle burst limit"
  type        = number
  default     = 50
}

variable "cloudwatch_log_retention_days" {
  description = "CloudWatch Logs retention in days"
  type        = number
  default     = 7
}

variable "enable_waf" {
  description = "Enable WAF for CloudFront (adds cost)"
  type        = bool
  default     = false
}

variable "cors_allowed_origins" {
  description = "CORS allowed origins"
  type        = list(string)
  default     = ["*"]
}
