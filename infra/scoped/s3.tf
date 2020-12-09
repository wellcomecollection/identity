# Public Facing Assets

resource "aws_s3_bucket" "assets" {
  bucket = "identity-public-assets-${terraform.workspace}"
  acl    = "private"

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-public-assets-${terraform.workspace}"
    }
  )
}

resource "aws_s3_bucket_object" "assets_images_wellcomecollections-150x50-png" {
  bucket = aws_s3_bucket.assets.bucket
  key    = "images/wellcomecollections-150x50.png"
  source = "${path.module}/assets/images/wellcomecollections-150x50.png"
  etag   = filemd5("${path.module}/assets/images/wellcomecollections-150x50.png")
  acl    = "public-read"

  tags = merge(
    local.common_tags,
    {
      "Name" = "images/wellcomecollections-150x50.png"
    }
  )
}

# Public Facing Swagger UI

resource "aws_s3_bucket" "swagger_ui_v1" {
  bucket = "identity-public-swagger-ui-v1-${terraform.workspace}"
  acl    = "public-read"
  policy = data.aws_iam_policy_document.s3_swagger_ui_policy_v1.json

  website {
    index_document = "index.html"
    error_document = "error.html"
  }

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-public-swagger-ui-v1-${terraform.workspace}"
    }
  )
}

resource "aws_s3_bucket_object" "swagger_ui-favicon-16x16_png" {
  bucket       = aws_s3_bucket.swagger_ui_v1.bucket
  key          = "favicon-16x16.png"
  source       = "${path.module}/assets/swagger-ui/favicon-16x16.png"
  etag         = filemd5("${path.module}/assets/swagger-ui/favicon-16x16.png")
  acl          = "public-read"
  content_type = "image/png"
}

resource "aws_s3_bucket_object" "swagger_ui-favicon-32x32_png" {
  bucket       = aws_s3_bucket.swagger_ui_v1.bucket
  key          = "favicon-32x32.png"
  source       = "${path.module}/assets/swagger-ui/favicon-32x32.png"
  etag         = filemd5("${path.module}/assets/swagger-ui/favicon-32x32.png")
  acl          = "public-read"
  content_type = "image/png"
}

resource "aws_s3_bucket_object" "swagger_ui-index_html" {
  bucket       = aws_s3_bucket.swagger_ui_v1.bucket
  key          = "index.html"
  source       = "${path.module}/assets/swagger-ui/index.html"
  etag         = filemd5("${path.module}/assets/swagger-ui/index.html")
  acl          = "public-read"
  content_type = "text/html"
}

resource "aws_s3_bucket_object" "swagger_ui-oauth2-redirect_html" {
  bucket       = aws_s3_bucket.swagger_ui_v1.bucket
  key          = "oauth2-redirect.html"
  source       = "${path.module}/assets/swagger-ui/oauth2-redirect.html"
  etag         = filemd5("${path.module}/assets/swagger-ui/oauth2-redirect.html")
  acl          = "public-read"
  content_type = "text/html"
}

resource "aws_s3_bucket_object" "swagger_ui-swagger-ui_css" {
  bucket       = aws_s3_bucket.swagger_ui_v1.bucket
  key          = "swagger-ui.css"
  source       = "${path.module}/assets/swagger-ui/swagger-ui.css"
  etag         = filemd5("${path.module}/assets/swagger-ui/swagger-ui.css")
  acl          = "public-read"
  content_type = "text/css"
}

resource "aws_s3_bucket_object" "swagger_ui-swagger-ui_css_map" {
  bucket       = aws_s3_bucket.swagger_ui_v1.bucket
  key          = "swagger-ui.css.map"
  source       = "${path.module}/assets/swagger-ui/swagger-ui.css.map"
  etag         = filemd5("${path.module}/assets/swagger-ui/swagger-ui.css.map")
  acl          = "public-read"
  content_type = "text/javascript"
}

resource "aws_s3_bucket_object" "swagger_ui-swagger-ui_js" {
  bucket       = aws_s3_bucket.swagger_ui_v1.bucket
  key          = "swagger-ui.js"
  source       = "${path.module}/assets/swagger-ui/swagger-ui.js"
  etag         = filemd5("${path.module}/assets/swagger-ui/swagger-ui.js")
  acl          = "public-read"
  content_type = "text/javascript"
}

