.PHONY: help install-lambda build-lambda deploy-lambda deploy-frontend deploy-all init-admin terraform-init terraform-plan terraform-apply terraform-destroy clean

# Default target
help:
	@echo "Available targets:"
	@echo "  install-lambda      - Install Lambda dependencies"
	@echo "  build-lambda        - Build Lambda ZIP packages"
	@echo "  deploy-lambda       - Deploy Lambda functions to AWS"
	@echo "  deploy-frontend     - Build and deploy frontend to S3/CloudFront"
	@echo "  deploy-all          - Deploy both Lambda and frontend"
	@echo "  init-admin          - Initialize admin user in DynamoDB"
	@echo "  terraform-init      - Initialize Terraform"
	@echo "  terraform-plan      - Plan Terraform changes"
	@echo "  terraform-apply     - Apply Terraform changes"
	@echo "  terraform-destroy   - Destroy all infrastructure"
	@echo "  clean               - Clean build artifacts"

# Lambda targets
install-lambda:
	@echo "Installing Lambda dependencies..."
	@for lambda_dir in lambda/auth lambda/authorizer lambda/crud lambda/recaptcha; do \
		if [ ! -f "$$lambda_dir/yarn.lock" ]; then touch "$$lambda_dir/yarn.lock"; fi; \
	done
	(cd lambda/auth && NPM_TOKEN=dummy yarn install)
	(cd lambda/authorizer && NPM_TOKEN=dummy yarn install)
	(cd lambda/crud && NPM_TOKEN=dummy yarn install)
	(cd lambda/recaptcha && NPM_TOKEN=dummy yarn install)
	@echo "Lambda dependencies installed!"

build-lambda: install-lambda
	@echo "Building Lambda packages..."
	cd lambda/auth && zip -r ../auth.zip . -x '*.zip' -x 'node_modules/.cache/*'
	cd lambda/authorizer && zip -r ../authorizer.zip . -x '*.zip' -x 'node_modules/.cache/*'
	cd lambda/crud && zip -r ../crud.zip . -x '*.zip' -x 'node_modules/.cache/*'
	cd lambda/recaptcha && zip -r ../recaptcha.zip . -x '*.zip' -x 'node_modules/.cache/*'
	@echo "Lambda packages built!"

deploy-lambda: build-lambda
	@echo "Deploying Lambda functions..."
	aws lambda update-function-code \
		--function-name astro-qualif-auth-production \
		--zip-file fileb://lambda/auth.zip
	aws lambda update-function-code \
		--function-name astro-qualif-authorizer-production \
		--zip-file fileb://lambda/authorizer.zip
	aws lambda update-function-code \
		--function-name astro-qualif-crud-production \
		--zip-file fileb://lambda/crud.zip
	aws lambda update-function-code \
		--function-name astro-qualif-recaptcha-production \
		--zip-file fileb://lambda/recaptcha.zip
	@echo "Lambda functions deployed!"

# Frontend targets
deploy-frontend:
	@echo "Building frontend..."
	NPM_TOKEN=dummy yarn install
	yarn build
	@echo "Uploading to S3..."
	$(eval S3_BUCKET := $(shell cd terraform && terraform output -raw s3_bucket_name))
	aws s3 sync dist/ s3://$(S3_BUCKET)/ --delete
	@echo "Uploading email assets..."
	aws s3 cp img/logo-forgeit.png s3://$(S3_BUCKET)/assets/logo-forgeit.png
	@echo "Invalidating CloudFront cache..."
	$(eval CLOUDFRONT_ID := $(shell cd terraform && terraform output -raw cloudfront_distribution_id))
	aws cloudfront create-invalidation --distribution-id $(CLOUDFRONT_ID) --paths "/*"
	@echo "Frontend deployed!"

# Combined deployment
deploy-all: deploy-lambda deploy-frontend
	@echo "Full deployment completed!"

# Admin user initialization
init-admin:
	@echo "Initializing admin user..."
	@[ ! -f "scripts/yarn.lock" ] && touch "scripts/yarn.lock" || true
	(cd scripts && NPM_TOKEN=dummy yarn install)
	$(eval TABLE_NAME := $(shell cd terraform && terraform output -raw dynamodb_table_name))
	@read -p "Enter admin email: " email; \
	read -sp "Enter admin password: " password; \
	echo ""; \
	cd scripts && yarn node init-admin-user.js $(TABLE_NAME) $$email $$password

# Terraform targets
terraform-init:
	@echo "Initializing Terraform..."
	cd terraform && terraform init

terraform-plan:
	@echo "Planning Terraform changes..."
	cd terraform && terraform plan -out=tfplan

terraform-apply:
	@echo "Applying Terraform changes..."
	cd terraform && terraform apply tfplan
	@echo "Infrastructure deployed!"
	@echo ""
	@echo "Outputs:"
	@cd terraform && terraform output

terraform-destroy:
	@echo "WARNING: This will destroy all infrastructure!"
	@read -p "Are you sure? (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		echo "Emptying S3 bucket..."; \
		S3_BUCKET=$$(cd terraform && terraform output -raw s3_bucket_name); \
		aws s3 rm s3://$$S3_BUCKET --recursive; \
		echo "Destroying infrastructure..."; \
		cd terraform && terraform destroy; \
	else \
		echo "Aborted."; \
	fi

# Utility targets
clean:
	@echo "Cleaning build artifacts..."
	rm -rf dist/
	rm -f lambda/*.zip
	rm -rf lambda/*/node_modules
	rm -rf scripts/node_modules
	@echo "Cleaned!"

# Development helpers
logs-auth:
	aws logs tail /aws/lambda/astro-qualif-auth-production --follow

logs-crud:
	aws logs tail /aws/lambda/astro-qualif-crud-production --follow

logs-api:
	aws logs tail /aws/apigateway/astro-qualif-production --follow

test-api:
	$(eval API_URL := $(shell cd terraform && terraform output -raw api_gateway_url))
	@echo "Testing API Gateway..."
	curl -X POST $(API_URL)/auth/login \
		-H "Content-Type: application/json" \
		-d '{"email":"admin@example.com","password":"forge2024"}'
