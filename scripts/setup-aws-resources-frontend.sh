#!/bin/bash

# AWS ECS Deployment Setup Script for React Frontend
# This script creates all necessary AWS resources for the Med Connecter Frontend application
# Uses shared load balancer with path-based routing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REGION="${AWS_REGION:-us-east-1}"
PROJECT_NAME="med-connecter"
FRONTEND_PROJECT_NAME="med-connecter-web"
CLUSTER_NAME="${PROJECT_NAME}-cluster"
SERVICE_NAME="${FRONTEND_PROJECT_NAME}-service"
ECR_REPOSITORY="${FRONTEND_PROJECT_NAME}"
LOG_GROUP="/ecs/${FRONTEND_PROJECT_NAME}"

echo -e "${BLUE}🚀 Setting up AWS resources for Med Connecter Frontend...${NC}"
echo -e "${BLUE}📍 Region: ${REGION}${NC}"
echo -e "${BLUE}🔗 Using shared load balancer and cluster${NC}"
echo ""

# Function to check if AWS CLI is configured
check_aws_cli() {
    echo -e "${YELLOW}🔍 Checking AWS CLI configuration...${NC}"
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}❌ AWS CLI not configured. Please run 'aws configure' first.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ AWS CLI configured${NC}"
    echo ""
}

# Function to get AWS account ID
get_account_id() {
    echo -e "${YELLOW}🔍 Getting AWS Account ID...${NC}"
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    echo -e "${GREEN}✅ Account ID: ${ACCOUNT_ID}${NC}"
    echo ""
}

# Function to create ECR repository
create_ecr_repository() {
    echo -e "${YELLOW}🔍 Creating ECR repository...${NC}"
    if aws ecr describe-repositories --repository-names "${ECR_REPOSITORY}" --region "${REGION}" &> /dev/null; then
        echo -e "${GREEN}✅ ECR repository already exists${NC}"
    else
        aws ecr create-repository \
            --repository-name "${ECR_REPOSITORY}" \
            --region "${REGION}" \
            --image-scanning-configuration scanOnPush=true
        echo -e "${GREEN}✅ ECR repository created${NC}"
    fi
    echo ""
}

# Function to create CloudWatch log group
create_log_group() {
    echo -e "${YELLOW}🔍 Creating CloudWatch log group...${NC}"
    if aws logs describe-log-groups --log-group-name-prefix "${LOG_GROUP}" --region "${REGION}" | grep -q "${LOG_GROUP}"; then
        echo -e "${GREEN}✅ Log group already exists${NC}"
    else
        aws logs create-log-group --log-group-name "${LOG_GROUP}" --region "${REGION}"
        echo -e "${GREEN}✅ Log group created${NC}"
    fi
    echo ""
}

# Function to check if shared cluster exists
check_shared_cluster() {
    echo -e "${YELLOW}🔍 Checking shared ECS cluster...${NC}"
    if aws ecs describe-clusters --clusters "${CLUSTER_NAME}" --region "${REGION}" | grep -q "ACTIVE"; then
        echo -e "${GREEN}✅ Shared ECS cluster exists${NC}"
    else
        echo -e "${RED}❌ Shared ECS cluster not found. Please run the backend setup first.${NC}"
        exit 1
    fi
    echo ""
}

# Function to check if shared load balancer exists
check_shared_load_balancer() {
    echo -e "${YELLOW}🔍 Checking shared load balancer...${NC}"
    ALB_NAME="${PROJECT_NAME}-alb"
    ALB_ARN=$(aws elbv2 describe-load-balancers --names "${ALB_NAME}" --region "${REGION}" --query 'LoadBalancers[0].LoadBalancerArn' --output text 2>/dev/null || echo "")
    
    if [ -z "$ALB_ARN" ] || [ "$ALB_ARN" = "None" ]; then
        echo -e "${RED}❌ Shared load balancer not found. Please run the backend setup first.${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ Shared load balancer exists: ${ALB_ARN}${NC}"
        ALB_DNS_NAME=$(aws elbv2 describe-load-balancers --load-balancer-arns "${ALB_ARN}" --region "${REGION}" --query 'LoadBalancers[0].DNSName' --output text)
        echo -e "${GREEN}✅ Load balancer DNS: ${ALB_DNS_NAME}${NC}"
    fi
    echo ""
}

