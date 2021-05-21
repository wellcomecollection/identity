resource "aws_cloudfront_distribution" "swagger_ui_v1" {
  enabled         = true
  is_ipv6_enabled = true

  aliases = [
    local.identity_v1_docs_hostname
  ]

  origin {
    origin_id   = "origin-bucket=${aws_s3_bucket.swagger_ui_v1.id}"
    domain_name = "${aws_s3_bucket.swagger_ui_v1.bucket}.${aws_s3_bucket.swagger_ui_v1.website_domain}"

    custom_origin_config {
      origin_protocol_policy = "http-only"
      http_port              = 80
      https_port             = 443
      origin_ssl_protocols   = ["TLSv1.2", "TLSv1.1", "TLSv1"]
    }
  }

  default_root_object = "index.html"

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.swagger_ui_v1.id
    ssl_support_method  = "sni-only"
  }

  default_cache_behavior {
    allowed_methods  = ["HEAD", "GET"]
    cached_methods   = ["HEAD", "GET"]
    target_origin_id = "origin-bucket=${aws_s3_bucket.swagger_ui_v1.id}"

    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    default_ttl = 0
    min_ttl     = 0
    max_ttl     = 0

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  price_class = "PriceClass_100" # USA and Europe

  tags = {
    "Name" = local.identity_v1_docs_hostname
  }
}
