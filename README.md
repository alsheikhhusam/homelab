# 🏠 K8s Homelab

## 🧾Introduction
This repo contains all the configurations and documentation for my homelab. The purpose of this homelab is to learn more about home servers and setting up kubernetes clusters and to have fun. While this will be practical in many ways, the main goal is education. Some concepts and principles that are kept in mind while designing this is backup strategies, security, scalability and ease of deployment and maintenance.

## 📌 Features
- **Secure Remote Access** via Cloudflare Tunnel, with no open inbound ports
- **Authentication** through Cloudflare Access (Zero Trust), or each app's own login for apps with native clients
- **Glance Dashboard** as centralized management interface
- **Helm-managed deployments**, with the repo as the single source of truth
- **Persistent Storage** on local-path volumes, plus size-capped disk images for data-heavy apps
- **Monitoring** with Prometheus/Grafana, dashboards provisioned as code
- **Alerting** by email through Alertmanager and Grafana (sent via Resend)
- **Logging** with Loki/Alloy, covering pod and kernel logs
- **Automated version checks** with a weekly update report by email

## 🗺️ Architecture

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/architecture-dark.svg">
  <img alt="Homelab architecture: User to Cloudflare Access, Cloudflare Tunnel, in-cluster cloudflared, app workloads and persistent data, with a telemetry namespace of Grafana, Loki, Alloy, Prometheus and Alertmanager emailing alerts via Resend" src="docs/architecture-light.svg">
</picture>

## 🛠️ Infrastructure

| Component          | Technology Used       |
|--------------------|-----------------------|
| Hardware           | Dell OptiPlex 7050 Micro (i5-6600T, 32GB RAM, 256GB NVMe SSD) |
| Kubernetes         | K3s single-node cluster (SQLite datastore, Traefik disabled) |
| Deployment         | Helm charts (vendored upstream charts and custom charts) |
| Ingress            | Cloudflare Tunnel (cloudflared in-cluster, no ingress controller) |
| Authentication     | Cloudflare Access |
| Storage            | local-path provisioner + loop-mounted ext4 disk images |
| Dashboard          | Glance |
| Monitoring         | Prometheus + Grafana |
| Alerting           | Alertmanager + Grafana alerts, email via Resend |
| Logging            | Loki + Alloy |

## 🖥️ Applications

### Core Services

| Logo | Name | Description |
|------|------|-------------|
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/glance.svg" width="20"> | [**Glance**](https://github.com/glanceapp/glance) | Custom dashboard for homelab management |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/open-cloud.svg" width="20"> | [**OpenCloud**](https://opencloud.eu) | File sync and sharing |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/onlyoffice.svg" width="20"> | [**ONLYOFFICE**](https://www.onlyoffice.com/) | Document editor for OpenCloud (WOPI) |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/commafeed.svg" width="20"> | [**Commafeed**](https://commafeed.com) | RSS news feed reader |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/planka.svg" width="20"> | [**Planka**](https://planka.app/) | Project tracking and management |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/obsidian.svg" width="20"> | [**Obsidian LiveSync**](https://github.com/vrtmrz/obsidian-livesync) | Note sync across devices, backed by CouchDB |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/omni-tools.png" width="20"> | [**Omni Tools**](https://omnitools.app/) | Self-hosted collection of web utilities and tools |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/n8n.svg" width="20"> | [**n8n**](https://n8n.io/) | Workflow automation platform |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/wallos.png" width="20"> | [**Wallos**](https://github.com/ellite/Wallos) | Subscription tracker and budgeting |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/bookorbit.png" width="20"> | [**BookOrbit**](https://github.com/bookorbit/bookorbit) | Ebook, audiobook and comic library |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/nextjs.svg" width="20"> | [**Portfolio**](https://husamalsheikh.com) | Personal portfolio site (Next.js) |

### Telemetry
| Logo | Name | Description |
|------|------|-------------|
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/grafana.svg" width="20"> | [**Grafana**](https://grafana.com/) | Monitoring and observability dashboard |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/prometheus.svg" width="20"> | [**Prometheus**](https://prometheus.io/) | Metrics collection and alerting |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/loki.svg" width="20"> | [**Loki**](https://grafana.com/oss/loki/) | Log aggregation system |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/alloy.svg" width="20"> | [**Alloy**](https://grafana.com/oss/alloy/) | Collects pod and kernel logs and ships them to Loki |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/alertmanager.svg" width="20"> | [**Alertmanager**](https://prometheus.io/docs/alerting/latest/alertmanager/) | Alert routing and email notifications |

### Infrastructure

| Logo | Name | Description |
|------|------|-------------|
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/k3s.svg" width="20"> | [**K3s**](https://k3s.io/) | Lightweight Kubernetes distribution |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/helm.svg" width="20"> | [**Helm**](https://helm.sh/) | Package manager for every app deployment |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/cloudflare.svg" width="20"> | [**Cloudflare Tunnel**](https://www.cloudflare.com/products/tunnel/) | Secure ingress without public IP |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/cloudflare-zero-trust.svg" width="20"> | [**Cloudflare Zero Trust**](https://developers.cloudflare.com/cloudflare-one/) | Secure site authentication |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/postgresql.svg" width="20"> | [**PostgreSQL**](https://www.postgresql.org/) | Database for Planka and BookOrbit (with pgvector) |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/couchdb.svg" width="20"> | [**CouchDB**](https://couchdb.apache.org/) | Document database behind Obsidian LiveSync |

### Planned Services
Services planned for the future

| Logo | Name | Description |
|------|------|-------------|
| <img src="https://cdn.jsdelivr.net/gh/cncf/landscape@master/hosted_logos/k8up.svg" width="20"> | [**K8up**](https://k8up.io/) | Application-aware backups of PVC and database data |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/stalwart.svg" width="20"> | [**Stalwart**](https://stalw.art/) | Self-hosted mail server |
| <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/jellyfin.svg" width="20"> | [**Jellyfin**](https://jellyfin.org/) | Self-hosted media server |

