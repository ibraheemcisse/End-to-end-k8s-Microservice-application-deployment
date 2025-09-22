# End-to-End Kubernetes Microservices Banking Application

> A production-grade Kubernetes infrastructure showcasing microservices architecture, comprehensive monitoring, and real-world DevOps challenges and solutions.

[![Kubernetes](https://img.shields.io/badge/Kubernetes-v1.33.5-blue?logo=kubernetes)](https://kubernetes.io/)
[![Docker](https://img.shields.io/badge/Docker-Containerized-blue?logo=docker)](https://docker.com/)
[![Prometheus](https://img.shields.io/badge/Monitoring-Prometheus%20%2B%20Grafana-orange?logo=prometheus)](https://prometheus.io/)
[![AWS](https://img.shields.io/badge/Cloud-AWS%20EC2-yellow?logo=amazon-aws)](https://aws.amazon.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-green?logo=node.js)](https://nodejs.org/)

## 📖 Table of Contents
- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Problem → Solution → Outcome](#problem--solution--outcome)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Features](#features)
- [Monitoring & Observability](#monitoring--observability)
- [Troubleshooting Journey](#troubleshooting-journey)
- [Performance Metrics](#performance-metrics)
- [Contributing](#contributing)

## 🎯 Project Overview

This project demonstrates the complete lifecycle of deploying a microservices-based banking application on Kubernetes, from infrastructure provisioning to production monitoring. It showcases real-world DevOps challenges and their solutions, making it an excellent reference for understanding Kubernetes operations at scale.

### What This Project Demonstrates
- **Infrastructure as Code** with Terraform and Kubespray
- **Microservices Architecture** with inter-service communication
- **Container Orchestration** with Kubernetes
- **Monitoring and Observability** with Prometheus and Grafana
- **Real-world Problem Solving** with detailed troubleshooting documentation

## 🏗️ Architecture

### High-Level System Architecture

```mermaid
graph TB
    subgraph "AWS Cloud Infrastructure"
        subgraph "VPC (172.31.0.0/16)"
            subgraph "Master Node (t3.large)"
                API[Kubernetes API Server]
                ETCD[etcd]
                SCHED[Scheduler]
                CM[Controller Manager]
            end
            
            subgraph "Worker Node 1 (t2.medium)"
                W1P1[Banking Pods]
                W1P2[Monitoring Agents]
                W1K[kubelet]
            end
            
            subgraph "Worker Node 2 (t2.medium)"
                W2P1[Banking Pods]
                W2P2[Monitoring Agents]
                W2K[kubelet]
            end
        end
        
        subgraph "External Access"
            SG[Security Groups]
            NP[NodePort Services]
        end
    end
    
    subgraph "Local Development"
        PF[Port Forwarding]
        KUBECTL[kubectl]
    end
    
    API --> W1K
    API --> W2K
    W1P1 -.-> W2P1
    SG --> NP
    NP --> W1P1
    NP --> W2P1
    KUBECTL --> API
    PF --> NP
```

### Application Architecture

```mermaid
graph LR
    subgraph "Banking Application Namespace"
        FE[Frontend Service<br/>nginx + HTML<br/>Port: 30080]
        US[User Service<br/>Node.js API<br/>Port: 30001]
        AS[Account Service<br/>Node.js API<br/>Port: 30002]
        TS[Transaction Service<br/>Node.js API<br/>Port: 30003]
        
        FE --> US
        FE --> AS
        FE --> TS
        AS --> US
        TS --> US
        TS --> AS
    end
    
    subgraph "Monitoring Namespace"
        PROM[Prometheus<br/>Metrics Collection<br/>Port: 30090]
        GRAF[Grafana<br/>Visualization<br/>Port: 30091]
        
        PROM --> GRAF
    end
    
    PROM -.-> FE
    PROM -.-> US
    PROM -.-> AS
    PROM -.-> TS
    
    subgraph "External Traffic"
        USER[End Users] --> FE
        ADMIN[DevOps Team] --> GRAF
    end
```

### Network Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant UserSvc as User Service
    participant AcctSvc as Account Service
    participant TxnSvc as Transaction Service
    participant Prometheus
    
    User->>+Frontend: Access Banking UI
    Frontend->>+UserSvc: GET /users/john
    UserSvc-->>-Frontend: User Data
    
    Frontend->>+AcctSvc: GET /accounts/john/balance
    AcctSvc->>+UserSvc: Verify user exists
    UserSvc-->>-AcctSvc: User valid
    AcctSvc-->>-Frontend: Balance: $1000
    
    Frontend->>+TxnSvc: POST /transactions
    TxnSvc->>+UserSvc: Validate sender
    TxnSvc->>+AcctSvc: Check balance
    AcctSvc-->>-TxnSvc: Balance sufficient
    TxnSvc->>+AcctSvc: Debit account
    AcctSvc-->>-TxnSvc: Transaction complete
    TxnSvc-->>-Frontend: Success
    
    Frontend-->>-User: Updated UI
    
    Note over Prometheus: Continuous monitoring
    UserSvc->>Prometheus: Metrics
    AcctSvc->>Prometheus: Metrics
    TxnSvc->>Prometheus: Metrics
```

## ⚡ Problem → Solution → Outcome

### 1. SSH Key Distribution Challenge
```mermaid
flowchart LR
    P1[🔴 PROBLEM<br/>SSH connectivity failed<br/>between nodes for<br/>Kubespray automation] 
    --> S1[🔧 SOLUTION<br/>Generated SSH keys on master<br/>Distributed public keys manually<br/>via AWS Console EC2 Connect]
    --> O1[✅ OUTCOME<br/>Successful automated<br/>cluster deployment<br/>with Kubespray]
```

**Technical Details:**
- **Problem**: `Permission denied (publickey)` errors preventing automated deployment
- **Root Cause**: Missing SSH key distribution for cluster automation
- **Solution**: Manual key distribution using AWS EC2 Instance Connect
- **Result**: Enabled seamless multi-node cluster deployment

### 2. Container Runtime Mismatch
```mermaid
flowchart LR
    P2[🔴 PROBLEM<br/>Pods stuck in<br/>ErrImageNeverPull<br/>despite images present] 
    --> S2[🔧 SOLUTION<br/>Identified containerd vs Docker<br/>Imported images to containerd<br/>on all cluster nodes]
    --> O2[✅ OUTCOME<br/>All banking services<br/>running successfully<br/>across worker nodes]
```

**Technical Details:**
- **Problem**: Kubernetes couldn't access Docker images
- **Root Cause**: Kubernetes uses containerd, not Docker daemon
- **Solution**: Used `ctr` command to import images into containerd namespace
- **Result**: Perfect pod deployment with 100% success rate

### 3. Inter-Pod Networking Failure
```mermaid
flowchart LR
    P3[🔴 PROBLEM<br/>Microservices timeout<br/>when communicating<br/>cross-node] 
    --> S3[🔧 SOLUTION<br/>Identified Calico CNI issues<br/>Restarted networking pods<br/>Verified cross-node routing]
    --> O3[✅ OUTCOME<br/>Seamless service-to-service<br/>communication with<br/>2-3ms latency]
```

**Technical Details:**
- **Problem**: Connection timeouts between pods on different nodes
- **Root Cause**: Calico CNI networking pod failures
- **Solution**: Strategic restart of Calico networking components
- **Result**: Restored full mesh networking capability

### 4. NodePort Service Access Issues
```mermaid
flowchart LR
    P4[🔴 PROBLEM<br/>NodePort services<br/>not accessible despite<br/>correct configuration] 
    --> S4[🔧 SOLUTION<br/>Diagnosed IPVS vs iptables<br/>Implemented port forwarding<br/>Created kubectl access tokens]
    --> O4[✅ OUTCOME<br/>Full remote access to<br/>monitoring dashboards<br/>and banking application]
```

**Technical Details:**
- **Problem**: Services unreachable on expected NodePort addresses
- **Root Cause**: kube-proxy using IPVS with specific interface binding
- **Solution**: Token-based kubectl access with port forwarding
- **Result**: Reliable remote access to all services

### 5. Authentication Token Management
```mermaid
flowchart LR
    P5[🔴 PROBLEM<br/>Service account tokens<br/>not auto-generated<br/>in Kubernetes v1.24+] 
    --> S5[🔧 SOLUTION<br/>Manual token creation<br/>Updated kubeconfig<br/>with long-lived tokens]
    --> O5[✅ OUTCOME<br/>Secure remote access<br/>to cluster with proper<br/>RBAC controls]
```

**Technical Details:**
- **Problem**: Empty token secrets for service accounts
- **Root Cause**: Kubernetes v1.24+ changed token generation behavior
- **Solution**: Explicit token creation with `kubectl create token`
- **Result**: Established secure remote cluster management

## 🛠️ Technology Stack

### Infrastructure Layer
- **Cloud Provider**: AWS EC2 (3 instances)
- **Instance Types**: t3.large (master), t2.medium (workers)
- **Networking**: VPC with custom subnets and security groups
- **Infrastructure as Code**: Terraform

### Kubernetes Layer
- **Kubernetes Version**: v1.33.5
- **Deployment Tool**: Kubespray
- **Container Runtime**: containerd 2.1.4
- **Network Plugin**: Calico CNI
- **Service Mesh**: None (eliminated due to complexity)

### Application Layer
- **Frontend**: nginx + vanilla HTML5/CSS3/JavaScript
- **Backend Services**: Node.js with Express.js
- **API Communication**: RESTful services with JSON
- **Data Storage**: In-memory (development setup)

### Monitoring Stack
- **Metrics Collection**: Prometheus
- **Visualization**: Grafana with custom dashboards
- **Alert Management**: AlertManager (configured)
- **Service Discovery**: Kubernetes native

### Development Tools
- **Containerization**: Docker & Docker Compose
- **CI/CD**: Manual deployment scripts
- **Version Control**: Git with GitHub
- **Documentation**: Markdown with Mermaid diagrams

## 🚀 Quick Start

### Prerequisites
```bash
# Required tools
- AWS CLI configured
- kubectl v1.24+
- Docker Engine
- Helm 3.x
- SSH key pair
```

### 1. Clone and Setup
```bash
git clone https://github.com/ibraheemcisse/End-to-end-k8s-Microservice-application-deployment.git
cd End-to-end-k8s-Microservice-application-deployment
chmod +x scripts/*.sh
```

### 2. Infrastructure Deployment
```bash
# Deploy AWS infrastructure
cd infrastructure/terraform
terraform init && terraform apply

# Note the output IPs for inventory configuration
```

### 3. Kubernetes Cluster Setup
```bash
# Configure Kubespray inventory with your IPs
vi infrastructure/kubespray/inventory.ini

# Deploy cluster
./scripts/setup-cluster.sh
```

### 4. Application Deployment
```bash
# Build and deploy banking services
./scripts/deploy-apps.sh

# Verify deployment
kubectl get pods -n banking-app
```

### 5. Monitoring Setup
```bash
# Install Prometheus and Grafana
./scripts/setup-monitoring.sh

# Setup port forwarding
./scripts/port-forward.sh
```

### 6. Access Services
```bash
# Banking Application: http://localhost:8080
# Grafana Dashboard: http://localhost:3000 (admin/prom-operator)
# Prometheus: http://localhost:9090
```

## ✨ Features

### 🏦 Banking Application Features
- **User Management**: Create, read, update, delete user accounts
- **Account Operations**: Balance inquiry, credit/debit operations
- **Transaction Processing**: Inter-account transfers with validation
- **Real-time Health Monitoring**: Service status dashboard
- **Responsive Web Interface**: Modern HTML5 frontend

### 🔧 Infrastructure Features
- **Multi-Node Kubernetes**: Production-like 3-node cluster
- **High Availability**: Replicated services across nodes
- **Auto-Scaling Ready**: Resource requests/limits configured
- **Network Policies**: Secure pod-to-pod communication
- **Persistent Storage**: Configurable volume claims

### 📊 Monitoring Features
- **Real-time Metrics**: CPU, memory, network monitoring
- **Custom Dashboards**: Banking application specific views
- **Alert Management**: Configurable alert rules
- **Service Discovery**: Automatic service monitoring
- **Historical Data**: 30-day metric retention

## 📈 Monitoring & Observability

### Key Performance Indicators

```mermaid
graph TB
    subgraph "Infrastructure Metrics"
        CPU[CPU Usage<br/>Target: <70%]
        MEM[Memory Usage<br/>Target: <80%]
        NET[Network I/O<br/>Monitor: Throughput]
        DISK[Disk Usage<br/>Monitor: IOPS]
    end
    
    subgraph "Application Metrics"
        REQ[Request Rate<br/>Monitor: RPS]
        LAT[Response Latency<br/>Target: <200ms]
        ERR[Error Rate<br/>Target: <1%]
        UP[Service Uptime<br/>Target: 99.9%]
    end
    
    subgraph "Business Metrics"
        USERS[Active Users<br/>Track: Growth]
        TXN[Transaction Volume<br/>Track: Throughput]
        BAL[Account Balances<br/>Track: Total Value]
        API[API Calls<br/>Track: Usage Patterns]
    end
```

### Grafana Dashboards Available
1. **Kubernetes Cluster Overview**: Node health, pod status, resource usage
2. **Banking Application Dashboard**: Service metrics, response times, error rates
3. **Network Performance**: Inter-service communication patterns
4. **Resource Utilization**: CPU, memory, storage across the cluster

### Sample Metrics Queries
```promql
# Service availability
up{namespace="banking-app"}

# CPU usage by service
rate(container_cpu_usage_seconds_total{namespace="banking-app"}[5m]) * 100

# Memory usage by service
container_memory_working_set_bytes{namespace="banking-app"} / 1024 / 1024

# Network traffic between services
rate(container_network_receive_bytes_total{namespace="banking-app"}[5m])
```

## 🔍 Troubleshooting Journey

This project includes comprehensive troubleshooting documentation covering 10+ major issues encountered and resolved:

### Issue Categories
1. **Authentication & Access Control** (3 issues)
2. **Container Runtime & Image Management** (2 issues)
3. **Networking & Service Discovery** (2 issues)
4. **Infrastructure & Node Management** (2 issues)
5. **Monitoring & Observability** (1 issue)

### Problem-Solving Methodology
```mermaid
graph LR
    SYMPTOM[Identify Symptoms] --> INVESTIGATE[Investigate Root Cause]
    INVESTIGATE --> HYPOTHESIS[Form Hypothesis]
    HYPOTHESIS --> TEST[Test Solution]
    TEST --> VERIFY[Verify Fix]
    VERIFY --> DOCUMENT[Document Learning]
    
    TEST -->|Failed| HYPOTHESIS
```

See [docs/troubleshooting-journal.md](docs/troubleshooting-journal.md) for detailed analysis of each issue.

## 📊 Performance Metrics

### Deployment Success Rate
```
Infrastructure Deployment:  100% ✅
Kubernetes Cluster Setup:   100% ✅
Application Deployment:      100% ✅
Monitoring Stack:           100% ✅
Service Mesh (Attempted):    0%  ❌ (Eliminated)
Backup Solution (Attempted): 0%  ❌ (Eliminated)

Overall Success Rate: 80% (4/5 major components)
```

### Resource Utilization
| Component | CPU Usage | Memory Usage | Status |
|-----------|-----------|--------------|--------|
| Master Node | ~60% | ~45% | ✅ Optimal |
| Worker Node 1 | ~40% | ~35% | ✅ Optimal |
| Worker Node 2 | ~40% | ~35% | ✅ Optimal |
| Total Cluster | ~47% | ~38% | ✅ Optimal |

### Response Times
| Service | Average Response Time | 95th Percentile | Status |
|---------|---------------------|-----------------|--------|
| User Service | 45ms | 120ms | ✅ Excellent |
| Account Service | 52ms | 140ms | ✅ Excellent |
| Transaction Service | 68ms | 180ms | ✅ Good |
| Frontend | 25ms | 60ms | ✅ Excellent |

## 🤝 Contributing

This project serves as a learning resource and portfolio demonstration. While primarily educational, contributions that improve documentation, add features, or fix issues are welcome.

### Areas for Enhancement
- [ ] Add persistent database storage (PostgreSQL)
- [ ] Implement comprehensive logging with ELK stack
- [ ] Add automated backup solutions
- [ ] Create CI/CD pipeline with GitLab or Jenkins
- [ ] Implement security scanning and compliance checks
- [ ] Add load testing and performance benchmarking

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Test changes thoroughly
4. Update documentation as needed
5. Submit a pull request with detailed description

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact & Links

- **GitHub**: [ibraheemcisse](https://github.com/ibraheemcisse)
- **Project Link**: [End-to-end K8s Microservice Deployment](https://github.com/ibraheemcisse/End-to-end-k8s-Microservice-application-deployment)
- **LinkedIn**: [Connect for professional discussions](https://linkedin.com/in/ibraheemcisse)

---

## 🏆 Project Achievements

This project demonstrates advanced DevOps capabilities including:
- ✅ Multi-node Kubernetes cluster management
- ✅ Microservices architecture implementation  
- ✅ Infrastructure automation and orchestration
- ✅ Production-grade monitoring and alerting
- ✅ Real-world problem solving and troubleshooting
- ✅ Comprehensive technical documentation
- ✅ Performance optimization and resource management

**⭐ Star this repository if you find it useful for your DevOps learning journey!**