# Function to create target group for frontend
create_target_group() {
    echo -e "${YELLOW}🔍 Creating target group for frontend...${NC}"
    
    # Get VPC ID from existing ALB
    ALB_NAME="${PROJECT_NAME}-alb"
    ALB_ARN=$(aws elbv2 describe-load-balancers --names "${ALB_NAME}" --region "${REGION}" --query 'LoadBalancers[0].LoadBalancerArn' --output text)
    VPC_ID=$(aws elbv2 describe-load-balancers --load-balancer-arns "${ALB_ARN}" --region "${REGION}" --query 'LoadBalancers[0].VpcId' --output text)
    
    TARGET_GROUP_NAME="${FRONTEND_PROJECT_NAME}-tg"
    TARGET_GROUP_ARN=$(aws elbv2 describe-target-groups --names "${TARGET_GROUP_NAME}" --region "${REGION}" --query 'TargetGroups[0].TargetGroupArn' --output text 2>/dev/null || echo "")
    
    if [ -z "$TARGET_GROUP_ARN" ] || [ "$TARGET_GROUP_ARN" = "None" ]; then
        echo -e "${YELLOW}Creating target group for frontend...${NC}"
        TARGET_GROUP_ARN=$(aws elbv2 create-target-group \
            --name "${TARGET_GROUP_NAME}" \
            --protocol HTTP \
            --port 80 \
            --vpc-id "${VPC_ID}" \
            --target-type ip \
            --health-check-path /health \
            --health-check-interval-seconds 30 \
            --health-check-timeout-seconds 5 \
            --healthy-threshold-count 2 \
            --unhealthy-threshold-count 2 \
            --region "${REGION}" \
            --query 'TargetGroups[0].TargetGroupArn' \
            --output text)
        
        echo -e "${GREEN}✅ Target group created: ${TARGET_GROUP_ARN}${NC}"
    else
        echo -e "${GREEN}✅ Target group already exists: ${TARGET_GROUP_ARN}${NC}"
    fi
    echo ""
}

