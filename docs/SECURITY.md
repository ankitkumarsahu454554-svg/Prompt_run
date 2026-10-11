# Security Architecture & Threat Model

## 1. Threat Model Overview
"Broke But Functional" operates as an entirely client-side, zero-backend personal financial intelligence dashboard. All financial calculations, state persistence, simulation projections, and user inputs are processed strictly on-device.

### Primary Threat Vectors, Mitigations & Verification
 
| Threat | Mitigation | Implementation File | Automated Test |
| :--- | :--- | :--- | :--- |
| **Cross-Site Scripting (XSS)** via notes, descriptions, or names | Multi-tier defense: (1) `sanitizeText()` Unicode NFKC normalization, strip all HTML tags (`/<[^>]*>/g`); (2) React text node rendering only (zero `dangerouslySetInnerHTML`); (3) Strict CSP. | `src/lib/sanitize.ts`<br>`src/app/layout.tsx` | `tests/security.test.ts`<br>`tests/lib/sanitize.test.ts` |
| **Bidirectional (Bidi) Text Override** visual spoofing | Strips all bidirectional override control characters (`\u202A`–`\u202E`, `\u2066`–`\u2069`) to prevent financial figure reordering in UI. | `src/lib/sanitize.ts` | `tests/security.test.ts`<br>`tests/lib/sanitize.test.ts` |
| **Prototype Pollution** via imported JSON backups | String-level and key-level rejection of `__proto__`, `constructor`, `prototype` before JSON parsing, backed by strict Zod schema validation (`.strict()`). | `src/store/persistence.ts` | `tests/security.test.ts`<br>`tests/store/persistence.test.ts` |
| **Denial of Service & Storage Exhaustion** | Strict 100KB payload limit on imported JSON strings, bounded collection size caps (≤200 expenses, ≤20 goals), and input length truncation (≤40 / ≤120 chars). | `src/lib/sanitize.ts`<br>`src/store/persistence.ts` | `tests/security.test.ts`<br>`tests/store/persistence.test.ts` |
| **Floating-Point Precision & Monetary Tampering** | Branded integer `Paise` type prevents floating point drift. String parsing strictly regex-gated `/^\d{1,7}(\.\d{1,2})?$/`, rejecting negative amounts, zero amounts, exponents (`1e6`), and `NaN`. | `src/domain/money.ts`<br>`src/lib/sanitize.ts` | `tests/domain/money.test.ts`<br>`tests/security.test.ts` |
| **Corrupted or Tampered LocalStorage** | Automatic schema validation via Zod; invalid structure triggers automatic safe rollback to calibrated seed state without unhandled runtime crash. | `src/store/persistence.ts`<br>`src/lib/schemas.ts` | `tests/store/persistence.test.ts`<br>`e2e/storage-recovery.spec.ts` |
| **Clickjacking & UI Redressing** | HTTP response headers configure `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'` to block embedding into external iframes. | `next.config.ts` | `tests/security.test.ts` |
| **Data Leakage & Telemetry Exfiltration** | Zero external API calls, zero remote fonts/CDNs, zero client telemetry, CSP `connect-src 'self'`. All data stored strictly on-device in browser `localStorage`. | `next.config.ts`<br>`src/store/persistence.ts` | `tests/security.test.ts`<br>`scripts/run-lighthouse.mjs` |

---

## 2. Input Sanitization Pipeline (`src/lib/sanitize.ts`)
1. **Unicode Normalization**: Applies `String.prototype.normalize("NFKC")` to resolve visual spoofing and homoglyphs.
2. **HTML Tag Stripping**: Replaces all HTML tag constructs (`/<[^>]*>/g`) with empty strings.
3. **Bidi Override Character Removal**: Explicitly removes bidirectional override control characters (`\u202A`–`\u202E`, `\u2066`–`\u2069`) to prevent visual reordering attacks.
4. **Length Enforcement**: Clamps labels to ≤40 characters and notes to ≤120 characters.
5. **Numerical Amount Parsing**: Strictly matches against `/^\d{1,7}(\.\d{1,2})?$/`, rejecting any floating point artifacts or exponent notation before converting directly into integer paise.

---

## 3. Storage & JSON Portability Defense (`src/store/persistence.ts`)
1. **Size Verification**: Blocks any import payload exceeding 100,000 bytes (100KB) immediately.
2. **Key Inspection**: Recursively checks and eliminates any object keys matching `__proto__`, `constructor`, or `prototype`.
3. **Zod Validation**: Validates the entire payload against `financeStateSchema` (`z.object({...}).strict()`).
4. **Graceful Fallback**: If parsing or validation fails, it safely falls back to the default calibrated demo seed without crashing or corrupting existing storage.

---

## 4. HTTP Headers & Content Security Policy (`next.config.ts`)
- **Content-Security-Policy**:
  `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';`
- **X-Content-Type-Options**: `nosniff`
- **Referrer-Policy**: `strict-origin-when-cross-origin`
- **X-Frame-Options**: `DENY`
- **Permissions-Policy**: `camera=(), microphone=(), geolocation=(), payment=()`
- **X-Powered-By**: Disabled (`poweredByHeader: false`)
