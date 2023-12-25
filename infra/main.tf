terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }

  backend "s3" {
    region = "ap-southeast-2"
  }
}

locals {
  repo_owner = "sobil"
  repo_name  = "chess"
}

data "aws_caller_identity" "aws" {}
resource "aws_s3_bucket" "project_bucket" {
  bucket = "${local.repo_name}-static-${data.aws_caller_identity.aws.account_id}"
}
//Limit cloudfront to access the bucket
resource "aws_s3_bucket_policy" "project_bucket_policy" {
  bucket = aws_s3_bucket.project_bucket.id

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": {
        "Sid": "AllowCloudFrontServicePrincipalReadOnly",
        "Effect": "Allow",
        "Principal": {
            "Service": "cloudfront.amazonaws.com"
        },
        "Action": "s3:GetObject",
        "Resource": "${aws_s3_bucket.project_bucket.arn}/*",
        "Condition": {
            "StringEquals": {
                "AWS:SourceArn": "${aws_cloudfront_distribution.project_distribution.arn}"
            }
        }
    }
}
EOF
}


resource "aws_cloudfront_distribution" "project_distribution" {
  origin {
    domain_name              = aws_s3_bucket.project_bucket.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.project_bucket.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.project_origin_access_control.id
  }
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    target_origin_id = "S3-${aws_s3_bucket.project_bucket.id}"

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

resource "aws_cloudfront_origin_access_control" "project_origin_access_control" {
  signing_behavior                  = "always"
  name                              = "Default Origin Access Control"
  signing_protocol                  = "sigv4"
  origin_access_control_origin_type = "s3"
}

resource "aws_cloudfront_origin_access_identity" "project_origin_access_identity" {
  comment = "Default Origin Access Identity"
}

resource "aws_iam_role" "github_deployments_role" {
  name               = "gh_deploy_role_${local.repo_name}"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement":
    [
        {
            "Sid": "",
            "Effect": "Allow",
            "Principal": {
                "Federated": "arn:aws:iam::680324340095:oidc-provider/token.actions.githubusercontent.com"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringLike": {
                    "token.actions.githubusercontent.com:sub": "repo:${local.repo_owner}/${local.repo_name}:*"
                },
                "ForAllValues:StringEquals": {
                    "token.actions.githubusercontent.com:iss": "https://token.actions.githubusercontent.com",
                    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
                }
            }
        }
    ]
}
EOF
}

resource "aws_iam_policy" "github_deployments_policy" {
  name = "${local.repo_name}_deployments_policy"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:*"
      ],
      "Effect": "Allow",
      "Resource": [
        "${aws_s3_bucket.project_bucket.arn}",
        "${aws_s3_bucket.project_bucket.arn}/*"
      ]
    },
    {
      "Action": [
        "cloudfront:*"
      ],
      "Effect": "Allow",
      "Resource": "*"
    },
    {
      "Action": [
        "iam:*Role*",
        "iam:*Policy*"
      ],
      "Effect": "Allow",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:DescribeTable",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/terraform-state-*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:*"
      ],
      "Resource": [
        "arn:aws:s3:::terraform-state-*/*",
        "arn:aws:s3:::terraform-state-*"
      ]
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "github_deployments_policy_attachment" {
  role       = aws_iam_role.github_deployments_role.name
  policy_arn = aws_iam_policy.github_deployments_policy.arn
}


output "website_url" {
  value = "https://${aws_cloudfront_distribution.project_distribution.domain_name}"
}