# Function to configure path-based routing
configure_path_routing() {
    echo -e "${YELLOW}🔍 Configuring path-based routing...${NC}"
    
    ALB_NAME="${PROJECT_NAME}-alb"
    ALB_ARN=$(aws elbv2 describe-load-balancers --names "${ALB_NAME}" --region "${REGION}" --query 'LoadBalancers[0].LoadBalancerArn' --output text)
    
    # Get listener ARN
    LISTENER_ARN=$(aws elbv2 describe-listeners --load-balancer-arn "${ALB_ARN}" --region "${REGION}" --query 'Listeners[0].ListenerArn' --output text)
    
    # Check if frontend routing rule already exists
    EXISTING_RULE=$(aws elbv2 describe-rules --listener-arn "${LISTENER_ARN}" --region "${REGION}" --query 'Rules[?Conditions[0].Values[0]==`/`].RuleArn' --output text 2>/dev/null || echo "")
    
    if [ -z "$EXISTING_RULE" ] || [ "$EXISTING_RULE" = "None" ]; then
        echo -e "${YELLOW}Creating path-based routing rule for frontend (/)...${NC}"
        
        # Get target group ARN for frontend
        TARGET_GROUP_ARN=$(aws elbv2 describe-target-groups --names "${FRONTEND_PROJECT_NAME}-tg" --region "${REGION}" --query 'TargetGroups[0].TargetGroupArn' --output text)
        
        # Create rule for frontend (root path)
        aws elbv2 create-rule \
            --listener-arn "${LISTENER_ARN}" \
            --priority 1 \
            --conditions Field=path-pattern,Values="/" \
            --actions Type=forward,TargetGroupArn="${TARGET_GROUP_ARN}" \
            --region "${REGION}"
        
        echo -e "${GREEN}✅ Frontend routing rule created (/)${NC}"
    else
        echo -e "${GREEN}✅ Frontend routing rule already exists${NC}"
    fi
    
    # Check if backend routing rule exists
    BACKEND_RULE=$(aws elbv2 describe-rules --listener-arn "${LISTENER_ARN}" --region "${REGION}" --query 'Rules[?Conditions[0].Values[0]==`/medconnecter/*`].RuleArn' --output text 2>/dev/null || echo "")
    
    if [ -z "$BACKEND_RULE" ] || [ "$BACKEND_RULE" = "None" ]; then
        echo -e "${YELLOW}Creating path-based routing rule for backend (/medconnecter/*)...${NC}"
        
        # Get target group ARN for backend
        BACKEND_TARGET_GROUP_ARN=$(aws elbv2 describe-target-groups --names "${PROJECT_NAME}-tg" --region "${REGION}" --query 'TargetGroups[0].TargetGroupArn' --output text)
        
        # Create rule for backend
        aws elbv2 create-rule \
            --listener-arn "${LISTENER_ARN}" \
            --priority 2 \
            --conditions Field=path-pattern,Values="/medconnecter/*" \
            --actions Type=forward,TargetGroupArn="${BACKEND_TARGET_GROUP_ARN}" \
            --region "${REGION}"
        
        echo -e "${GREEN}✅ Backend routing rule created (/medconnecter/*)${NC}"
    else
        echo -e "${GREEN}✅ Backend routing rule already exists${NC}"
    fi
    echo ""
}

# Function to update task definition with account ID
update_task_definition() {
    echo -e "${YELLOW}🔍 Updating task definition with account ID...${NC}"
    
    # Create backup
    cp .aws/task-definition.json .aws/task-definition.json.backup
    
    # Replace placeholders using perl for better handling of special characters
    perl -pi -e "s/\\{\\{AWS_ACCOUNT_ID\\}\\}/${ACCOUNT_ID}/g" .aws/task-definition.json
    perl -pi -e "s/\\{\\{AWS_REGION\\}\\}/${REGION}/g" .aws/task-definition.json
    
    # Replace IMAGE_TAG placeholder with a temporary value for setup
    # This will be replaced by the GitHub workflow during deployment
    perl -pi -e "s/\\{\\{IMAGE_TAG\\}\\}/latest/g" .aws/task-definition.json
    
    echo -e "${GREEN}✅ Task definition updated${NC}"
    echo ""
}

