# Main outputs file

output "summary" {
  description = "Deployment summary"
  value = {
    frontend_url         = var.domain_name != "" ? "https://${var.domain_name}" : "https://${aws_cloudfront_distribution.frontend.domain_name}"
    api_url              = aws_api_gateway_stage.main.invoke_url
    environment          = var.environment
    region               = var.aws_region
    dynamodb_table       = aws_dynamodb_table.astro_qualif.name
    cloudfront_distribution = aws_cloudfront_distribution.frontend.id
  }
}

output "environment_variables" {
  description = "Environment variables for frontend"
  value = {
    VITE_API_URL              = aws_api_gateway_stage.main.invoke_url
    VITE_RECAPTCHA_SITE_KEY   = var.recaptcha_site_key
  }
}

output "deployment_commands" {
  description = "Commands for deployment"
  value = {
    upload_frontend        = "aws s3 sync dist/ s3://${aws_s3_bucket.frontend.id}/"
    invalidate_cloudfront  = "aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.frontend.id} --paths '/*'"
    view_logs_auth         = "aws logs tail /aws/lambda/${aws_lambda_function.auth.function_name} --follow"
    view_logs_crud         = "aws logs tail /aws/lambda/${aws_lambda_function.crud.function_name} --follow"
  }
}
