# NakoPay for n8n

Accept Bitcoin and other crypto in n8n with a one-flat-fee, non-custodial
checkout. Wallet-to-wallet - NakoPay never holds your funds.

[![Status](https://img.shields.io/badge/status-stable-blue)](https://nakopay.com/integrations)
[![License](https://img.shields.io/badge/license-MIT-green)](../LICENSE)

## Install

```
npm install n8n-nodes-nakopay (or via n8n UI: Settings → Community Nodes)
```

## Configure

1. Get an API key from <https://nakopay.com/dashboard/api-keys>.
2. In n8n admin: Add a NakoPay credential in Credentials
3. Set the webhook URL shown in the plugin settings inside your NakoPay
   dashboard (Settings → Webhooks).

## Test mode

Use `sk_test_*` keys to run the full checkout against the NakoPay sandbox.
No real funds move. Flip to `sk_live_*` when you're ready for production.

## Supported features

- [x] Triggers: `invoice.paid`, `invoice.failed`, `refund.created`
- [x] Actions: create invoice, void invoice, look up customer
- [x] Polling + webhook subscriptions
- [x] Test mode

## Local development

See [`../CONTRIBUTING.md`](../CONTRIBUTING.md) for the full setup. Quick
start for TypeScript plugins:

- TypeScript stack: see CONTRIBUTING § "Local development per host".
- Run `bash ../scripts/check-no-internal-urls.sh .` before opening a PR.

## Release

Tag-driven from the monorepo:

```
plugins/scripts/release.sh n8n 0.1.0
```

The matching workflow at `.github/workflows/release-n8n.yml` handles the
upload to the marketplace. Full runbook in [`../PUBLISHING.md`](../PUBLISHING.md).

## Issues

File on <https://github.com/NakoPayHQ/plugin-n8n/issues>.

## License

MIT - see [`../LICENSE`](../LICENSE).
