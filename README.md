# AI Finance Assistant

A local-first Expo finance app starter. Add income and expenses, set a monthly spending limit, review transactions, and ask the money coach questions about the entries you have saved.

## Run locally

```bash
npm install
npm run start
```

To open the browser preview, run `npm run web`.

## What works today

- Transactions and the monthly budget are saved on the device.
- Adding or deleting an income or expense updates the tracked balance and monthly totals.
- Insights and the weekly cash flow chart are calculated from saved entries.
- The money coach answers common spending, budget, category, income, savings, and balance questions using local rules.
- Demo transactions are included on first launch and can be removed from the activity list.
- Bank or UPI statement CSV rows can be imported, de-duplicated, and classified locally.
- On Android, a UPI payment request can be handed off to an installed UPI app for the user to review and authorize.

Direct bank/UPI history sync, payment confirmation, and an external AI service are not configured. The UPI handoff does not report settlement back to this app; only import or record payments after checking the UPI app. The assistant is a local preview, not a generative AI model.
