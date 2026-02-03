terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Backend S3 pour state Terraform (optionnel, à configurer après première apply)
  # backend "s3" {
  #   bucket         = "astro-qualif-terraform-state"
  #   key            = "production/terraform.tfstate"
  #   region         = "eu-west-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Application = "astro-qualif"
      Environment = var.environment
      ManagedBy   = "terraform"
      CostCenter  = "POC"
    }
  }
}

# Provider AWS pour CloudFront (us-east-1 obligatoire pour certificats ACM)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Application = "astro-qualif"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