# Function to create ECS service
create_ecs_service() {
    echo -e "${YELLOW}🔍 Creating ECS service...${NC}"
    
    # Check if service already exists and is active
    SERVICE_STATUS=$(aws ecs describe-services --cluster "${CLUSTER_NAME}" --services "${SERVICE_NAME}" --region "${REGION}" --query 'services[0].status' --output text 2>/dev/null || echo "NONEXISTENT")
    
    if [ "$SERVICE_STATUS" = "ACTIVE" ]; then
        echo -e "${GREEN}✅ ECS service already exists and is active${NC}"
    else
        echo -e "${YELLOW}Service status: ${SERVICE_STATUS} - Creating/Updating service...${NC}"
        
        # Get subnet IDs
        VPC_ID=$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --query 'Vpcs[0].VpcId' --output text --region "${REGION}")
        SUBNET_IDS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=${VPC_ID}" --query 'Subnets[*].SubnetId' --output text --region "${REGION}" | tr '\t' ',' | sed 's/,$//')
        
        # Get security group ID
        SECURITY_GROUP_ID=$(aws ec2 describe-security-groups --filters "Name=vpc-id,Values=${VPC_ID}" "Name=group-name,Values=default" --query 'SecurityGroups[0].GroupId' --output text --region "${REGION}")
        
        # Get target group ARN for frontend
        TARGET_GROUP_ARN=$(aws elbv2 describe-target-groups --names "${FRONTEND_PROJECT_NAME}-tg" --region "${REGION}" --query 'TargetGroups[0].TargetGroupArn' --output text)
        
        echo -e "${YELLOW}Using subnets: ${SUBNET_IDS}${NC}"
        echo -e "${YELLOW}Using security group: ${SECURITY_GROUP_ID}${NC}"
        echo -e "${YELLOW}Using target group: ${TARGET_GROUP_ARN}${NC}"
        
        # Register task definition first (this is crucial for proper image handling)
        echo -e "${YELLOW}Registering task definition...${NC}"
        aws ecs register-task-definition --cli-input-json file://.aws/task-definition.json --region "${REGION}"
        
        # Create service with load balancer using the correct task definition family and revision
        echo -e "${YELLOW}Creating ECS service with load balancer...${NC}"
        aws ecs create-service \
            --cluster "${CLUSTER_NAME}" \
            --service-name "${SERVICE_NAME}" \
            --task-definition "${FRONTEND_PROJECT_NAME}:1" \
            --desired-count 1 \
            --launch-type FARGATE \
            --network-configuration "awsvpcConfiguration={subnets=[${SUBNET_IDS}],securityGroups=[${SECURITY_GROUP_ID}],assignPublicIp=ENABLED}" \
            --load-balancers "targetGroupArn=${TARGET_GROUP_ARN},containerName=${FRONTEND_PROJECT_NAME},containerPort=80" \
            --region "${REGION}"
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ ECS service created successfully with load balancer${NC}"
        else
            echo -e "${RED}❌ Failed to create ECS service${NC}"
            exit 1
        fi
    fi
    echo ""
}

# Function to update existing ECS service (if needed)
update_ecs_service() {
    echo -e "${YELLOW}🔍 Checking if ECS service needs update...${NC}"
    
    # Check if service exists
    SERVICE_STATUS=$(aws ecs describe-services --cluster "${CLUSTER_NAME}" --services "${SERVICE_NAME}" --region "${REGION}" --query 'services[0].status' --output text 2>/dev/null || echo "NONEXISTENT")
    
    if [ "$SERVICE_STATUS" = "ACTIVE" ]; then
        echo -e "${YELLOW}Service exists, checking if it needs update...${NC}"
        
        # Get current task definition
        CURRENT_TASK_DEF=$(aws ecs describe-services --cluster "${CLUSTER_NAME}" --services "${SERVICE_NAME}" --region "${REGION}" --query 'services[0].taskDefinition' --output text)
        
        # Register new task definition
        echo -e "${YELLOW}Registering updated task definition...${NC}"
        aws ecs register-task-definition --cli-input-json file://.aws/task-definition.json --region "${REGION}"
        
        # Get new task definition ARN
        NEW_TASK_DEF_ARN=$(aws ecs describe-task-definition --task-definition "${FRONTEND_PROJECT_NAME}" --region "${REGION}" --query 'taskDefinition.taskDefinitionArn' --output text)
        
        # Update service if task definition changed
        if [ "$CURRENT_TASK_DEF" != "$NEW_TASK_DEF_ARN" ]; then
            echo -e "${YELLOW}Updating service with new task definition...${NC}"
            aws ecs update-service \
                --cluster "${CLUSTER_NAME}" \
                --service "${SERVICE_NAME}" \
                --task-definition "${NEW_TASK_DEF_ARN}" \
                --region "${REGION}"
            
            echo -e "${GREEN}✅ Service updated successfully${NC}"
        else
            echo -e "${GREEN}✅ Service is already up to date${NC}"
        fi
    else
        echo -e "${YELLOW}Service does not exist, will be created by create_ecs_service function${NC}"
    fi
    echo ""
}

