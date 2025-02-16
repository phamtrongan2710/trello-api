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