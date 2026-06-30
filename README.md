# 🏠 K8s Homelab

## 🧾Introduction
This repo contains all the configurations and documentation for my homelab. The purpose of this homelab is to learn more about home servers and setting up kubernetes clusters and to have fun. While this will be practical in many ways, the main goal is education. Some concepts and principles that are kept in mind while designing this is backup strategies, security, scalability and ease of deployment and maintenance.

## 📌 Features
- **Secure Remote Access** via Cloudflare Tunnel (no static IP required)
- **Glance Dashboard** as centralized management interface
- **Authentication** through Cloudflare Access
- **Persistent Storage** for all configurations
- **Monitoring** with Prometheus/Grafana
- **Logging** with Loki/Alloy

## 🛠️ Infrastructure

| Component          | Technology Used       |
|--------------------|-----------------------|
| Hardware           | Dell OptiPlex 7050 Micro (32GB RAM, 256GB SSD) |
| Kubernetes         | K3s single-node cluster |
| Ingress            | Cloudflare Tunnel in-cluster |
| Authentication     | Cloudflare Access |
| Dashboard          | Glance |
| Monitoring         | Prometheus + Grafana |
| Logging            | Loki + Alloy |

## 🖥️ Applications

### Core Services

| Logo | Name | Description |
|------|------|-------------|
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/glance.svg" width="20"> | [**Glance**](https://github.com/glanceapp/glance) | Custom dashboard for homelab management |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/nextcloud.svg" width="20"> | [**Nextcloud**](https://nextcloud.com) | File sharing and document editing
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/commafeed.svg" width="20"> | [**Commafeed**](https://commafeed.com) | News Feed
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/planka.svg" width="20"> | [**Planka**](https://planka.app/) | Project Tracking and Management
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/obsidian.svg" width="20"> | [**Obsidian**](https://obsidian.md) | Note Taking
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/omni-tools.png" width="20"> | [**Omni Tools**](https://omnitools.app/) | Self-hosted collection of web utilities and tools

### Telemetry
| Logo | Name | Description |
|------|------|-------------|
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/grafana.svg" width="20"> | [**Grafana**](https://grafana.com/) | Monitoring and observability dashboard |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/prometheus.svg" width="20"> | [**Prometheus**](https://prometheus.io/) | Metrics collection and alerting |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/loki.svg" width="20"> | [**Loki**](https://grafana.com/oss/loki/) | Log aggregation system |

### Infrastructure

| Logo | Name | Description |
|------|------|-------------|
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/k3s.svg" width="20"> | [**K3s**](https://k3s.io/) | Lightweight Kubernetes distribution |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/cloudflare.svg" width="20"> | [**Cloudflare Tunnel**](https://www.cloudflare.com/products/tunnel/) | Secure ingress without public IP |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/cloudflare-zero-trust.svg" width="20"> | [**Cloudflare Zero Trust**](https://developers.cloudflare.com/cloudflare-one/) | Secure site authentication |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/postgresql.svg" width="20"> | [**PostgreSQL**](https://www.postgresql.org/) | Relational database for applications |

### Planned Services
Currently planned services that will be implemented in the future

| Logo | Name | Description |
|------|------|-------------|
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/n8n.svg" width="20"> | [**n8n**](https://n8n.io/) | Workflow automation platform |
| <img src="https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/k8up.svg" width="20"> | [**K8up**](https://k8up.io/) | Application-aware backups of PVC and database data |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/stalwart.svg" width="20"> | [**Stalwart**](https://stalw.art/) | Self-hosted mail server |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/jellyfin.svg" width="20"> | [**Jellyfin**](https://jellyfin.org/) | Self-hosted media server |

