# Deployment Checklist for Med Connecter Frontend

## Pre-Deployment Checklist

### ✅ AWS Configuration
- [ ] AWS CLI installed and configured
- [ ] AWS credentials have appropriate permissions (ECS, ECR, IAM, ELB, CloudWatch)
- [ ] AWS region set to desired region (e.g., us-east-1)

### ✅ GitHub Repository Setup
- [ ] Repository contains all necessary files:
  - [ ] `.aws/task-definition.json`
  - [ ] `.github/workflows/deploy-frontend.yml`
  - [ ] `scripts/setup-aws-resources-frontend.sh`
  - [ ] `Dockerfile`
  - [ ] `nginx.conf`
  - [ ] `package.json`
  - [ ] `vite.config.ts`

### ✅ GitHub Secrets Configuration
- [ ] `AWS_ACCESS_KEY_ID` added to repository secrets
- [ ] `AWS_SECRET_ACCESS_KEY` added to repository secrets
- [ ] `AWS_REGION` added to repository secrets

### ✅ Local Testing
- [ ] Application builds successfully: `npm run build:prod`
- [ ] Docker image builds successfully: `docker build -t test-image .`
- [ ] Nginx configuration is valid
- [ ] Health check endpoint works: `/health`

## Deployment Steps

### Step 1: Initial AWS Setup
```bash
# Run the setup script
chmod +x scripts/setup-aws-resources-frontend.sh
./scripts/setup-aws-resources-frontend.sh
```

**Verify the following resources were created:**
- [ ] ECR repository: `med-connecter-web`
- [ ] ECS cluster: `med-connecter-web-cluster`
- [ ] ECS service: `med-connecter-web-service`
- [ ] Application Load Balancer: `med-connecter-web-alb`
- [ ] IAM roles: `ecsTaskExecutionRole-med-connecter-web`, `ecsTaskRole-med-connecter-web`
- [ ] CloudWatch log group: `/ecs/med-connecter-web`

### Step 2: Verify Task Definition
- [ ] Task definition file exists: `.aws/task-definition.json`
- [ ] Placeholders are correctly formatted: `{{AWS_ACCOUNT_ID}}`, `{{AWS_REGION}}`, `{{IMAGE_TAG}}`
- [ ] Container name matches: `med-connecter-web`
- [ ] Port mapping is correct: `80`
- [ ] Environment variables are set:
  - [ ] `NODE_ENV=production`
  - [ ] `REACT_APP_API_URL={{API_URL}}`
  - [ ] `REACT_APP_ENVIRONMENT=production`

### Step 3: Deploy via GitHub Actions
1. [ ] Push code to `main` branch
2. [ ] Monitor GitHub Actions workflow: `Deploy Med Connecter Frontend to Amazon ECS`
3. [ ] Verify all steps complete successfully:
   - [ ] Checkout
   - [ ] Configure AWS credentials
   - [ ] Setup AWS Resources
   - [ ] Validate task definition
   - [ ] Login to Amazon ECR
   - [ ] Build, tag, and push image
   - [ ] Deploy to ECS
   - [ ] Verify deployment

### Step 4: Post-Deployment Verification

#### Check ECS Service Status
```bash
aws ecs describe-services \
  --cluster med-connecter-web-cluster \
  --services med-connecter-web-service \
  --query 'services[0].status'
```
- [ ] Service status is `ACTIVE`
- [ ] Running count matches desired count
- [ ] No failed deployments

#### Check Load Balancer Health
```bash
# Get ALB DNS name
aws elbv2 describe-load-balancers \
  --names med-connecter-web-alb \
  --query 'LoadBalancers[0].DNSName' \
  --output text
```
- [ ] ALB DNS name is available
- [ ] Health checks are passing
- [ ] Target group is healthy

#### Test Application URLs
- [ ] Frontend URL is accessible: `http://med-connecter-web-alb-{ACCOUNT_ID}.{REGION}.elb.amazonaws.com`
- [ ] Health check endpoint works: `http://med-connecter-web-alb-{ACCOUNT_ID}.{REGION}.elb.amazonaws.com/health`
- [ ] React application loads correctly
- [ ] No console errors in browser

#### Verify Logs
```bash
# Check CloudWatch logs
aws logs tail /ecs/med-connecter-web --follow
```
- [ ] Application logs are being generated
- [ ] No error messages
- [ ] Nginx access logs are present

## Troubleshooting Common Issues

### Issue: Service fails to start
**Check:**
- [ ] ECS task definition is valid
- [ ] IAM roles have correct permissions
- [ ] Container image exists in ECR
- [ ] Security groups allow necessary traffic

### Issue: Health checks failing
**Check:**
- [ ] Nginx configuration is correct
- [ ] `/health` endpoint is accessible
- [ ] Security group allows HTTP traffic on port 80
- [ ] Container is listening on port 80

### Issue: Load balancer not accessible
**Check:**
- [ ] ALB is in public subnets
- [ ] Security group allows HTTP traffic
- [ ] Target group is healthy
- [ ] Listener is configured correctly

### Issue: Application not loading
**Check:**
- [ ] React build files are present in container
- [ ] Nginx is serving static files correctly
- [ ] Environment variables are set correctly
- [ ] API URL is accessible from frontend

## Performance Monitoring

### Set up CloudWatch Alarms
- [ ] CPU utilization alarm
- [ ] Memory utilization alarm
- [ ] Target group health alarm
- [ ] Load balancer error rate alarm

### Monitor Key Metrics
- [ ] ECS service metrics (CPU, memory, network)
- [ ] ALB metrics (request count, response time)
- [ ] Application response times
- [ ] Error rates

## Security Review

### Verify Security Configuration
- [ ] Security groups only allow necessary ports
- [ ] IAM roles follow principle of least privilege
- [ ] No sensitive data in environment variables
- [ ] Container image is from trusted source

### Consider Additional Security Measures
- [ ] Enable HTTPS with SSL certificate
- [ ] Set up WAF for additional protection
- [ ] Implement rate limiting
- [ ] Regular security updates

## Cost Optimization

### Monitor Costs
- [ ] Set up billing alerts
- [ ] Monitor ECS Fargate costs
- [ ] Track ALB costs
- [ ] Review CloudWatch log costs

### Optimization Opportunities
- [ ] Consider Fargate Spot for non-critical workloads
- [ ] Implement auto scaling
- [ ] Optimize container resource allocation
- [ ] Set appropriate log retention periods

## Documentation

### Update Documentation
- [ ] Update README with deployment instructions
- [ ] Document application URLs
- [ ] Create runbook for common issues
- [ ] Document monitoring and alerting setup

### Team Handover
- [ ] Share access credentials securely
- [ ] Document deployment process
- [ ] Create troubleshooting guide
- [ ] Set up monitoring access for team members

## Success Criteria

Deployment is considered successful when:
- [ ] Frontend application is accessible via load balancer URL
- [ ] Health checks are passing
- [ ] No errors in application logs
- [ ] Application functionality works as expected
- [ ] Performance is acceptable
- [ ] Security measures are in place
- [ ] Monitoring and alerting are configured
- [ ] Team has access to necessary resources

---

**Note:** Keep this checklist updated as your deployment process evolves. Regular reviews and updates ensure consistent and reliable deployments.
