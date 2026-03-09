# ============================================================
# ThesisHub PKA - Frontend Dockerfile (Multi-stage)
# ============================================================

# --- Stage 1: Build ---
FROM node:20-alpine AS build
WORKDIR /app

# Cache dependencies
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Build production bundle
COPY . .
RUN npm run build -- --configuration=production

# --- Stage 2: Nginx ---
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app (browser bundle only for static serving)
COPY --from=build /app/dist/app/browser /usr/share/nginx/html

# Angular SSR build produces index.csr.html, rename it to index.html for Nginx
RUN mv /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html || true

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
