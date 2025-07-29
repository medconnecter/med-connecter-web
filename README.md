# Med Connecter Web

A modern React application for connecting patients with healthcare providers.

## 🚀 Features

- Modern React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- Radix UI components for accessibility
- React Router for navigation
- Comprehensive testing setup with Vitest
- Docker containerization
- AWS ECS deployment ready

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Docker (for containerization)
- AWS CLI (for deployment)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd med-connecter-web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run build:prod` - Build for production with optimizations
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run test` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run test:run` - Run tests once
- `npm run type-check` - Run TypeScript type checking

## 🧪 Testing

The project uses Vitest for testing with the following setup:

- Unit tests with Vitest
- React Testing Library for component testing
- Coverage reporting
- UI testing interface

Run tests:
```bash
npm run test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## 🐳 Docker

Build the Docker image:
```bash
docker build -t med-connecter-web .
```

Run the container:
```bash
docker run -p 80:80 med-connecter-web
```

## 🚀 Deployment

### AWS ECS Deployment

The project includes GitHub Actions workflows for automated deployment to AWS ECS.

#### Prerequisites

1. AWS ECR repository
2. AWS ECS cluster and service
3. AWS IAM roles and permissions
4. GitHub repository secrets

#### Required GitHub Secrets

- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key

#### AWS Setup

1. Create ECR repository:
```bash
aws ecr create-repository --repository-name med-connecter-web --region us-east-1
```

2. Create ECS cluster:
```bash
aws ecs create-cluster --cluster-name med-connecter-web-cluster
```

3. Create ECS service (requires task definition and load balancer setup)

4. Update the task definition in `.aws/task-definition.json` with your AWS account ID

#### Deployment Process

1. Push to `main` branch triggers deployment
2. Tests run automatically
3. Application builds and deploys to ECS
4. Health checks ensure successful deployment

### Manual Deployment

1. Build the application:
```bash
npm run build:prod
```

2. Build Docker image:
```bash
docker build -t med-connecter-web .
```

3. Push to ECR:
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag med-connecter-web:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/med-connecter-web:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/med-connecter-web:latest
```

4. Update ECS service with new task definition

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── doctors/        # Doctor-related components
│   ├── healthcare/     # Healthcare-specific components
│   ├── layout/         # Layout components
│   └── ui/             # Base UI components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── pages/              # Page components
└── test/               # Test setup files
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` for local development:

```env
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=Med Connecter
```

### Vite Configuration

The project uses Vite for building. Configuration is in `vite.config.ts`.

### ESLint Configuration

ESLint is configured in `eslint.config.js` with TypeScript and React support.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests and linting
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.
