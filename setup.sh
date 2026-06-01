#!/usr/bin/env bash
# =============================================================================
# setup.sh — One-time server setup for jwt-demo on AlmaLinux 8 (Hostinger VPS)
# Run as: bash setup.sh
# =============================================================================

set -e  # Exit immediately if any command fails

# ─── Colour helpers ──────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}[OK]${NC}   $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $*"; }
die()     { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

# ─── 0. Sudo check ───────────────────────────────────────────────────────────
# Ensure the user can run sudo before attempting any privileged commands.
info "Checking sudo access..."
sudo -n true 2>/dev/null || sudo true || die "This script requires sudo access. Re-run as a user with sudo privileges."
success "Sudo access confirmed."

# ─── 1. Collect inputs ───────────────────────────────────────────────────────
# Ask for the GitHub repo URL upfront so the script runs unattended after this.
echo ""
read -rp "Enter your GitHub repo URL (e.g. https://github.com/your-user/jwt-demo): " REPO_URL
[[ -z "$REPO_URL" ]] && die "Repo URL cannot be empty."

DEPLOY_PATH="/var/www/jwt-demo"
BACKEND_PORT="8001"
SERVICE_NAME="jwt-demo"
NGINX_CONF="/etc/nginx/conf.d/jwt-demo.conf"
DEPLOY_KEY="$HOME/.ssh/jwt_demo_deploy"
CURRENT_USER="$(whoami)"

echo ""
info "Deploy path : $DEPLOY_PATH"
info "Backend port: $BACKEND_PORT"
info "Systemd unit: $SERVICE_NAME"
info "Nginx config: $NGINX_CONF"
echo ""

# ─── 2. System packages ──────────────────────────────────────────────────────
# Install Git, Python 3.11, Node 18, and Nginx if not already present.
info "Installing system packages (git, python3.11, node 18, nginx)..."

sudo dnf install -y git nginx 2>&1 | grep -E "^(Installing|Already installed|Nothing to do)" || true

# Python 3.11 — available via EPEL/AppStream on AlmaLinux 8
if ! command -v python3.11 &>/dev/null; then
    sudo dnf install -y python3.11 python3.11-pip 2>&1 | grep -E "^(Installing|Nothing to do)" || true
else
    success "python3.11 already installed: $(python3.11 --version)"
fi

# Node 18 — install via NodeSource if `node` is missing or too old
NODE_MAJOR=$(node --version 2>/dev/null | sed 's/v//' | cut -d. -f1 || echo "0")
if [[ "$NODE_MAJOR" -lt 18 ]]; then
    info "Installing Node.js 18 via NodeSource..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo dnf install -y nodejs
else
    success "Node $(node --version) already installed."
fi

success "All system packages ready."

# ─── 3. Firewall ─────────────────────────────────────────────────────────────
# Open HTTP (80) and HTTPS (443) if firewalld is running.
if sudo systemctl is-active --quiet firewalld; then
    info "Opening HTTP/HTTPS ports in firewalld..."
    sudo firewall-cmd --permanent --add-service=http  2>/dev/null || true
    sudo firewall-cmd --permanent --add-service=https 2>/dev/null || true
    sudo firewall-cmd --reload
    success "Firewall rules applied."
else
    warn "firewalld is not active — skipping firewall configuration."
fi

# ─── 4. Clone repo ───────────────────────────────────────────────────────────
# Clone the GitHub repo into the deploy path (skip if already present).
info "Setting up deploy directory at $DEPLOY_PATH..."
sudo mkdir -p "$DEPLOY_PATH"
sudo chown "$CURRENT_USER":"$CURRENT_USER" "$DEPLOY_PATH"

if [[ -d "$DEPLOY_PATH/.git" ]]; then
    warn "Repo already cloned at $DEPLOY_PATH — skipping clone."
else
    git clone "$REPO_URL" "$DEPLOY_PATH"
    success "Repo cloned to $DEPLOY_PATH."
fi

# ─── 5. Python virtual environment & backend deps ────────────────────────────
# Create a venv inside the deploy path and install backend requirements.
info "Setting up Python virtual environment..."
python3.11 -m venv "$DEPLOY_PATH/venv"
"$DEPLOY_PATH/venv/bin/pip" install --upgrade pip -q
"$DEPLOY_PATH/venv/bin/pip" install -r "$DEPLOY_PATH/backend/requirements.txt" -q
success "Python dependencies installed."

# ─── 6. Environment file ─────────────────────────────────────────────────────
# Copy .env.example to .env if .env doesn't already exist.
ENV_FILE="$DEPLOY_PATH/backend/.env"
if [[ ! -f "$ENV_FILE" ]]; then
    cp "$DEPLOY_PATH/backend/.env.example" "$ENV_FILE"
    warn "Copied .env.example → .env. *** ACTION REQUIRED: Edit $ENV_FILE and set SECRET_KEY and other values ***"
else
    warn "$ENV_FILE already exists — skipping copy. Make sure it has the correct values."
fi

# ─── 7. Frontend build ───────────────────────────────────────────────────────
# Install Node dependencies and build the React/Vite frontend.
info "Building frontend..."
cd "$DEPLOY_PATH/frontend"
npm install --silent
npm run build
success "Frontend built. Static files are in $DEPLOY_PATH/frontend/dist/"

# ─── 8. Systemd service ──────────────────────────────────────────────────────
# Create a systemd unit file to run the FastAPI backend and enable it.
info "Creating systemd service: $SERVICE_NAME..."

sudo tee /etc/systemd/system/${SERVICE_NAME}.service > /dev/null <<EOF
[Unit]
Description=codecrumbs jwt-demo FastAPI backend
After=network.target

[Service]
# Run as the current VPS user — change if you create a dedicated service user
User=${CURRENT_USER}

# Absolute path to the backend source
WorkingDirectory=${DEPLOY_PATH}/backend

# Load secrets from the .env file
EnvironmentFile=${DEPLOY_PATH}/backend/.env

# Bind only to loopback — Nginx will proxy public traffic
ExecStart=${DEPLOY_PATH}/venv/bin/uvicorn main:app --host 127.0.0.1 --port ${BACKEND_PORT}

# Restart automatically on crash with a short cooldown
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE_NAME"
sudo systemctl start  "$SERVICE_NAME"

# Quick health check — give uvicorn 3 seconds to start
sleep 3
if curl -sf "http://127.0.0.1:${BACKEND_PORT}/health" > /dev/null; then
    success "Backend is up: http://127.0.0.1:${BACKEND_PORT}/health"
else
    warn "Backend health check failed. Check: sudo journalctl -u ${SERVICE_NAME} -n 30"
fi

# ─── 9. Nginx config ─────────────────────────────────────────────────────────
# Write an Nginx server block that serves the built frontend and proxies /api/
# to the FastAPI backend. Replace YOUR_DOMAIN_OR_IP before going live.
info "Writing Nginx config to $NGINX_CONF..."

sudo tee "$NGINX_CONF" > /dev/null <<'NGINXEOF'
# jwt-demo Nginx config
# TODO: Replace YOUR_DOMAIN_OR_IP with your actual domain or server IP.
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    # Serve the Vite build output
    root /var/www/jwt-demo/frontend/dist;
    index index.html;

    # SPA fallback so React handles client-side routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy /api/* to the FastAPI backend on port 8001
    location /api/ {
        proxy_pass         http://127.0.0.1:8001;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
    }
}
NGINXEOF

