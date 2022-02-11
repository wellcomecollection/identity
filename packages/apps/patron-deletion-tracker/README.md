# Patron deletion tracker

This Lambda checks for Patrons in Sierra that were deleted on the previous day, and then removes them from Auth0 if they exist there.

It is triggered by a CloudWatch Event configured in [`/infra`](https://github.com/wellcomecollection/identity/blob/main/infra/scoped/cloudwatch.tf).
