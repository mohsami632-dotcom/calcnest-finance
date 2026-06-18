# CalcNest Finance

CalcNest Finance is a static, browser-only financial calculator hub for personal and business finance. It includes loan, investment, banking, tax, business, and personal finance calculators with a professional fintech interface.

## How to run locally

Open `index.html` directly in a browser, or serve the folder with a static server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy on Netlify

1. Create a new Netlify site.
2. Drag and drop this folder, or connect the folder through a Git repository.
3. Leave the build command blank.
4. Set the publish directory to the project root if deploying only this folder.

The same files can also be deployed to Vercel or GitHub Pages as a static site.

## Calculators included

- EMI Calculator
- SIP Calculator
- Lumpsum Investment Calculator
- Compound Interest Calculator
- Simple Interest Calculator
- Fixed Deposit Calculator
- Recurring Deposit Calculator
- GST Calculator
- Salary Calculator
- Income Tax Calculator
- Loan Eligibility Calculator
- Home Loan Calculator
- Car Loan Calculator
- Personal Loan Calculator
- Retirement Calculator
- Inflation Calculator
- CAGR Calculator
- ROI Calculator
- Percentage Calculator
- Currency Converter

## Formula notes

- EMI: `EMI = P * r * (1+r)^n / ((1+r)^n - 1)`
- SIP: `FV = P * [((1+i)^n - 1) / i] * (1+i)`
- Lumpsum: `FV = P * (1+r)^t`
- Compound Interest and FD: `A = P * (1 + r/n)^(n*t)`
- Simple Interest: `SI = P * R * T / 100`
- RD: monthly deposits are assumed to be made at month-end and compound monthly until maturity.
- GST: add GST with `total = base * (1 + rate)` and remove GST with `base = total / (1 + rate)`.
- CAGR: `((Ending Value / Beginning Value)^(1 / Years) - 1) * 100`
- ROI: `((Gain - Cost) / Cost) * 100`
- Inflation: `Future Cost = Present Cost * (1 + inflation)^years`
- Currency converter: `Converted Amount = Source Amount * Entered Exchange Rate`

The income tax calculator uses editable sample slab JSON. Tax rules vary by country and change over time, so review the JSON before using it for planning.

The header currency chooser controls the symbols and regional number formatting used by financial calculator results. It does not convert the numeric values entered. The currency converter supports all listed currency pairs with a user-entered current rate; no live exchange-rate API is used.

## Quality and testing

The site includes a hidden formula self-check runner exposed in the console:

```js
CalcNestFinance.runFormulaSelfChecks()
```

Each calculator has example values, validation, reset, copy result, and CSV download support. EMI, home loan, car loan, and personal loan tools include amortization tables. SIP includes a year-wise growth table.

## Disclaimer

This website provides estimates only and is not financial advice. Verify tax, loan, investment, insurance, and currency decisions with official rules, product documents, financial providers, or a qualified professional.

## Future improvement ideas

- Add downloadable PDF reports.
- Add printable comparison pages.
- Add user-managed custom calculator presets in local storage.
- Add more tax years as selectable presets.
- Add PPF, NPS, SWP, and credit card payoff calculators.