resource "aws_s3_bucket_object" "swagger_ui-swagger-ui_js_map" {
  bucket       = aws_s3_bucket.swagger_ui_v1.bucket
  key          = "swagger-ui.js.map"
  source       = "${path.module}/assets/swagger-ui/swagger-ui.js.map"
  etag         = filemd5("${path.module}/assets/swagger-ui/swagger-ui.js.map")
  acl          = "public-read"
  content_type = "text/javascript"
}

resource "aws_s3_bucket_object" "swagger_ui-swagger-ui-bundle_js" {
  bucket       = aws_s3_bucket.swagger_ui_v1.bucket
  key          = "swagger-ui-bundle.js"
  source       = "${path.module}/assets/swagger-ui/swagger-ui-bundle.js"
  etag         = filemd5("${path.module}/assets/swagger-ui/swagger-ui-bundle.js")
  acl          = "public-read"
  content_type = "text/javascript"
}

resource "aws_s3_bucket_object" "swagger_ui-swagger-ui-bundle_js_map" {
  bucket       = aws_s3_bucket.swagger_ui_v1.bucket
  key          = "swagger-ui-bundle.js.map"
  source       = "${path.module}/assets/swagger-ui/swagger-ui-bundle.js.map"
  etag         = filemd5("${path.module}/assets/swagger-ui/swagger-ui-bundle.js.map")
  acl          = "public-read"
  content_type = "text/javascript"
}

resource "aws_s3_bucket_object" "swagger_ui-swagger-ui-es-bundle_js" {
  bucket       = aws_s3_bucket.swagger_ui_v1.bucket
  key          = "swagger-ui-es-bundle.js"
  source       = "${path.module}/assets/swagger-ui/swagger-ui-es-bundle.js"
  etag         = filemd5("${path.module}/assets/swagger-ui/swagger-ui-es-bundle.js")
  acl          = "public-read"
  content_type = "text/javascript"
}

resource "aws_s3_bucket_object" "swagger_ui-swagger-ui-es-bundle_js_map" {
  bucket       = aws_s3_bucket.swagger_ui_v1.bucket
  key          = "swagger-ui-es-bundle.js.map"
  source       = "${path.module}/assets/swagger-ui/swagger-ui-es-bundle.js.map"
  etag         = filemd5("${path.module}/assets/swagger-ui/swagger-ui-es-bundle.js.map")
  acl          = "public-read"
  content_type = "text/javascript"
}

resource "aws_s3_bucket_object" "swagger_ui-swagger-ui-es-bundle-core_js" {
  bucket       = aws_s3_bucket.swagger_ui_v1.bucket
  key          = "swagger-ui-es-bundle-core.js"
  source       = "${path.module}/assets/swagger-ui/swagger-ui-es-bundle-core.js"
  etag         = filemd5("${path.module}/assets/swagger-ui/swagger-ui-es-bundle-core.js")
  acl          = "public-read"
  content_type = "text/javascript"
}

resource "aws_s3_bucket_object" "swagger_ui-swagger-ui-es-bundle-core_js_map" {
  bucket       = aws_s3_bucket.swagger_ui_v1.bucket
  key          = "swagger-ui-es-bundle-core.js.map"
  source       = "${path.module}/assets/swagger-ui/swagger-ui-es-bundle-core.js.map"
  etag         = filemd5("${path.module}/assets/swagger-ui/swagger-ui-es-bundle-core.js.map")
  acl          = "public-read"
  content_type = "text/javascript"
}

resource "aws_s3_bucket_object" "swagger_ui_v1-swagger-ui-standalone-preset_js" {
  bucket       = aws_s3_bucket.swagger_ui_v1.bucket
  key          = "swagger-ui-standalone-preset.js"
  source       = "${path.module}/assets/swagger-ui/swagger-ui-standalone-preset.js"
  etag         = filemd5("${path.module}/assets/swagger-ui/swagger-ui-standalone-preset.js")
  acl          = "public-read"
  content_type = "text/javascript"
}

resource "aws_s3_bucket_object" "swagger_ui-swagger-ui-standalone-preset_js_map" {
  bucket       = aws_s3_bucket.swagger_ui_v1.bucket
  key          = "swagger-ui-standalone-preset.js.map"
  source       = "${path.module}/assets/swagger-ui/swagger-ui-standalone-preset.js.map"
  etag         = filemd5("${path.module}/assets/swagger-ui/swagger-ui-standalone-preset.js.map")
  acl          = "public-read"
  content_type = "text/javascript"
}
