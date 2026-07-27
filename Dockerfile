FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Next.js embeds NEXT_PUBLIC_ vars at build time
ARG NEXT_PUBLIC_BACKEND_URL=http://13.61.132.125:8000
ARG NEXT_PUBLIC_SUPABASE_URL=https://ujfncdiaindtuioqathr.supabase.co
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_UJV0wF2SZDzmhlE1O6zGRw_F9izd58j

ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
