variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type (t2.micro is free-tier eligible)"
  type        = string
  default     = "t2.micro"
}

variable "repo_url" {
  description = "Git repository URL to clone and build"
  type        = string
  default     = "https://github.com/MyNameIs-Nigel/nextjs-portfolio.git"
}

variable "app_port" {
  description = "Port the Next.js app listens on"
  type        = number
  default     = 3000
}
