# 🏠 K8s Homelab

## 🧾Introduction
This repo contains all the configurations and documentation for my homelab. The purpose of this homelab is to learn more about home servers and setting up kubernetes clusters and to have fun. While this will be practical in many ways, the main goal is education. Some concepts and principles that are kept in mind while designing this is backup strategies, security, scalability and ease of deployment and maintenance.

## 📌 Features
- **Secure Remote Access** via Cloudflare Tunnel (no static IP required)
- **Homepage Dashboard** as centralized management interface
- **Authentication** through Cloudflare Access
- **Persistent Storage** for all configurations
- **Monitoring** with Prometheus/Grafana
- **Logging** with Loki/Promtail

## 🛠️ Infrastructure

| Component          | Technology Used       |
|--------------------|-----------------------|
| Hardware           | Dell OptiPlex 7050 Micro (32GB RAM, 256GB SSD) |
| Kubernetes         | K3s single-node cluster |
| Ingress            | Cloudflare Tunnel in-cluster |
| Authentication     | Cloudflare Access |
| Dashboard          | Homepage |
| Monitoring         | Prometheus + Grafana |
| Logging            | Loki + Promtail |

## 🖥️ Applications

### Core Services

| Logo | Name | Description |
|------|------|-------------|
| <img src="https://camo.githubusercontent.com/1822c165e7941a2c1cbc126f8b3ae81a6853069ff748daa8a60abbf0d5d34180/68747470733a2f2f7777772e7376677265706f2e636f6d2f646f776e6c6f61642f3439393830372f686f6d652d706167652e737667" width="20"> | [**Homepage**](https://gethomepage.dev/) | Custom dashboard for homelab management |
| <img src="https://nextcloud.com/c/uploads/2023/02/logo_nextcloud_white.svg" width="20"> | [**Nextcloud**](https://nextcloud.com) | File sharing and document editing
| <img src="https://download.logo.wine/logo/CommaFeed/CommaFeed-Logo.wine.png" width="20"> | [**Commafeed**](https://commafeed.com) | News Feed

### Telemetry
| Logo | Name | Description |
|------|------|-------------|
| <img src="https://grafana.com/static/assets/img/fav32.png" width="20"> | [**Grafana**](https://grafana.com/) | Monitoring and observability dashboard |
| <img src="https://github.com/user-attachments/assets/9898e44d-054a-40f2-9281-cc64b5e98d07" width="20"> | [**Prometheus**](https://prometheus.io/) | Metrics collection and alerting |
| <img src="https://grafana.com/media/docs/loki/logo-grafana-loki.png" width="20"> | [**Loki**](https://grafana.com/oss/loki/) | Log aggregation system |

### Infrastructure

| Logo | Name | Description |
|------|------|-------------|
| <img src="https://github.com/user-attachments/assets/a838541b-c3be-4077-a74a-564ae9b91ed9" width="20"> | [**K3s**](https://k3s.io/) | Lightweight Kubernetes distribution |
| <img src="https://www.cloudflare.com/favicon.ico" width="20"> | [**Cloudflare Tunnel**](https://www.cloudflare.com/products/tunnel/) | Secure ingress without public IP |
| <img src="https://www.cloudflare.com/favicon.ico" width="20"> | [**Cloudflare Zero Trust**](https://developers.cloudflare.com/cloudflare-one/) | Secure site authentication |
| <img src="https://www.postgresql.org/favicon.ico" width="20"> | [**PostgreSQL**](https://www.postgresql.org/) | Relational database for applications |

### Planned Services
Currently planned services that will be implemented in the future

| Logo | Name | Description |
|------|------|-------------|
| <img src="https://n8n.io/favicon.ico" width="20"> | [**n8n**](https://n8n.io/) | Workflow automation platform |
| <img src="https://velero.io/img/Velero.svg" width="20"> | [**Velero**](https://velero.io/) | Kubernetes backup and migration |

