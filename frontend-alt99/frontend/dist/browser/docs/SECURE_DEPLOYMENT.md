# Secure Deployment Guide

**Project:** Rust WebUI Angular Rspack Starter
**Version:** 1.0.0
**Last Updated:** 2026-03-31

---

## Overview

This guide provides security best practices for deploying the Rust WebUI Angular Rspack Starter application in production environments.

---

## 1. Pre-Deployment Security Checklist

### 1.1 Dependency Updates

**Before deployment, ensure all dependencies are updated:**

```bash
# Frontend
cd frontend
bun install
bun audit  # Review and fix vulnerabilities

# Backend
cargo update
cargo audit  # Review and fix vulnerabilities
```

### 1.2 Build Configuration

**Production build settings:**

```bash
# Frontend - Production build
cd frontend
bun run build:rspack

# Backend - Release build
cargo build --release
```

### 1.3 Security Scans

**Run security scans:**

```bash
# Frontend security tests
cd frontend
bun test security.test.ts

# Backend security audit
cargo audit
cargo clippy -- -D warnings
```

---

## 2. File Permissions

### 2.1 Database File

**Secure the database file:**

```bash
# Linux/Unix
chmod 600 app.db
chown app:app app.db

# Verify permissions
ls -la app.db
# Should show: -rw------- (600)
```

### 2.2 Configuration Files

**Secure configuration files:**

```bash
# Config file
chmod 600 config/app.config.toml
chown app:app config/app.config.toml

# Logs directory
chmod 750 logs/
chown app:app logs/
```

### 2.3 Application Binary

**Secure the application binary:**

```bash
# Binary
chmod 755 rustwebui-app
chown app:app rustwebui-app
```

---

## 3. Environment Configuration

### 3.1 Environment Variables

**Use environment variables for sensitive configuration:**

```bash
# .env (DO NOT COMMIT TO GIT)
DATABASE_PATH=/var/lib/rustwebui/app.db
LOG_LEVEL=warn
BACKUP_DIR=/var/backups/rustwebui
```

### 3.2 Configuration File

**Production config template:**

```toml
# config/app.config.toml
[app]
name = "Rust WebUI Application"
version = "1.0.0"
environment = "production"

[window]
title = "Rust WebUI Application"
width = 1280
height = 800

[database]
path = "/var/lib/rustwebui/app.db"
create_sample_data = false  # Disable in production

[logging]
level = "warn"  # Reduce logging in production
file = "/var/log/rustwebui/application.log"
append = true
max_size_mb = 50
max_files = 10

[communication]
transport = "webview_ffi"
serialization = "json"

[security]
enable_backup_encryption = true  # Enable if implemented
max_input_length = 1000  # Global input limit
```

---

## 4. Network Security

### 4.1 Firewall Configuration

**Restrict network access:**

```bash
# Allow only necessary ports
# WebUI typically uses localhost only

# UFW (Ubuntu)
ufw allow from 127.0.0.1 to any port 3000
ufw deny 3000  # Block external access

# Firewall-cmd (RHEL/CentOS)
firewall-cmd --add-rich-rule='rule family="ipv4" source address="127.0.0.1" port port="3000" protocol="tcp" accept'
```

### 4.2 Reverse Proxy (Optional)

**If exposing via web server:**

```nginx
# /etc/nginx/sites-available/rustwebui
server {
    listen 443 ssl http2;
    server_name app.example.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/app.crt;
    ssl_certificate_key /etc/ssl/private/app.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 5. Backup Security

### 5.1 Backup Location

**Store backups securely:**

```bash
# Create secure backup directory
mkdir -p /var/backups/rustwebui
chmod 700 /var/backups/rustwebui
chown app:app /var/backups/rustwebui
```

### 5.2 Backup Encryption (Recommended)

**Encrypt backups before storage:**

```bash
#!/bin/bash
# /usr/local/bin/backup-rustwebui.sh

BACKUP_DIR="/var/backups/rustwebui"
DB_PATH="/var/lib/rustwebui/app.db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY}"  # From environment

# Create backup
cp "$DB_PATH" "$BACKUP_DIR/backup_$TIMESTAMP.db"

# Encrypt backup (requires age or gpg)
age -e -o "$BACKUP_DIR/backup_$TIMESTAMP.db.age" "$BACKUP_DIR/backup_$TIMESTAMP.db"

# Remove unencrypted backup
rm "$BACKUP_DIR/backup_$TIMESTAMP.db"

# Cleanup old backups (keep 7 days)
find "$BACKUP_DIR" -name "*.age" -mtime +7 -delete
```

### 5.3 Backup Schedule

**Automated backups:**

```bash
# /etc/cron.d/rustwebui-backup
# Daily backup at 2 AM
0 2 * * * app /usr/local/bin/backup-rustwebui.sh
```

---

## 6. Logging Security

### 6.1 Log Location

**Secure log files:**

```bash
# Create log directory
mkdir -p /var/log/rustwebui
chmod 750 /var/log/rustwebui
chown app:app /var/log/rustwebui

