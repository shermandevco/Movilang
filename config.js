// MoviLang — налаштування підключення до бази даних Supabase.
// Поки поля порожні, сайт працює в ДЕМО-режимі (дані лише в браузері).
// Як заповнити — див. README.md, крок 2.
// Адреса сайту. Щоб змінити домен: python3 tools/set-domain.py нова-адреса.pl
window.MOVILANG_SITE = {
  URL: "https://movilang.pages.dev",   // головна адреса сайту
  REDIRECT_FROM: ["movielang.pages.dev"]                     // старі адреси, з яких автоматично перекидати на URL
};
window.MOVILANG_CONFIG = {
  SUPABASE_URL: "https://qbzrnvwijfupkthuvilg.supabase.co",       // напр. "https://abcdefgh.supabase.co"
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFienJudndpamZ1cGt0aHV2aWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1NTc5NzMsImV4cCI6MjExMTEzMzk3M30._-oigTYNXlDSUeDa6-l1PBoCyrjSr5_EMLXPe6cEfLQ"   // Project Settings → API → anon public key
};