# Function to display next steps
display_next_steps() {
    echo -e "${BLUE}🎉 AWS resources setup completed for Frontend!${NC}"
    echo ""
    
    # Get ALB DNS name
    ALB_NAME="${PROJECT_NAME}-alb"
    ALB_DNS_NAME=$(aws elbv2 describe-load-balancers --names "${ALB_NAME}" --region "${REGION}" --query 'LoadBalancers[0].DNSName' --output text)
    
    echo -e "${GREEN}🌐 Shared Load Balancer DNS: ${ALB_DNS_NAME}${NC}"
    echo -e "${GREEN}🏠 Frontend Application: http://${ALB_DNS_NAME}${NC}"
    echo -e "${GREEN}🔗 Backend API: http://${ALB_DNS_NAME}/medconnecter${NC}"
    echo -e "${GREEN}🏥 Frontend Health Check: http://${ALB_DNS_NAME}/health${NC}"
    echo -e "${GREEN}🏥 Backend Health Check: http://${ALB_DNS_NAME}/medconnecter/health${NC}"
    echo ""
    
    echo -e "${YELLOW}📋 Next steps:${NC}"
    echo "1. Push to main branch to trigger deployment"
    echo "2. Wait for ECS service to be healthy"
    echo "3. Access your frontend via the load balancer URL above"
    echo ""
    echo -e "${GREEN}✅ Frontend setup complete!${NC}"
}

# Function to debug and fix health check issues
debug_and_fix_health_checks() {
    echo -e "${YELLOW}🔍 Debugging and fixing health check issues...${NC}"
    
    # Check ECS service status
    echo -e "${YELLOW}📋 Checking ECS Service Status...${NC}"
    SERVICE_DETAILS=$(aws ecs describe-services \
        --cluster "${CLUSTER_NAME}" \
        --services "${SERVICE_NAME}" \
        --region "${REGION}")
    
    SERVICE_STATUS=$(echo "${SERVICE_DETAILS}" | jq -r '.services[0].status')
    DESIRED_COUNT=$(echo "${SERVICE_DETAILS}" | jq -r '.services[0].desiredCount')
    RUNNING_COUNT=$(echo "${SERVICE_DETAILS}" | jq -r '.services[0].runningCount')
    
    echo -e "Service Status: ${SERVICE_STATUS}"
    echo -e "Desired Count: ${DESIRED_COUNT}"
    echo -e "Running Count: ${RUNNING_COUNT}"
    
    if [ "${SERVICE_STATUS}" = "ACTIVE" ] && [ "${RUNNING_COUNT}" -gt 0 ]; then
        echo -e "${GREEN}✅ ECS Service is active and has running tasks${NC}"
    else
        echo -e "${RED}❌ ECS Service has issues - attempting to fix...${NC}"
        
        # Force new deployment
        echo -e "${YELLOW}🔄 Forcing new deployment...${NC}"
        aws ecs update-service \
            --cluster "${CLUSTER_NAME}" \
            --service "${SERVICE_NAME}" \
            --force-new-deployment \
            --region "${REGION}"
        
        echo -e "${GREEN}✅ Service update initiated${NC}"
    fi
    
    # Check target group health
    echo -e "${YELLOW}📋 Checking Target Group Health...${NC}"
    TARGET_GROUP_ARN=$(aws elbv2 describe-target-groups \
        --names "${FRONTEND_PROJECT_NAME}-tg" \
        --region "${REGION}" \
        --query 'TargetGroups[0].TargetGroupArn' \
        --output text)
    
    TARGET_HEALTH=$(aws elbv2 describe-target-health \
        --target-group-arn "${TARGET_GROUP_ARN}" \
        --region "${REGION}")
    
    echo "${TARGET_HEALTH}" | jq -r '.TargetHealthDescriptions[] | "Target: \(.Target.Id):\(.Target.Port) - Status: \(.TargetHealth.State) - Reason: \(.TargetHealth.Reason // "N/A")"'
    
    # Check if targets are unhealthy
    UNHEALTHY_COUNT=$(echo "${TARGET_HEALTH}" | jq -r '.TargetHealthDescriptions[] | select(.TargetHealth.State == "unhealthy") | .Target.Id' | wc -l)
    
    if [ "${UNHEALTHY_COUNT}" -gt 0 ]; then
        echo -e "${RED}❌ Found ${UNHEALTHY_COUNT} unhealthy targets - attempting to fix...${NC}"
        
        # Fix security group rules
        fix_security_group_rules
        
        # Update target group health check settings
        fix_target_group_health_check
        
        # Wait for health checks to stabilize
        echo -e "${YELLOW}⏳ Waiting for health checks to stabilize...${NC}"
        sleep 60
        
        # Check health again
        TARGET_HEALTH_AFTER=$(aws elbv2 describe-target-health \
            --target-group-arn "${TARGET_GROUP_ARN}" \
            --region "${REGION}")
        
        echo -e "${YELLOW}📋 Health check status after fixes:${NC}"
        echo "${TARGET_HEALTH_AFTER}" | jq -r '.TargetHealthDescriptions[] | "Target: \(.Target.Id):\(.Target.Port) - Status: \(.TargetHealth.State) - Reason: \(.TargetHealth.Reason // "N/A")"'
    else
        echo -e "${GREEN}✅ All targets are healthy${NC}"
    fi
    
    echo ""
}

