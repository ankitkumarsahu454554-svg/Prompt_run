# Security Architecture & Threat Model

## 1. Threat Model Overview
"Broke But Functional" operates as an entirely client-side, zero-backend personal financial intelligence dashboard. All financial calculations, state persistence, simulation projections, and user inputs are processed strictly on-device.

### Primary Threat Vectors & Mitigations

| Threat Vector | Potential Impact | Architecture Mitigation |
| :--- | :--- | :--- |
| **Cross-Site Scripting (XSS)** | Injection of malicious scripts via expense notes, goal titles, or imported data. | Multi-tier defense: (1) `sanitizeText()` Unicode NFKC normalization, HTML tag stripping, and bidi override stripping; (2) React text node rendering only (zero `dangerouslySetInnerHTML`); (3) Strict Content-Security-Policy. |
| **Prototype Pollution** | Hijacking `__proto__`, `constructor`, or `prototype` via imported JSON backups. | Explicit key-by-key prototype pollution sanitizer in `sanitizeJson()` before parsing, plus strict Zod schema validation (`.strict()`). |
| **Denial of Service / Storage Exhaustion** | Storage bombardment through massive payloads or infinite expense lists. | Hard 100KB limit on imported JSON strings, bounded collection size caps (≤200 expenses, ≤20 goals), and strict string truncation caps. |
| **Float Precision Exploitation** | Rounding vulnerabilities or invalid monetary amounts (NaN, Infinity, exponent notation). | Branded integer `Paise` type. String parsing strictly regex-gated `/^\d{1,7}(\.\d{1,2})?$/`, rejecting negative amounts, zero amounts, exponents, and NaN. |
| **Clickjacking & Frame Embedding** | Interface redressing attacks to manipulate user financial decisions. | `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'`. |
| **Data Leakage & Telemetry Exfiltration** | Unintended transmission of sensitive balance or financial health metrics. | Zero external APIs, zero third-party CDNs, zero remote tracking scripts, local woff2/system typography, `connect-src 'self'`. |

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