# Log file
touch /var/log/rustwebui/application.log
chmod 640 /var/log/rustwebui/application.log
chown app:app /var/log/rustwebui/application.log
```

### 6.2 Log Rotation

**Configure log rotation:**

```bash
# /etc/logrotate.d/rustwebui
/var/log/rustwebui/application.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 640 app app
    postrotate
        systemctl reload rustwebui 2>/dev/null || true
    endscript
}
```

### 6.3 Log Monitoring

**Monitor for security events:**

```bash
# Watch for errors
tail -f /var/log/rustwebui/application.log | grep -i "error\|fail\|denied"

# Search for suspicious activity
grep "Invalid backend function" /var/log/rustwebui/application.log
grep "Validation failed" /var/log/rustwebui/application.log
```

---

## 7. User Access Control

### 7.1 Application User

**Run as dedicated user:**

```bash
# Create application user
useradd -r -s /bin/false -d /var/lib/rustwebui app

# Set ownership
chown -R app:app /var/lib/rustwebui
chown -R app:app /var/log/rustwebui
chown -R app:app /var/backups/rustwebui
```

### 7.2 Systemd Service

**Secure service configuration:**

```ini
# /etc/systemd/system/rustwebui.service
[Unit]
Description=Rust WebUI Application
After=network.target

[Service]
Type=simple
User=app
Group=app
WorkingDirectory=/var/lib/rustwebui
ExecStart=/var/lib/rustwebui/rustwebui-app
Restart=on-failure
RestartSec=5

# Security Hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/lib/rustwebui /var/log/rustwebui
PrivateTmp=true
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true

# Resource Limits
LimitNOFILE=65535
LimitNPROC=64

[Install]
WantedBy=multi-user.target
```

---

## 8. Security Monitoring

### 8.1 File Integrity Monitoring

**Monitor critical files:**

```bash
# Install AIDE or similar
apt install aide  # Debian/Ubuntu

# Initialize database
aideinit

# Schedule regular checks
# /etc/cron.daily/aide
aide --check
```

### 8.2 Intrusion Detection

**Basic intrusion detection:**

```bash
# Monitor for unauthorized access
auditctl -w /var/lib/rustwebui/app.db -p rwxa -k rustwebui_db

# View audit logs
ausearch -k rustwebui_db
```

---

## 9. Incident Response

### 9.1 Security Incident Checklist

**If security breach suspected:**

1. **Isolate**: Disconnect from network if necessary
2. **Preserve**: Don't modify logs or evidence
3. **Document**: Record timeline and actions
4. **Assess**: Determine scope of breach
5. **Notify**: Inform stakeholders
6. **Remediate**: Fix vulnerability
7. **Recover**: Restore from clean backup
8. **Review**: Post-incident analysis

### 9.2 Contact Information

**Emergency contacts:**

```
Security Team: security@example.com
System Admin: admin@example.com
Management: management@example.com
```

---

## 10. Compliance Considerations

### 10.1 Data Protection

**If handling personal data:**

- [ ] Implement data encryption at rest
- [ ] Implement data encryption in transit
- [ ] Enable audit logging
- [ ] Implement data retention policies
- [ ] Enable data deletion capabilities
- [ ] Document data processing activities

### 10.2 Industry Standards

**Relevant standards:**

- **OWASP Top 10**: Web application security
- **CIS Benchmarks**: System hardening
- **NIST Cybersecurity Framework**: Risk management

---

## 11. Maintenance

### 11.1 Regular Updates

**Update schedule:**

```bash
# Weekly: Check for dependency updates
cd frontend && bun audit
cargo audit

# Monthly: Apply security patches
bun update
cargo update

# Quarterly: Full security review
- Review logs
- Check file permissions
- Verify backup integrity
- Update documentation
```

### 11.2 Security Audits

**Schedule regular audits:**

- **Monthly**: Automated vulnerability scans
- **Quarterly**: Manual security review
- **Annually**: Third-party penetration test

---

## Appendix A: Quick Reference

### File Permissions Summary

| Path | Permissions | Owner |
|------|-------------|-------|
| `app.db` | 600 | app:app |
| `config/` | 750 | app:app |
| `logs/` | 750 | app:app |
| `backups/` | 700 | app:app |
| Binary | 755 | app:app |

### Port Summary

| Service | Port | Access |
|---------|------|--------|
| WebUI | Internal | Localhost only |
| HTTPS (proxy) | 443 | External (if proxied) |

### Log Locations

| Log | Path |
|-----|------|
| Application | `/var/log/rustwebui/application.log` |
| System | `/var/log/syslog` or `/var/log/messages` |
| Audit | `/var/log/audit/audit.log` |

---

**Document Version:** 1.0
**Last Review:** 2026-03-31
**Next Review:** 2026-06-30
