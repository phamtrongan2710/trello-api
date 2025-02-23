import { env } from '~/config/environment'

// Những domains được phép truy cập tới tài nguyên của server
export const WHITELIST_DOMAINS = [
  // Không cần localhost nữa vì ở file config/cors luôn cho phép môi trường dev
  // 'http://localhost:5173'
  'https://trello-web-ashy.vercel.app'
]

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

export const WEBSITE_DOMAIN = env.BUILD_MODE === 'production' ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT