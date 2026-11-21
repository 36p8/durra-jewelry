#!/usr/bin/env bash
# =============================================================================
#  دُرّة — DURRA · دار المجوهرات الفاخرة
#  دليل المشروع وسكربت تشغيله
#
#  متجر مجوهرات عربي فاخر (RTL) أُعيد بناؤه من مشروع PHP/MySQL
#  github.com/36p8/luxury_jewelry_store بهوية جديدة مستقلة ومنصة حديثة:
#    React 19 + Vite + Tailwind 4  |  Express + tRPC 11  |  MySQL + Drizzle ORM
#
#  الاستخدام:
#    bash README.sh            عرض وصف المشروع
#    bash README.sh help       عرض الأوامر المتاحة
#    bash README.sh setup      تثبيت الاعتماديات وتهيئة قاعدة البيانات وبذر المنتجات
#    bash README.sh dev        تشغيل خادم التطوير (http://localhost:${PORT:-3000})
#    bash README.sh build      بناء نسخة الإنتاج
#    bash README.sh start      تشغيل نسخة الإنتاج
#    bash README.sh check      فحص الأنواع والاختبارات
#    bash README.sh seed       بذر الكتالوج (يضيف فقط القطع غير الموجودة)
#    bash README.sh docker     بناء صورة Docker وتشغيلها
#    bash README.sh env        التحقق من متغيرات البيئة
#
#  التفاصيل الكاملة في README.md
# =============================================================================
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

SEA=$'\033[38;5;30m'; SAND=$'\033[38;5;180m'; BOLD=$'\033[1m'; DIM=$'\033[2m'; RED=$'\033[31m'; GREEN=$'\033[32m'; RESET=$'\033[0m'
step() { printf '\n%s▸ %s%s\n' "$SEA$BOLD" "$1" "$RESET"; }
ok()   { printf '%s✓ %s%s\n' "$GREEN" "$1" "$RESET"; }
fail() { printf '%s✗ %s%s\n' "$RED" "$1" "$RESET" >&2; exit 1; }

banner() {
  cat <<EOF
${SEA}${BOLD}
   ╔══════════════════════════════════════════════╗
   ║           دُرّة  ·  D U R R A                ║
   ║       دار المجوهرات الفاخرة — منذ اللؤلؤة       ║
   ╚══════════════════════════════════════════════╝${RESET}
EOF
}

describe() {
  banner
  cat <<EOF

${BOLD}عن المشروع${RESET}
  متجر مصغّر للمجوهرات الفاخرة على غرار مواقع الدور العالمية مثل بولغري،
  بهوية مستقلة مستوحاة من تراث الغوص على اللؤلؤ في الخليج، بأسلوب «لؤلؤة البحر»: أخضر بحري ${SEA}#0F4C4A${RESET}، رملي ${SAND}#E8DCC8${RESET}،
  أبيض صدفي #F6F1E8، وخط Tajawal، وتخطيط تحريري غير متماثل، مع وضع فاتح وداكن.

${BOLD}الصفحات والمزايا${RESET}
  /                 الرئيسية: واجهة افتتاحية ومجموعات وتصنيفات وقصة الدار
  /collections      الكتالوج: تصفية حسب التصنيف وبحث وترتيب حسب السعر
  /product/:slug    المنتج: معرض صور ومواصفات واختيار لون وسلة ومفضلة
  /cart             السلة: محفوظة لكل مستخدم، مع تعديل الكميات والإجمالي
  /checkout         إتمام الطلب: عنوان الشحن والدفع عند الاستلام والشحن مجاني
  /favorites        المفضلة: مع النقل إلى السلة
  /account          حسابي: سجل الطلبات وحالتها
  /about /gallery /contact   صفحات المحتوى، ورسائل التواصل تُحفظ في القاعدة
  /admin            لوحة المسؤول: إحصاءات وإدارة المنتجات والطلبات والرسائل

${BOLD}الإشعارات${RESET}
  يصل إشعار تلقائي إلى المالك عند كل طلب جديد أو رسالة تواصل جديدة.

${BOLD}التقنيات${RESET}
  الواجهة   React 19, Vite, Tailwind 4, shadcn/ui, wouter, framer-motion, recharts
  الخادم    Node.js, Express, tRPC 11, zod, superjson
  البيانات  MySQL + Drizzle ORM (users, products, cart_items, favorites,
            orders, order_items, contact_messages)
  المصادقة  Manus OAuth، والمالك يصبح مسؤولاً تلقائياً
  الجودة    TypeScript و Vitest

${DIM}للأوامر المتاحة: bash README.sh help    ·    التفاصيل: README.md${RESET}
EOF
}