sudo nginx -t && sudo systemctl reload nginx
success "Nginx config written and reloaded."

# ─── 10. SSH deploy key ──────────────────────────────────────────────────────
# Generate an ED25519 deploy key used by GitHub Actions to SSH into this server.
info "Generating SSH deploy key at $DEPLOY_KEY..."

if [[ -f "$DEPLOY_KEY" ]]; then
    warn "Deploy key already exists at $DEPLOY_KEY — skipping generation."
else
    ssh-keygen -t ed25519 -C "github-actions-jwt-demo" -f "$DEPLOY_KEY" -N ""
    # Authorise the key for incoming SSH connections on this server
    cat "${DEPLOY_KEY}.pub" >> "$HOME/.ssh/authorized_keys"
    chmod 600 "$HOME/.ssh/authorized_keys"
    success "Deploy key created and added to authorized_keys."
fi

# ─── 11. Final checklist ─────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  SETUP COMPLETE — things still needed from you:           ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  1. ${YELLOW}Edit the .env file${NC}"
echo -e "     nano ${ENV_FILE}"
echo -e "     → Set SECRET_KEY to something long and random"
echo ""
echo -e "  2. ${YELLOW}Set your domain/IP in the Nginx config${NC}"
echo -e "     sudo nano ${NGINX_CONF}"
echo -e "     → Replace YOUR_DOMAIN_OR_IP with your actual domain or IP"
echo -e "     → Then: sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo -e "  3. ${YELLOW}Add these GitHub secrets in your repo Settings → Secrets:${NC}"
echo -e "     SSH_HOST        = your VPS IP or hostname"
echo -e "     SSH_USER        = ${CURRENT_USER}"
echo -e "     SSH_PRIVATE_KEY = (see below)"
echo ""
echo -e "  4. ${YELLOW}Add this line to /etc/sudoers.d/jwt-demo${NC} (run the command below):"
echo -e "     sudo sh -c 'echo \"${CURRENT_USER} ALL=(ALL) NOPASSWD: /bin/systemctl restart ${SERVICE_NAME}\" > /etc/sudoers.d/jwt-demo'"
echo ""
echo -e "  5. ${YELLOW}(Optional) Run Certbot for HTTPS once your domain is live:${NC}"
echo -e "     sudo dnf install -y certbot python3-certbot-nginx"
echo -e "     sudo certbot --nginx -d YOUR_DOMAIN"
echo ""
echo -e "${CYAN}══ SSH_PRIVATE_KEY — copy everything between the lines ══${NC}"
cat "$DEPLOY_KEY"
echo -e "${CYAN}════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  Public key (already in authorized_keys — no action needed):"
cat "${DEPLOY_KEY}.pub"
echo ""
