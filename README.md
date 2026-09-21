# My website

This repository contains my personal website for [carishabdahal.com.np](https://carishabdahal.com.np).

## Deployment

The site is deployed automatically to GitHub Pages whenever changes are pushed to
`main`. The repository's `CNAME` file configures the custom domain
`carishabdahal.com.np`.

To finish the setup:

1. In **Settings → Pages**, set the source to **GitHub Actions**.
2. In Cloudflare DNS, create these four `A` records for the root (`@`) domain:
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and
   `185.199.111.153`. Leave the proxy disabled while GitHub validates the
   domain. Optionally, create a `CNAME` record for `www` pointing to
   `riishabb.github.io`.
3. After the first successful deployment, enable **Enforce HTTPS** in
   **Settings → Pages**.
