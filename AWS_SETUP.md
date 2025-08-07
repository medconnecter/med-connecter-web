# AWS Deployment Setup Guide

This guide explains how to set up secure AWS deployment using GitHub Secrets without storing sensitive information in your codebase.

## 🔒 Security Best Practices

- ✅ **No secrets in code**: All sensitive data stored in GitHub Secrets
- ✅ **Environment-specific configs**: Different values for different environments
- ✅ **Least privilege access**: IAM roles with minimal required permissions
- ✅ **Secure task definitions**: Placeholder values replaced at runtime

## 📋 Required GitHub Secrets

Set these secrets in your GitHub repository:

### **AWS Credentials**
```
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

### **AWS Resources**
```
AWS_REGION=us-east-1
ECR_REPOSITORY=med-connecter-web
ECS_SERVICE=med-connecter-web-service
ECS_CLUSTER=med-connecter-web-cluster
CONTAINER_NAME=med-connecter-web
```

### **Optional: Environment-Specific**
```
AWS_ACCOUNT_ID=123456789012
```

## 🛠️ How to Set GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the exact name and value

## 🚀 AWS Resources Setup

### 1. Create ECR Repository
```bash
aws ecr create-repository \
  --repository-name med-connecter-web \
  --region us-east-1
```

### 2. Create ECS Cluster
```bash
aws ecs create-cluster \
  --cluster-name med-connecter-web-cluster \
  --region us-east-1
```

### 3. Create IAM Roles

#### Execution Role
```bash
aws iam create-role \
  --role-name ecsTaskExecutionRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "ecs-tasks.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }'

aws iam attach-role-policy \
  --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

#### Task Role (if needed)
```bash
aws iam create-role \
  --role-name ecsTaskRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "ecs-tasks.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }'
```

### 4. Create ECS Service
```bash
aws ecs create-service \
  --cluster med-connecter-web-cluster \
  --service-name med-connecter-web-service \
  --task-definition med-connecter-web:1 \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

## 🔧 IAM User for GitHub Actions

Create an IAM user with these minimal permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:DescribeServices",
        "ecs:DescribeTaskDefinition",
        "ecs:RegisterTaskDefinition",
        "ecs:UpdateService"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🧪 Testing the Setup

1. **Push to main branch** - Triggers deployment
2. **Check GitHub Actions** - Monitor the workflow
3. **Verify ECR** - Check if image was pushed
4. **Check ECS** - Verify service is running

## 🔍 Troubleshooting

### Common Issues

1. **Permission Denied**: Check IAM user permissions
2. **Repository Not Found**: Verify ECR repository exists
3. **Service Not Found**: Check ECS service name
4. **Task Definition Error**: Verify JSON format

### Debug Commands

```bash
# Check ECR repository
aws ecr describe-repositories --region us-east-1

# Check ECS cluster
aws ecs describe-clusters --cluster med-connecter-web-cluster

# Check ECS service
aws ecs describe-services \
  --cluster med-connecter-web-cluster \
  --services med-connecter-web-service
```

## 📝 Environment Variables

The workflow uses these environment variables with fallbacks:

- `AWS_REGION`: Defaults to `us-east-1`
- `ECR_REPOSITORY`: Defaults to `med-connecter-web`
- `ECS_SERVICE`: Defaults to `med-connecter-web-service`
- `ECS_CLUSTER`: Defaults to `med-connecter-web-cluster`
- `CONTAINER_NAME`: Defaults to `med-connecter-web`

## 🔐 Security Notes

- Never commit AWS credentials to your repository
- Use IAM roles with minimal required permissions
- Regularly rotate access keys
- Monitor AWS CloudTrail for access logs
- Use AWS Secrets Manager for additional secrets if needed

## 📚 Additional Resources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [AWS ECR Documentation](https://docs.aws.amazon.com/ecr/)
- [GitHub Actions AWS Examples](https://github.com/aws-actions) 