# Function to fix security group rules
fix_security_group_rules() {
    echo -e "${YELLOW}🔧 Fixing security group rules...${NC}"
    
    # Get VPC ID
    VPC_ID=$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --query 'Vpcs[0].VpcId' --output text --region "${REGION}")
    
    # Get default security group
    SECURITY_GROUP_ID=$(aws ec2 describe-security-groups \
        --filters "Name=vpc-id,Values=${VPC_ID}" "Name=group-name,Values=default" \
        --query 'SecurityGroups[0].GroupId' \
        --output text \
        --region "${REGION}")
    
    echo -e "VPC: ${VPC_ID}"
    echo -e "Security Group: ${SECURITY_GROUP_ID}"
    
    # Add port 80 rule if it doesn't exist
    echo -e "${YELLOW}Adding port 80 rule to security group...${NC}"
    aws ec2 authorize-security-group-ingress \
        --group-id "${SECURITY_GROUP_ID}" \
        --protocol tcp \
        --port 80 \
        --cidr 0.0.0.0/0 \
        --region "${REGION}" 2>/dev/null || echo -e "${GREEN}✅ Port 80 rule already exists${NC}"
    
    # Add port 443 rule if it doesn't exist
    echo -e "${YELLOW}Adding port 443 rule to security group...${NC}"
    aws ec2 authorize-security-group-ingress \
        --group-id "${SECURITY_GROUP_ID}" \
        --protocol tcp \
        --port 443 \
        --cidr 0.0.0.0/0 \
        --region "${REGION}" 2>/dev/null || echo -e "${GREEN}✅ Port 443 rule already exists${NC}"
    
    echo -e "${GREEN}✅ Security group rules updated${NC}"
    echo ""
}

# Function to fix target group health check settings
fix_target_group_health_check() {
    echo -e "${YELLOW}🔧 Fixing target group health check settings...${NC}"
    
    # Get target group ARN
    TARGET_GROUP_ARN=$(aws elbv2 describe-target-groups \
        --names "${FRONTEND_PROJECT_NAME}-tg" \
        --region "${REGION}" \
        --query 'TargetGroups[0].TargetGroupArn' \
        --output text)
    
    # Update health check settings to be more lenient
    echo -e "${YELLOW}Updating health check settings...${NC}"
    aws elbv2 modify-target-group \
        --target-group-arn "${TARGET_GROUP_ARN}" \
        --health-check-path /health \
        --health-check-interval-seconds 30 \
        --health-check-timeout-seconds 10 \
        --healthy-threshold-count 2 \
        --unhealthy-threshold-count 3 \
        --region "${REGION}"
    
    echo -e "${GREEN}✅ Target group health check settings updated${NC}"
    echo ""
}