usage() {
  banner
  sed -n '/^#  الاستخدام:/,/^#  التفاصيل/p' "${BASH_SOURCE[0]}" | sed 's/^#  \{0,1\}//'
}

need() { command -v "$1" >/dev/null 2>&1 || fail "الأداة '$1' غير مثبتة. $2"; }

check_tools() {
  need node "ثبّت Node.js 20 أو أحدث من https://nodejs.org"
  local major; major="$(node -p 'process.versions.node.split(".")[0]')"
  [ "$major" -ge 20 ] || fail "يلزم Node.js 20 أو أحدث (الحالي: $(node -v))"
  if ! command -v pnpm >/dev/null 2>&1; then
    step "تفعيل pnpm عبر corepack"
    corepack enable && corepack prepare pnpm@10.18.0 --activate
  fi
  ok "Node $(node -v) · pnpm $(pnpm -v)"
}

load_env() { if [ -f .env ]; then set -a; . ./.env; set +a; fi; }

check_env() {
  load_env
  step "التحقق من متغيرات البيئة"
  [ -n "${DATABASE_URL:-}" ] || fail "DATABASE_URL غير مضبوط. أنشئ ملف .env (راجع README.md)."
  ok "DATABASE_URL مضبوط"
  local v
  for v in MANUS_JWT_SECRET MANUS_PROJECT_ID MANUS_OAUTH_API_URL MANUS_API_URL MANUS_API_KEY OWNER_OPEN_ID; do
    if [ -n "${!v:-}" ]; then ok "$v مضبوط"; else printf '%s! %s غير مضبوط: تسجيل الدخول أو الإشعارات أو رفع الصور لن تعمل%s\n' "$SAND" "$v" "$RESET"; fi
  done
}

cmd="${1:-describe}"
case "$cmd" in
  describe|"") describe ;;
  help|-h|--help) usage ;;
  env) check_env ;;
  setup)
    banner; check_tools
    step "تثبيت الاعتماديات"; pnpm install --frozen-lockfile
    check_env
    step "تطبيق ترحيلات قاعدة البيانات"; pnpm db:migrate
    step "بذر كتالوج المنتجات"; pnpm tsx scripts/seed.ts
    ok "اكتملت التهيئة. شغّل: bash README.sh dev" ;;
  dev)   check_tools; load_env; step "خادم التطوير على http://localhost:${PORT:-3000}"; exec pnpm dev ;;
  build) check_tools; step "بناء نسخة الإنتاج"; pnpm build; ok "الناتج في dist/" ;;
  start) load_env; [ -f dist/index.js ] || fail "لا توجد نسخة مبنية. نفّذ أولاً: bash README.sh build"; exec pnpm start ;;
  seed)  check_tools; check_env; step "بذر الكتالوج"; pnpm tsx scripts/seed.ts ;;
  check) check_tools; step "فحص الأنواع"; pnpm check; step "الاختبارات"; pnpm test; ok "جميع الفحوص ناجحة" ;;
  docker)
    need docker "ثبّت Docker من https://docs.docker.com/get-docker/"
    [ -f .env ] || fail "ملف .env مطلوب لتشغيل الحاوية"
    step "بناء صورة durra"; docker build -t durra .
    step "تشغيل الحاوية على المنفذ ${PORT:-3000}"; exec docker run --rm -p "${PORT:-3000}:3000" --env-file .env durra ;;
  *) printf '%sأمر غير معروف: %s%s\n' "$RED" "$cmd" "$RESET" >&2; usage; exit 1 ;;
esac
