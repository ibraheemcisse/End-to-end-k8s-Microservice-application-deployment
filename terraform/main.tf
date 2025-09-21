provider "aws" {
  region = var.aws_region
}

# VPC
resource "aws_vpc" "k8s_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = { Name = "k8s-vpc" }
}

# Subnet
resource "aws_subnet" "k8s_subnet" {
  vpc_id                  = aws_vpc.k8s_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}a"
  tags = { Name = "k8s-subnet" }
}

# Internet Gateway
resource "aws_internet_gateway" "k8s_igw" {
  vpc_id = aws_vpc.k8s_vpc.id
  tags   = { Name = "k8s-igw" }
}

# Route Table
resource "aws_route_table" "k8s_rt" {
  vpc_id = aws_vpc.k8s_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.k8s_igw.id
  }
  tags = { Name = "k8s-rt" }
}

resource "aws_route_table_association" "k8s_rta" {
  subnet_id      = aws_subnet.k8s_subnet.id
  route_table_id = aws_route_table.k8s_rt.id
}

# Security Group
resource "aws_security_group" "k8s_sg" {
  name   = "k8s-sg"
  vpc_id = aws_vpc.k8s_vpc.id

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Kubernetes API server
  ingress {
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Kubelet + NodePorts
  ingress {
    from_port   = 10250
    to_port     = 32767
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Prometheus
  ingress {
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Grafana
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Egress all
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "k8s-sg" }
}

# Master Node
resource "aws_instance" "master" {
  ami                         = var.ami_id
  instance_type               = "t3.large"
  subnet_id                   = aws_subnet.k8s_subnet.id
  vpc_security_group_ids      = [aws_security_group.k8s_sg.id]
  associate_public_ip_address = true
  key_name                    = var.key_name

  tags = {
    Name = "k8s-master"
    Role = "master"
  }
}

# Worker 1
resource "aws_instance" "worker1" {
  ami                         = var.ami_id
  instance_type               = "t2.medium"
  subnet_id                   = aws_subnet.k8s_subnet.id
  vpc_security_group_ids      = [aws_security_group.k8s_sg.id]
  associate_public_ip_address = true
  key_name                    = var.key_name

  tags = {
    Name = "k8s-worker-1"
    Role = "worker"
  }
}

# Worker 2
resource "aws_instance" "worker2" {
  ami                         = var.ami_id
  instance_type               = "t2.medium"
  subnet_id                   = aws_subnet.k8s_subnet.id
  vpc_security_group_ids      = [aws_security_group.k8s_sg.id]
  associate_public_ip_address = true
  key_name                    = var.key_name

  tags = {
    Name = "k8s-worker-2"
    Role = "worker"
  }
}