# Function to check container logs
check_container_logs() {
    echo -e "${YELLOW}📋 Checking Container Logs...${NC}"
    
    # Get the most recent task
    RECENT_TASK=$(aws ecs list-tasks \
        --cluster "${CLUSTER_NAME}" \
        --service-name "${SERVICE_NAME}" \
        --region "${REGION}" \
        --query 'taskArns[0]' \
        --output text)
    
    if [ "${RECENT_TASK}" = "None" ] || [ -z "${RECENT_TASK}" ]; then
        echo -e "${RED}❌ No tasks found to check logs${NC}"
        return
    fi
    
    echo -e "Checking logs for task: ${RECENT_TASK}"
    
    # Get log stream name
    LOG_STREAM=$(aws logs describe-log-streams \
        --log-group-name "/ecs/${FRONTEND_PROJECT_NAME}" \
        --region "${REGION}" \
        --order-by LastEventTime \
        --descending \
        --max-items 1 \
        --query 'logStreams[0].logStreamName' \
        --output text)
    
    if [ "${LOG_STREAM}" = "None" ] || [ -z "${LOG_STREAM}" ]; then
        echo -e "${RED}❌ No log streams found${NC}"
        return
    fi
    
    echo -e "Log stream: ${LOG_STREAM}"
    
    # Get recent logs
    echo -e "${BLUE}Recent logs:${NC}"
    aws logs get-log-events \
        --log-group-name "/ecs/${FRONTEND_PROJECT_NAME}" \
        --log-stream-name "${LOG_STREAM}" \
        --region "${REGION}" \
        --start-from-head \
        --limit 10 \
        --query 'events[].message' \
        --output text | head -10
    echo ""
}

# Function to test health endpoint manually
test_health_endpoint() {
    echo -e "${YELLOW}📋 Testing Health Endpoint...${NC}"
    
    # Get ALB DNS name
    ALB_DNS=$(aws elbv2 describe-load-balancers \
        --names "${PROJECT_NAME}-alb" \
        --region "${REGION}" \
        --query 'LoadBalancers[0].DNSName' \
        --output text)
    
    echo -e "ALB DNS: ${ALB_DNS}"
    
    # Test health endpoint
    echo -e "Testing: http://${ALB_DNS}/health"
    
    # Try to curl the health endpoint
    if command -v curl &> /dev/null; then
        echo -e "${BLUE}Response:${NC}"
        curl -v --connect-timeout 10 --max-time 30 "http://${ALB_DNS}/health" 2>&1 || echo -e "${RED}❌ Health endpoint not accessible${NC}"
    else
        echo -e "${YELLOW}⚠️ curl not available, cannot test health endpoint${NC}"
    fi
    echo ""
}

# Function to run debugging only
debug_only() {
    echo -e "${BLUE}🔍 Running debugging only...${NC}"
    debug_and_fix_health_checks
    check_container_logs
    test_health_endpoint
    echo -e "${BLUE}🎉 Debugging completed!${NC}"
}

# Main execution
main() {
    check_aws_cli
    get_account_id
    create_ecr_repository
    create_log_group
    check_shared_cluster
    check_shared_load_balancer
    create_target_group
    configure_path_routing
    update_task_definition
    create_ecs_service
    update_ecs_service
    debug_and_fix_health_checks
    check_container_logs
    test_health_endpoint
    display_next_steps
}

# Check if debug mode is requested
if [ "$1" = "debug" ]; then
    debug_only
else
    # Run main function
    main "$@"
fi
