# AWS Setup Guide for Med Connecter Frontend

This guide will help you deploy your React frontend application to AWS ECS using GitHub Actions with a **shared load balancer** approach.

## 🏗️ Architecture Overview

```
Internet → Shared ALB → Path-based Routing
    ↓
/ (root) → Frontend (React App)
/medconnecter/* → Backend (Node.js API)
```

## Prerequisites

1. **AWS CLI configured** with appropriate permissions
2. **GitHub repository** with your React application
3. **Backend already deployed** (shared load balancer must exist)
4. **GitHub Actions secrets** configured (see below)

## Required GitHub Secrets

Add these secrets to your GitHub repository (Settings > Secrets and variables > Actions):

```
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
```

## AWS Resources Created

The setup script will create the following AWS resources:

### 1. ECR Repository
- **Name**: `med-connecter-web`
- **Purpose**: Stores Docker images for your frontend application

### 2. ECS Service (Shared Cluster)
- **Name**: `med-connecter-web-service`
- **Cluster**: `med-connecter-cluster` (shared with backend)
- **Purpose**: Runs your frontend containerized application

### 3. Target Group
- **Name**: `med-connecter-web-tg`
- **Port**: 80
- **Health Check**: `/health` endpoint
- **Purpose**: Routes traffic to frontend containers

### 4. Path-based Routing Rules
- **Frontend**: `/` → Frontend target group
- **Backend**: `/medconnecter/*` → Backend target group
- **Purpose**: Directs traffic based on URL path

### 5. CloudWatch Log Group
- **Name**: `/ecs/med-connecter-web`
- **Purpose**: Stores frontend application logs

### 6. Shared Resources (from backend setup)
- **Load Balancer**: `med-connecter-alb` (shared)
- **ECS Cluster**: `med-connecter-cluster` (shared)
- **IAM Roles**: `ecsTaskExecutionRole-med-connecter` (shared)

## Setup Instructions

### Step 1: Ensure Backend is Deployed

**IMPORTANT**: The backend must be deployed first as the frontend setup depends on the shared load balancer.

```bash
# Verify backend is running
aws ecs describe-services \
  --cluster med-connecter-cluster \
  --services med-connecter-service \
  --query 'services[0].status'
```

### Step 2: Run the Frontend Setup Script

```bash
# Make the script executable
chmod +x scripts/setup-aws-resources-frontend.sh

# Run the setup script
./scripts/setup-aws-resources-frontend.sh
```

This script will:
- Create ECR repository for frontend
- Create target group for frontend
- Configure path-based routing on shared ALB
- Create ECS service for frontend
- Set up logging

### Step 3: Configure Environment Variables

The frontend application will receive these environment variables:

```bash
NODE_ENV=production
REACT_APP_API_URL=http://med-connecter-alb-{ACCOUNT_ID}.{REGION}.elb.amazonaws.com/medconnecter
REACT_APP_ENVIRONMENT=production
```

### Step 4: Deploy via GitHub Actions

1. Push your code to the `main` branch
2. The GitHub Actions workflow will automatically:
   - Build the Docker image
   - Push to ECR
   - Deploy to ECS
   - Update the service

## Application URLs

After deployment, your application will be available at:

- **Frontend**: `http://med-connecter-alb-{ACCOUNT_ID}.{REGION}.elb.amazonaws.com`
- **Backend API**: `http://med-connecter-alb-{ACCOUNT_ID}.{REGION}.elb.amazonaws.com/medconnecter`
- **Frontend Health Check**: `http://med-connecter-alb-{ACCOUNT_ID}.{REGION}.elb.amazonaws.com/health`
- **Backend Health Check**: `http://med-connecter-alb-{ACCOUNT_ID}.{REGION}.elb.amazonaws.com/medconnecter/health`

## Path-based Routing Configuration

### Load Balancer Rules
1. **Priority 1**: `/` → Frontend target group (React app)
2. **Priority 2**: `/medconnecter/*` → Backend target group (API)

### Traffic Flow
```
User visits: http://your-alb.com/
    ↓
ALB Route: / → Frontend Target Group
    ↓
ECS Service: med-connecter-web-service
    ↓
Container: React app (port 80)

User visits: http://your-alb.com/medconnecter/api/users
    ↓
ALB Route: /medconnecter/* → Backend Target Group
    ↓
ECS Service: med-connecter-service
    ↓
Container: Node.js API (port 8080)
```

## Container Configuration

### Frontend Container
- **Base Image**: nginx:alpine
- **Port**: 80
- **Health Check**: `curl -f http://localhost/health`
- **Static Files**: Served from `/usr/share/nginx/html`

### Backend Container
- **Base Image**: Node.js
- **Port**: 8080
- **Health Check**: `/medconnecter/health` endpoint
- **API Routes**: `/medconnecter/*`

## Troubleshooting

### Common Issues

1. **Setup fails with "Shared load balancer not found"**
   - Ensure backend is deployed first
   - Run backend setup script: `./scripts/setup-aws-resources.sh`

2. **Frontend not accessible**
   - Check ECS service status
   - Verify target group health
   - Check path-based routing rules

3. **API calls failing**
   - Verify `REACT_APP_API_URL` environment variable
   - Check backend service is running
   - Test API endpoint directly

4. **Health checks failing**
   - Verify nginx configuration
   - Check if `/health` endpoint is accessible
   - Review security group rules

### Useful Commands

```bash
# Check ECS services
aws ecs describe-services --cluster med-connecter-cluster --services med-connecter-web-service

# View frontend logs
aws logs tail /ecs/med-connecter-web --follow

# Check load balancer rules
aws elbv2 describe-rules --listener-arn <listener-arn>

# Test frontend health
curl http://med-connecter-alb-{ACCOUNT_ID}.{REGION}.elb.amazonaws.com/health

# Test backend health
curl http://med-connecter-alb-{ACCOUNT_ID}.{REGION}.elb.amazonaws.com/medconnecter/health
```

## Security Considerations

1. **HTTPS**: Consider adding SSL/TLS certificate for production
2. **Security Groups**: Only allow necessary ports (80, 443)
3. **IAM Roles**: Follow principle of least privilege
4. **Container Security**: Regularly update base images

## Cost Optimization

1. **Shared Resources**: Using single ALB reduces costs
2. **Fargate Spot**: Consider using Fargate Spot for non-critical workloads
3. **Auto Scaling**: Implement auto scaling based on CPU/memory usage
4. **Resource Limits**: Monitor and adjust CPU/memory allocation

## Monitoring and Logging

### CloudWatch Metrics
- ECS service metrics (CPU, memory, network)
- ALB metrics (request count, response time)
- Target group health metrics

### Logs
- Frontend logs: `/ecs/med-connecter-web`
- Backend logs: `/ecs/med-connecter`
- Nginx access logs: Available in container
- ECS service events: Available in ECS console

## Next Steps

1. **Domain Configuration**: Set up custom domain with Route 53
2. **SSL Certificate**: Add HTTPS support with ACM
3. **CDN**: Implement CloudFront for global distribution
4. **Monitoring**: Set up CloudWatch alarms and dashboards
5. **Backup**: Implement automated backup strategies

## Support

For issues or questions:
1. Check AWS CloudWatch logs
2. Review ECS service events
3. Verify GitHub Actions workflow logs
4. Consult AWS documentation for specific services
