output "public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.portfolio.public_ip
}

output "portfolio_url" {
  description = "URL to access the portfolio site"
  value       = "http://${aws_instance.portfolio.public_ip}"
}
