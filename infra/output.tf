# DNS

output "identity_zone_name_servers" {
  value = aws_route53_zone.identity.name_servers
}

# API Gateway Keys

output "api_key-dummy" {
  value = aws_api_gateway_api_key.dummy.value
}
