# Its Real-time chat application with notification


**Basic notes on rateLimiting**
### 🔐 Rate Limiting Strategy (Stage-Based Protection)

To improve API security and prevent abuse (like brute-force attacks), I implemented **stage-based rate limiting** using Redis:

* **Before Login (Unauthenticated Users)**
  Rate limiting is applied based on **IP address** to control overall traffic.

* **During Login (Authentication Stage)**
  Rate limiting uses a combination of **email + IP address** to prevent targeted brute-force attacks on specific accounts.

* **After Login (Authenticated Users)**
  Rate limiting is applied using **userId**, ensuring fair usage and preventing abuse by logged-in users.

This layered approach provides:

* Better protection against brute-force attacks
* More accurate request tracking at different stages
* Scalable and production-ready rate limiting using Redis


### 🚫 Skipping Trusted Requests in Rate Limiting

To avoid unnecessary rate limiting on internal or system-critical routes, I implemented a **skip mechanism** in the rate limiter.

* Certain routes like `/health` are excluded from rate limiting.
* This ensures that internal services (e.g., monitoring tools, load balancers) can access these endpoints without being blocked.
* Helps maintain system reliability and prevents false downtime detection.

This improves overall stability while still protecting APIs from abuse.
This is used only on global rateLimiting because it is added on every routes so, we want to avoid it on `/health` route

### Success Reset in Authentication

After a successful login, all failed login attempts and account lock states are cleared from Redis. This prevents legitimate users from being locked out due to previous failed attempts.

This ensures:
- Better user experience
- Accurate tracking of failed attempts
- Proper balance between security and usability

### Trust Proxy in Express

The application enables `trust proxy` to correctly identify the real client IP when running behind a reverse proxy (e.g., Nginx, Cloudflare, or cloud platforms).

This ensures:
- Accurate rate limiting based on real user IP
- Proper security tracking
- Prevention of false rate limit blocking

Configuration:
app.set("trust proxy", 1);