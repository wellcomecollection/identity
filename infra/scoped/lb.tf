resource "aws_lb" "account_management_system" {
  name               = "identity-ams-${terraform.workspace}"
  load_balancer_type = "application"

  subnets = [
    aws_subnet.public_1.id,
    aws_subnet.public_2.id,
    aws_subnet.public_3.id
  ]

  security_groups = [
    aws_security_group.local.id,
    aws_security_group.load_balancer.id
  ]

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-ams-${terraform.workspace}"
    }
  )
}

resource "aws_lb_listener" "account_management_system-http" {
  load_balancer_arn = aws_lb.account_management_system.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "account_management_system-https" {
  load_balancer_arn = aws_lb.account_management_system.arn
  port              = 443
  protocol          = "HTTPS"

  certificate_arn = aws_acm_certificate.account_management_system.arn
  ssl_policy      = "ELBSecurityPolicy-2016-08"

  default_action {
    target_group_arn = aws_alb_target_group.account_management_system.arn
    type             = "forward"
  }
}

resource "aws_alb_target_group" "account_management_system" {
  name        = "identity-ams-${terraform.workspace}"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"
  protocol    = "HTTP"
  port        = 80

  tags = merge(
    local.common_tags,
    {
      "Name" = "identity-ams-${terraform.workspace}"
    }
  )
}
