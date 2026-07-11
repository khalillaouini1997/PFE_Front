FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build -- --configuration production

FROM nginx:alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=build /app/dist/web_admin/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
RUN rm -f /etc/nginx/conf.d/default.conf && \
    chown -R appuser:appgroup /usr/share/nginx/html /var/cache/nginx /var/run /etc/nginx/conf.d && \
    chmod -R 755 /var/cache/nginx /var/run
USER appuser
EXPOSE 4200
HEALTHCHECK --interval=15s --timeout=5s --retries=3 --start-period=10s \
  CMD wget --spider -q http://localhost:4200/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
