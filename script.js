"use strict";

const TAX_SOURCE_URL = "";

const TAX_CONFIG = {
  new: {
    label: "Sample New Regime (edit for your country)",
    rebateLimit: 60000,
    rebateIncomeLimit: 1200000,
    cessRate: 4,
    marginalRelief: true,
    surcharge: [
      { above: 50000000, rate: 25 },
      { above: 20000000, rate: 25 },
      { above: 10000000, rate: 15 },
      { above: 5000000, rate: 10 }
    ],
    ageGroups: {
      below60: [
        { upTo: 400000, rate: 0 },
        { upTo: 800000, rate: 5 },
        { upTo: 1200000, rate: 10 },
        { upTo: 1600000, rate: 15 },
        { upTo: 2000000, rate: 20 },
        { upTo: 2400000, rate: 25 },
        { upTo: null, rate: 30 }
      ],
      senior: [
        { upTo: 400000, rate: 0 },
        { upTo: 800000, rate: 5 },
        { upTo: 1200000, rate: 10 },
        { upTo: 1600000, rate: 15 },
        { upTo: 2000000, rate: 20 },
        { upTo: 2400000, rate: 25 },
        { upTo: null, rate: 30 }
      ],
      superSenior: [
        { upTo: 400000, rate: 0 },
        { upTo: 800000, rate: 5 },
        { upTo: 1200000, rate: 10 },
        { upTo: 1600000, rate: 15 },
        { upTo: 2000000, rate: 20 },
        { upTo: 2400000, rate: 25 },
        { upTo: null, rate: 30 }
      ]
    }
  },
  old: {
    label: "Sample Old Regime (edit for your country)",
    rebateLimit: 12500,
    rebateIncomeLimit: 500000,
    cessRate: 4,
    marginalRelief: true,
    surcharge: [
      { above: 50000000, rate: 37 },
      { above: 20000000, rate: 25 },
      { above: 10000000, rate: 15 },
      { above: 5000000, rate: 10 }
    ],
    ageGroups: {
      below60: [
        { upTo: 250000, rate: 0 },
        { upTo: 500000, rate: 5 },
        { upTo: 1000000, rate: 20 },
        { upTo: null, rate: 30 }
      ],
      senior: [
        { upTo: 300000, rate: 0 },
        { upTo: 500000, rate: 5 },
        { upTo: 1000000, rate: 20 },
        { upTo: null, rate: 30 }
      ],
      superSenior: [
        { upTo: 500000, rate: 0 },
        { upTo: 1000000, rate: 20 },
        { upTo: null, rate: 30 }
      ]
    }
  }
};

const CATEGORIES = [
  { name: "Loans", description: "EMI, home, car, personal loan, and eligibility planning." },
  { name: "Investments", description: "SIP, lumpsum, CAGR, ROI, and compounding calculators." },
  { name: "Banking", description: "FD, RD, interest, and savings maturity estimates." },
  { name: "Tax", description: "GST, tax, and salary take-home estimators." },
  { name: "Business", description: "GST, ROI, percentage, and conversion tools." },
  { name: "Personal Finance", description: "Retirement, inflation, salary, and everyday money planning." }
];

const guideDefaults = {
  emi: {
    formula: "EMI = P x r x (1+r)^n / ((1+r)^n - 1)",
    example: "For a 1,000,000 loan at 9% for 5 years, the EMI is about 20,758.",
    faqs: [
      ["What does EMI include?", "EMI includes principal repayment and interest for that month."],
      ["Why does tenure change total interest?", "A longer tenure reduces EMI but keeps the loan outstanding longer, so total interest usually rises."],
      ["Is this bank-approved?", "No. It is a planning estimate; banks may add fees, insurance, and eligibility rules."]
    ]
  },
  sip: {
    formula: "FV = P x [((1+i)^n - 1) / i] x (1+i)",
    example: "A 5,000 monthly SIP at 12% for 10 years may grow to about 1,160,000.",
    faqs: [
      ["Does SIP guarantee returns?", "No. SIP returns depend on market performance and fund selection."],
      ["What return rate should I use?", "Use a conservative long-term expected return and test multiple scenarios."],
      ["Why is invested amount lower than final value?", "The difference is estimated market return compounded over time."]
    ]
  },
  "income-tax": {
    formula: "Tax is calculated slab-by-slab, then rebate, surcharge with marginal relief, cess, and TDS are applied.",
    example: "The default slabs show a sample progressive tax structure. Edit the JSON to match your country's rules.",
    faqs: [
      ["Are the default tax slabs current?", "The defaults are seeded from sample slab data. Edit the JSON directly in the calculator to match your country's current rules."],
      ["Can I change the slabs?", "Yes. Edit the slab JSON directly in the calculator to match any country's tax rules or future changes."],
      ["Is this a filing calculator?", "No. It is a planning estimate and does not replace a qualified tax professional or official filing tools."]
    ]
  }
};

function formatCurrency(value, decimals = 0) {
  const amount = Number.isFinite(value) ? value : 0;
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function formatNumber(value, decimals = 2) {
  const amount = Number.isFinite(value) ? value : 0;
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function formatPercent(value, decimals = 2) {
  const amount = Number.isFinite(value) ? value : 0;
  return `${formatNumber(amount, decimals)}%`;
}

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function showError(container, message) {
  const errorBox = container.querySelector(".error-message");
  if (errorBox) {
    errorBox.textContent = message;
    errorBox.classList.add("show");
  }
}

function clearError(container) {
  const errorBox = container.querySelector(".error-message");
  if (errorBox) {
    errorBox.textContent = "";
    errorBox.classList.remove("show");
  }
}

function getInputNumber(form, name, options = {}) {
  const input = form.elements[name];
  if (!input) {
    throw new Error(`Missing input: ${name}`);
  }
  const raw = String(input.value || "").trim();
  if (!raw && options.required !== false) {
    throw new Error(`${options.label || name} is required.`);
  }
  if (!raw && options.required === false) {
    return 0;
  }
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`${options.label || name} must be a valid number.`);
  }
  if (options.positive && value <= 0) {
    throw new Error(`${options.label || name} must be greater than zero.`);
  }
  if (options.nonNegative !== false && value < 0) {
    throw new Error(`${options.label || name} cannot be negative.`);
  }
  if (Number.isFinite(options.min) && value < options.min) {
    throw new Error(`${options.label || name} must be at least ${options.min}.`);
  }
  if (Number.isFinite(options.max) && value > options.max) {
    throw new Error(`${options.label || name} must be ${options.max} or less.`);
  }
  return value;
}

function monthlyRate(annualRate) {
  return annualRate / 12 / 100;
}

function computeEmi(principal, annualRate, months) {
  const r = monthlyRate(annualRate);
  if (months <= 0) return 0;
  if (r === 0) return principal / months;
  // EMI formula: P * r * (1+r)^n / ((1+r)^n - 1).
  return principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
}

function buildAmortization(principal, annualRate, months) {
  const emi = computeEmi(principal, annualRate, months);
  const r = monthlyRate(annualRate);
  let balance = principal;
  const rows = [];
  for (let month = 1; month <= months; month += 1) {
    const interest = balance * r;
    const principalPaid = Math.min(emi - interest, balance);
    balance = Math.max(0, balance - principalPaid);
    rows.push([
      month,
      formatCurrency(roundMoney(emi)),
      formatCurrency(roundMoney(principalPaid)),
      formatCurrency(roundMoney(interest)),
      formatCurrency(roundMoney(balance))
    ]);
    if (balance <= 0.01) break;
  }
  return { emi, rows };
}

function computeSip(monthlyInvestment, annualReturn, months) {
  const i = monthlyRate(annualReturn);
  if (months <= 0) return 0;
  if (i === 0) return monthlyInvestment * months;
  // SIP future value assumes investment at the beginning of each month.
  return monthlyInvestment * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
}

function computeLumpsum(principal, annualReturn, years) {
  // Lumpsum future value: P * (1+r)^t.
  return principal * Math.pow(1 + annualReturn / 100, years);
}

function computeCompound(principal, annualRate, compoundsPerYear, years) {
  // Compound interest amount: P * (1 + r/n)^(n*t).
  return principal * Math.pow(1 + annualRate / 100 / compoundsPerYear, compoundsPerYear * years);
}

function computeSimpleInterest(principal, annualRate, years) {
  // Simple interest: P * R * T / 100.
  return principal * annualRate * years / 100;
}

function loanResult(values, label) {
  const months = Math.round(values.tenureYears * 12);
  const amortization = buildAmortization(values.principal, values.interestRate, months);
  const totalPayment = amortization.emi * months;
  const totalInterest = totalPayment - values.principal;
  return {
    summary: [
      { label: "Monthly EMI", value: formatCurrency(roundMoney(amortization.emi)), primary: true },
      { label: "Total interest", value: formatCurrency(roundMoney(totalInterest)) },
      { label: "Total payment", value: formatCurrency(roundMoney(totalPayment)) }
    ],
    explanation: `${label} estimate uses the standard reducing-balance EMI formula over ${months} monthly payments.`,
    table: {
      caption: `${label} amortization schedule`,
      columns: ["Month", "EMI", "Principal", "Interest", "Balance"],
      rows: amortization.rows
    },
    chart: [
      { label: "Principal", value: values.principal, className: "bar-blue" },
      { label: "Interest", value: Math.max(totalInterest, 0), className: "bar-green" }
    ]
  };
}

function taxableSlabTax(income, slabs) {
  let tax = 0;
  let lower = 0;
  for (const slab of slabs) {
    const upper = slab.upTo === null ? Infinity : Number(slab.upTo);
    if (income > lower) {
      const taxableInSlab = Math.min(income, upper) - lower;
      tax += taxableInSlab * Number(slab.rate) / 100;
    }
    lower = upper;
    if (income <= upper) break;
  }
  return tax;
}

function parseTaxConfig(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.new || !parsed.old) {
      throw new Error("Config must include new and old regimes.");
    }
    return parsed;
  } catch (error) {
    throw new Error(`Tax configuration JSON is invalid: ${error.message}`);
  }
}

function findSurchargeRate(income, regimeConfig) {
  const rule = [...(regimeConfig.surcharge || [])].sort((a, b) => b.above - a.above).find((item) => income > item.above);
  return rule ? Number(rule.rate) : 0;
}

function assertFiniteResult(value, label) {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} could not be calculated. Please check the inputs.`);
  }
  return value;
}

function computeTaxBeforeCess(income, slabs, regimeConfig, applyRelief = true) {
  const slabTax = taxableSlabTax(income, slabs);
  const rebate = income <= Number(regimeConfig.rebateIncomeLimit) ? Math.min(slabTax, Number(regimeConfig.rebateLimit)) : 0;
  const taxAfterRebate = Math.max(0, slabTax - rebate);
  const surchargeRate = findSurchargeRate(income, regimeConfig);
  let surcharge = taxAfterRebate * surchargeRate / 100;
  let marginalRelief = 0;

  if (applyRelief && regimeConfig.marginalRelief !== false && surcharge > 0) {
    const thresholds = [...new Set((regimeConfig.surcharge || []).map((item) => Number(item.above)).filter(Number.isFinite))]
      .sort((a, b) => a - b);
    for (const threshold of thresholds) {
      if (income > threshold) {
        const thresholdTax = computeTaxBeforeCess(threshold, slabs, regimeConfig, false).taxBeforeCess;
        const cap = thresholdTax + (income - threshold);
        const current = taxAfterRebate + surcharge;
        if (current > cap) {
          marginalRelief += current - cap;
          surcharge = Math.max(0, cap - taxAfterRebate);
        }
      }
    }
  }

  return {
    slabTax,
    rebate,
    taxAfterRebate,
    surchargeRate,
    surcharge,
    marginalRelief,
    taxBeforeCess: taxAfterRebate + surcharge
  };
}

function buildResult(summary, explanation, options = {}) {
  return { summary, explanation, ...options };
}

const calculators = [
  {
    id: "emi",
    title: "EMI Calculator",
    icon: "EMI",
    category: "Loans",
    popular: true,
    description: "Calculate monthly EMI, total interest, total payment, and a month-by-month amortization table.",
    fields: [
      numberField("principal", "Loan amount", 1000000, 1, 100000000, 1000),
      numberField("interestRate", "Annual interest rate (%)", 9, 0, 60, 0.05),
      numberField("tenureYears", "Tenure (years)", 5, 0.08, 40, 0.5)
    ],
    example: { principal: 1000000, interestRate: 9, tenureYears: 5 },
    calculate: (values) => loanResult(values, "EMI")
  },
  {
    id: "sip",
    title: "SIP Calculator",
    icon: "SIP",
    category: "Investments",
    popular: true,
    description: "Estimate future value, invested amount, and year-wise growth for monthly SIP investments.",
    fields: [
      numberField("monthlyInvestment", "Monthly investment", 5000, 1, 10000000, 500),
      numberField("returnRate", "Expected annual return (%)", 12, 0, 80, 0.1),
      numberField("years", "Investment period (years)", 10, 0.08, 60, 1)
    ],
    example: { monthlyInvestment: 5000, returnRate: 12, years: 10 },
    calculate(values) {
      const months = Math.round(values.years * 12);
      const futureValue = computeSip(values.monthlyInvestment, values.returnRate, months);
      const invested = values.monthlyInvestment * months;
      const returns = futureValue - invested;
      const rows = [];
      for (let year = 1; year <= Math.ceil(months / 12); year += 1) {
        const elapsedMonths = Math.min(year * 12, months);
        const value = computeSip(values.monthlyInvestment, values.returnRate, elapsedMonths);
        rows.push([year, formatCurrency(roundMoney(values.monthlyInvestment * elapsedMonths)), formatCurrency(roundMoney(value))]);
      }
      return buildResult([
        { label: "Invested amount", value: formatCurrency(roundMoney(invested)) },
        { label: "Estimated returns", value: formatCurrency(roundMoney(returns)) },
        { label: "Total value", value: formatCurrency(roundMoney(futureValue)), primary: true }
      ], "SIP value is estimated using monthly compounding and beginning-of-month contributions.", {
        table: { caption: "Year-wise SIP growth", columns: ["Year", "Invested", "Estimated value"], rows },
        chart: [
          { label: "Invested", value: invested, className: "bar-blue" },
          { label: "Returns", value: Math.max(returns, 0), className: "bar-green" }
        ]
      });
    }
  },
  {
    id: "lumpsum",
    title: "Lumpsum Investment Calculator",
    icon: "LMP",
    category: "Investments",
    description: "Estimate final value and gains for a one-time investment.",
    fields: [
      numberField("principal", "Invested amount", 200000, 1, 100000000, 1000),
      numberField("returnRate", "Expected annual return (%)", 12, 0, 80, 0.1),
      numberField("years", "Investment period (years)", 8, 0.08, 60, 1)
    ],
    example: { principal: 200000, returnRate: 12, years: 8 },
    calculate(values) {
      const finalValue = computeLumpsum(values.principal, values.returnRate, values.years);
      const returns = finalValue - values.principal;
      return buildResult([
        { label: "Invested amount", value: formatCurrency(roundMoney(values.principal)) },
        { label: "Estimated returns", value: formatCurrency(roundMoney(returns)) },
        { label: "Final value", value: formatCurrency(roundMoney(finalValue)), primary: true }
      ], "Lumpsum growth is calculated with annual compounding for the chosen period.");
    }
  },
  {
    id: "compound-interest",
    title: "Compound Interest Calculator",
    icon: "CMP",
    category: "Banking",
    popular: true,
    description: "Calculate maturity amount when interest earns interest at a chosen frequency.",
    fields: [
      numberField("principal", "Principal amount", 100000, 1, 100000000, 1000),
      numberField("interestRate", "Annual interest rate (%)", 7.5, 0, 80, 0.1),
      selectField("frequency", "Compounding frequency", "4", [
        ["12", "Monthly"],
        ["4", "Quarterly"],
        ["2", "Half-yearly"],
        ["1", "Yearly"]
      ]),
      numberField("years", "Time period (years)", 5, 0.08, 60, 1)
    ],
    example: { principal: 100000, interestRate: 7.5, frequency: "4", years: 5 },
    calculate(values) {
      const amount = computeCompound(values.principal, values.interestRate, Number(values.frequency), values.years);
      const interest = amount - values.principal;
      return buildResult([
        { label: "Principal", value: formatCurrency(roundMoney(values.principal)) },
        { label: "Interest earned", value: formatCurrency(roundMoney(interest)) },
        { label: "Final amount", value: formatCurrency(roundMoney(amount)), primary: true }
      ], "Compound interest applies interest repeatedly based on the selected compounding frequency.");
    }
  },
  {
    id: "simple-interest",
    title: "Simple Interest Calculator",
    icon: "SI",
    category: "Banking",
    description: "Calculate simple interest and total amount without compounding.",
    fields: [
      numberField("principal", "Principal amount", 100000, 1, 100000000, 1000),
      numberField("interestRate", "Annual interest rate (%)", 8, 0, 80, 0.1),
      numberField("years", "Time period (years)", 3, 0.08, 60, 1)
    ],
    example: { principal: 100000, interestRate: 8, years: 3 },
    calculate(values) {
      const interest = computeSimpleInterest(values.principal, values.interestRate, values.years);
      return buildResult([
        { label: "Principal", value: formatCurrency(roundMoney(values.principal)) },
        { label: "Interest", value: formatCurrency(roundMoney(interest)) },
        { label: "Total amount", value: formatCurrency(roundMoney(values.principal + interest)), primary: true }
      ], "Simple interest is calculated only on the original principal.");
    }
  },
  {
    id: "fixed-deposit",
    title: "Fixed Deposit Calculator",
    icon: "FD",
    category: "Banking",
    popular: true,
    description: "Estimate FD maturity value with monthly, quarterly, half-yearly, or yearly compounding.",
    fields: [
      numberField("principal", "Deposit amount", 250000, 1, 100000000, 1000),
      numberField("interestRate", "Annual interest rate (%)", 7, 0, 50, 0.05),
      selectField("frequency", "Compounding frequency", "4", [
        ["12", "Monthly"],
        ["4", "Quarterly"],
        ["2", "Half-yearly"],
        ["1", "Yearly"]
      ]),
      numberField("years", "Tenure (years)", 3, 0.08, 20, 0.25)
    ],
    example: { principal: 250000, interestRate: 7, frequency: "4", years: 3 },
    calculate(values) {
      const amount = computeCompound(values.principal, values.interestRate, Number(values.frequency), values.years);
      return buildResult([
        { label: "Deposit", value: formatCurrency(roundMoney(values.principal)) },
        { label: "Interest earned", value: formatCurrency(roundMoney(amount - values.principal)) },
        { label: "Maturity amount", value: formatCurrency(roundMoney(amount)), primary: true }
      ], "FD maturity uses compound interest with the selected compounding frequency.");
    }
  },
  {
    id: "recurring-deposit",
    title: "Recurring Deposit Calculator",
    icon: "RD",
    category: "Banking",
    description: "Estimate RD maturity value, total deposits, and interest earned.",
    fields: [
      numberField("monthlyDeposit", "Monthly deposit", 10000, 1, 10000000, 500),
      numberField("interestRate", "Annual interest rate (%)", 7, 0, 50, 0.05),
      numberField("years", "Tenure (years)", 5, 0.08, 20, 0.25)
    ],
    example: { monthlyDeposit: 10000, interestRate: 7, years: 5 },
    calculate(values) {
      const months = Math.round(values.years * 12);
      const i = monthlyRate(values.interestRate);
      let maturity = 0;
      for (let m = 1; m <= months; m += 1) {
        // RD assumption: each monthly deposit is made at month-end and compounds monthly until maturity.
        maturity += values.monthlyDeposit * Math.pow(1 + i, months - m);
      }
      const deposits = values.monthlyDeposit * months;
      return buildResult([
        { label: "Total deposits", value: formatCurrency(deposits) },
        { label: "Interest earned", value: formatCurrency(roundMoney(maturity - deposits)) },
        { label: "Maturity value", value: formatCurrency(roundMoney(maturity)), primary: true }
      ], "RD estimate assumes monthly compounding with deposits credited at the end of each month.", {
        note: "Banks may use quarterly interest crediting and rounding rules, so final values can differ slightly."
      });
    }
  },
  {
    id: "gst",
    title: "GST Calculator",
    icon: "GST",
    category: "Tax",
    popular: true,
    description: "Add or remove GST at common GST rates.",
    fields: [
      numberField("amount", "Amount", 10000, 0, 100000000, 100),
      selectField("mode", "Calculation mode", "add", [["add", "Add GST"], ["remove", "Remove GST"]]),
      selectField("rate", "GST rate", "18", [["0", "0%"], ["3", "3%"], ["5", "5%"], ["12", "12%"], ["18", "18%"], ["28", "28%"]])
    ],
    example: { amount: 10000, mode: "add", rate: "18" },
    calculate(values) {
      const rate = Number(values.rate) / 100;
      let baseAmount;
      let gstAmount;
      let totalAmount;
      if (values.mode === "add") {
        baseAmount = values.amount;
        gstAmount = values.amount * rate;
        totalAmount = baseAmount + gstAmount;
      } else {
        totalAmount = values.amount;
        baseAmount = rate === 0 ? values.amount : values.amount / (1 + rate);
        gstAmount = totalAmount - baseAmount;
      }
      return buildResult([
        { label: "Base amount", value: formatCurrency(roundMoney(baseAmount)) },
        { label: "GST amount", value: formatCurrency(roundMoney(gstAmount)) },
        { label: "Total amount", value: formatCurrency(roundMoney(totalAmount)), primary: true }
      ], values.mode === "add" ? "GST is added to the base amount." : "GST is backed out from the tax-inclusive amount.");
    }
  },
  {
    id: "salary",
    title: "Salary Calculator",
    icon: "SAL",
    category: "Tax",
    description: "Estimate monthly gross, deductions, and take-home salary from your CTC or gross salary assumptions.",
    fields: [
      numberField("ctc", "Annual CTC", 1200000, 1, 100000000, 10000),
      numberField("basicPercent", "Basic salary (% of gross)", 40, 0, 100, 1),
      numberField("hraPercent", "HRA (% of basic)", 50, 0, 100, 1),
      numberField("pfPercent", "Employee PF (% of basic)", 12, 0, 100, 1),
      numberField("professionalTax", "Professional tax per month", 200, 0, 10000, 50),
      numberField("otherDeductions", "Other deductions per month", 0, 0, 1000000, 100)
    ],
    example: { ctc: 1200000, basicPercent: 40, hraPercent: 50, pfPercent: 12, professionalTax: 200, otherDeductions: 1500 },
    calculate(values) {
      const monthlyGross = values.ctc / 12;
      const basic = monthlyGross * values.basicPercent / 100;
      const hra = basic * values.hraPercent / 100;
      const pf = basic * values.pfPercent / 100;
      const monthlyDeductions = pf + values.professionalTax + values.otherDeductions;
      const monthlyInHand = monthlyGross - monthlyDeductions;
      const otherGross = monthlyGross - basic - hra;
      if (otherGross < -0.01) {
        throw new Error("Basic salary and HRA assumptions exceed monthly gross salary.");
      }
      if (monthlyInHand < -0.01) {
        throw new Error("Monthly deductions exceed monthly gross salary.");
      }
      return buildResult([
        { label: "Monthly gross", value: formatCurrency(roundMoney(monthlyGross)) },
        { label: "Monthly deductions", value: formatCurrency(roundMoney(monthlyDeductions)) },
        { label: "Monthly in-hand", value: formatCurrency(roundMoney(monthlyInHand)), primary: true },
        { label: "Annual in-hand", value: formatCurrency(roundMoney(monthlyInHand * 12)) }
      ], "Salary estimate uses editable gross split assumptions and does not include income tax unless entered as a deduction.", {
        table: {
          caption: "Monthly salary breakup",
          columns: ["Component", "Amount"],
          rows: [
            ["Basic", formatCurrency(roundMoney(basic))],
            ["HRA", formatCurrency(roundMoney(hra))],
            ["Other gross components", formatCurrency(roundMoney(otherGross))],
            ["Employee PF", formatCurrency(roundMoney(pf))],
            ["Professional tax", formatCurrency(roundMoney(values.professionalTax))],
            ["Other deductions", formatCurrency(roundMoney(values.otherDeductions))]
          ]
        }
      });
    }
  },
  {
    id: "income-tax",
    title: "Income Tax Calculator",
    icon: "TAX",
    category: "Tax",
    popular: true,
    description: "Estimate income tax with fully editable slab data - update slabs for any country or year.",
    fields: [
      selectField("regime", "Tax regime", "new", [["new", "New regime"], ["old", "Old regime"]]),
      selectField("ageGroup", "Age group", "below60", [["below60", "Below 60"], ["senior", "60 to 79"], ["superSenior", "80 and above"]]),
      numberField("annualIncome", "Annual gross income", 1500000, 0, 1000000000, 10000),
      numberField("standardDeduction", "Standard deduction / exempt income", 0, 0, 10000000, 1000),
      numberField("deductions", "Other deductions", 0, 0, 10000000, 1000),
      numberField("tds", "TDS already paid", 0, 0, 100000000, 1000),
      textareaField("taxConfig", "Editable slab data JSON", () => JSON.stringify(TAX_CONFIG, null, 2), "Update slabs, rebate, cess, or surcharge here when rules change.")
    ],
    example: {
      regime: "new",
      ageGroup: "below60",
      annualIncome: 1500000,
      standardDeduction: 0,
      deductions: 0,
      tds: 0,
      taxConfig: () => JSON.stringify(TAX_CONFIG, null, 2)
    },
    calculate(values) {
      const config = parseTaxConfig(values.taxConfig);
      const regimeConfig = config[values.regime];
      const slabs = regimeConfig.ageGroups[values.ageGroup];
      if (!Array.isArray(slabs)) throw new Error("Selected age group is missing in tax config.");
      const taxableIncome = Math.max(0, values.annualIncome - values.standardDeduction - values.deductions);
      const taxParts = computeTaxBeforeCess(taxableIncome, slabs, regimeConfig);
      const cessRate = Number(regimeConfig.cessRate ?? 4);
      const cess = taxParts.taxBeforeCess * cessRate / 100;
      const totalTax = taxParts.taxBeforeCess + cess;
      const balanceTax = Math.max(0, totalTax - values.tds);
      const takeHome = Math.max(0, values.annualIncome - totalTax);
      return buildResult([
        { label: "Taxable income", value: formatCurrency(roundMoney(taxableIncome)) },
        { label: "Tax before cess", value: formatCurrency(roundMoney(taxParts.taxBeforeCess)) },
        { label: "Estimated total tax", value: formatCurrency(roundMoney(totalTax)), primary: true },
        { label: "Take-home estimate", value: formatCurrency(roundMoney(takeHome)) },
        { label: "Balance after TDS", value: formatCurrency(roundMoney(balanceTax)) }
      ], "Tax is estimated slab-by-slab, then rebate, surcharge, cess, and TDS are applied. Verify with your country's official tax rules or a qualified tax professional before filing.", {
        note: "Tax estimates are for planning only. Tax rules vary by country - verify with official sources or a tax professional.",
        table: {
          caption: "Tax breakdown",
          columns: ["Item", "Amount"],
          rows: [
            ["Gross income", formatCurrency(roundMoney(values.annualIncome))],
            ["Total deductions", formatCurrency(roundMoney(values.standardDeduction + values.deductions))],
            ["Slab tax", formatCurrency(roundMoney(taxParts.slabTax))],
            ["Rebate", formatCurrency(roundMoney(taxParts.rebate))],
            [`Surcharge (${formatPercent(taxParts.surchargeRate, 0)})`, formatCurrency(roundMoney(taxParts.surcharge))],
            ["Marginal relief", formatCurrency(roundMoney(taxParts.marginalRelief))],
            [`Cess (${formatPercent(cessRate, 0)})`, formatCurrency(roundMoney(cess))],
            ["TDS paid", formatCurrency(roundMoney(values.tds))]
          ]
        }
      });
    }
  },
  {
    id: "loan-eligibility",
    title: "Loan Eligibility Calculator",
    icon: "ELG",
    category: "Loans",
    description: "Estimate eligible EMI and approximate loan amount using income, FOIR, tenure, and interest rate.",
    fields: [
      numberField("monthlyIncome", "Monthly income", 100000, 1, 100000000, 1000),
      numberField("existingEmi", "Existing EMI", 15000, 0, 100000000, 1000),
      numberField("interestRate", "Annual interest rate (%)", 9, 0, 60, 0.05),
      numberField("tenureYears", "Tenure (years)", 20, 0.08, 40, 0.5),
      numberField("foir", "FOIR (%)", 50, 1, 100, 1)
    ],
    example: { monthlyIncome: 100000, existingEmi: 15000, interestRate: 9, tenureYears: 20, foir: 50 },
    calculate(values) {
      const eligibleEmi = Math.max(0, values.monthlyIncome * values.foir / 100 - values.existingEmi);
      const r = monthlyRate(values.interestRate);
      const months = Math.round(values.tenureYears * 12);
      // Present value of an EMI stream gives approximate loan principal.
      const amount = r === 0 ? eligibleEmi * months : eligibleEmi * (1 - Math.pow(1 + r, -months)) / r;
      return buildResult([
        { label: "Eligible EMI", value: formatCurrency(roundMoney(eligibleEmi)), primary: true },
        { label: "Approx loan amount", value: formatCurrency(roundMoney(amount)) },
        { label: "FOIR limit", value: formatCurrency(roundMoney(values.monthlyIncome * values.foir / 100)) }
      ], "Eligibility is an approximation based on FOIR and reducing-balance loan math. Lenders may apply additional checks.");
    }
  },
  loanPreset("home-loan", "Home Loan Calculator", "HOME", "Home loan", 5000000, 8.75, 20),
  loanPreset("car-loan", "Car Loan Calculator", "CAR", "Car loan", 800000, 9.5, 5),
  loanPreset("personal-loan", "Personal Loan Calculator", "PER", "Personal loan", 500000, 13, 4),
  {
    id: "retirement",
    title: "Retirement Calculator",
    icon: "RET",
    category: "Personal Finance",
    description: "Estimate future expenses, required retirement corpus, and monthly investment needed.",
    fields: [
      numberField("currentAge", "Current age", 32, 18, 80, 1),
      numberField("retirementAge", "Retirement age", 60, 19, 90, 1),
      numberField("lifeExpectancy", "Life expectancy", 85, 60, 110, 1),
      numberField("monthlyExpenses", "Current monthly expenses", 60000, 1, 10000000, 1000),
      numberField("inflationRate", "Inflation rate (%)", 6, 0, 30, 0.1),
      numberField("returnBefore", "Expected return before retirement (%)", 12, 0, 80, 0.1),
      numberField("returnAfter", "Expected return after retirement (%)", 7, 0, 80, 0.1)
    ],
    example: { currentAge: 32, retirementAge: 60, lifeExpectancy: 85, monthlyExpenses: 60000, inflationRate: 6, returnBefore: 12, returnAfter: 7 },
    calculate(values) {
      if (values.retirementAge <= values.currentAge) throw new Error("Retirement age must be greater than current age.");
      if (values.lifeExpectancy <= values.retirementAge) throw new Error("Life expectancy must be greater than retirement age.");
      const yearsToRetire = values.retirementAge - values.currentAge;
      const retirementYears = values.lifeExpectancy - values.retirementAge;
      const futureMonthlyExpense = values.monthlyExpenses * Math.pow(1 + values.inflationRate / 100, yearsToRetire);
      const annualExpenseAtRetirement = futureMonthlyExpense * 12;
      const realReturn = (1 + values.returnAfter / 100) / (1 + values.inflationRate / 100) - 1;
      if (realReturn < 0) {
        throw new Error("Post-retirement return is lower than inflation. Increase post-retirement return or reduce inflation to estimate a sustainable corpus.");
      }
      // Corpus is the present value of an inflation-adjusted retirement expense stream.
      const corpus = realReturn === 0
        ? annualExpenseAtRetirement * retirementYears
        : annualExpenseAtRetirement * (1 - Math.pow(1 + realReturn, -retirementYears)) / realReturn;
      const monthlyReturn = monthlyRate(values.returnBefore);
      const months = yearsToRetire * 12;
      // SIP needed uses the same beginning-of-month annuity assumption as the SIP calculator.
      const monthlyInvestment = monthlyReturn === 0
        ? corpus / months
        : corpus * monthlyReturn / ((Math.pow(1 + monthlyReturn, months) - 1) * (1 + monthlyReturn));
      return buildResult([
        { label: "Future monthly expense", value: formatCurrency(roundMoney(futureMonthlyExpense)) },
        { label: "Required corpus", value: formatCurrency(roundMoney(corpus)), primary: true },
        { label: "Monthly investment needed", value: formatCurrency(roundMoney(monthlyInvestment)) }
      ], "Retirement estimate inflates today's expenses to retirement date, then calculates the corpus needed to sustain inflation-adjusted withdrawals.");
    }
  },
  {
    id: "inflation",
    title: "Inflation Calculator",
    icon: "INF",
    category: "Personal Finance",
    description: "Estimate how much a current expense may cost in the future.",
    fields: [
      numberField("presentCost", "Present cost", 100000, 1, 100000000, 1000),
      numberField("inflationRate", "Inflation rate (%)", 6, 0, 50, 0.1),
      numberField("years", "Years", 10, 0.08, 100, 1)
    ],
    example: { presentCost: 100000, inflationRate: 6, years: 10 },
    calculate(values) {
      // Future cost = present cost * (1 + inflation)^years.
      const futureCost = values.presentCost * Math.pow(1 + values.inflationRate / 100, values.years);
      return buildResult([
        { label: "Present cost", value: formatCurrency(roundMoney(values.presentCost)) },
        { label: "Future cost", value: formatCurrency(roundMoney(futureCost)), primary: true },
        { label: "Cost increase", value: formatCurrency(roundMoney(futureCost - values.presentCost)) }
      ], "Inflation reduces purchasing power because the same item may cost more in the future.");
    }
  },
  {
    id: "cagr",
    title: "CAGR Calculator",
    icon: "CAGR",
    category: "Investments",
    description: "Calculate compounded annual growth rate from beginning value, ending value, and years.",
    fields: [
      numberField("beginningValue", "Beginning value", 100000, 1, 1000000000, 1000),
      numberField("endingValue", "Ending value", 250000, 1, 1000000000, 1000),
      numberField("years", "Years", 5, 0.08, 100, 1)
    ],
    example: { beginningValue: 100000, endingValue: 250000, years: 5 },
    calculate(values) {
      // CAGR = ((ending / beginning)^(1 / years) - 1) * 100.
      const cagr = (Math.pow(values.endingValue / values.beginningValue, 1 / values.years) - 1) * 100;
      return buildResult([
        { label: "Beginning value", value: formatCurrency(roundMoney(values.beginningValue)) },
        { label: "Ending value", value: formatCurrency(roundMoney(values.endingValue)) },
        { label: "CAGR", value: formatPercent(cagr), primary: true }
      ], "CAGR smooths the growth path into a single annualized return rate.");
    }
  },
  {
    id: "roi",
    title: "ROI Calculator",
    icon: "ROI",
    category: "Investments",
    description: "Calculate return on investment using cost and gain values.",
    fields: [
      numberField("cost", "Investment cost", 100000, 1, 1000000000, 1000),
      numberField("gain", "Final value (original + profit)", 135000, 0, 1000000000, 1000, "Enter the total ending value, not only the profit.")
    ],
    example: { cost: 100000, gain: 135000 },
    calculate(values) {
      // ROI = ((gain - cost) / cost) * 100.
      const roi = (values.gain - values.cost) / values.cost * 100;
      return buildResult([
        { label: "Cost", value: formatCurrency(roundMoney(values.cost)) },
        { label: "Final value", value: formatCurrency(roundMoney(values.gain)) },
        { label: "ROI", value: formatPercent(roi), primary: true }
      ], "Positive ROI means the final value is higher than the cost; negative ROI means a loss.");
    }
  },
  {
    id: "percentage",
    title: "Percentage Calculator",
    icon: "%",
    category: "Business",
    description: "Solve common percentage questions for discounts, increases, ratios, and comparisons.",
    fields: [
      selectField("mode", "Percentage mode", "percentOf", [
        ["percentOf", "X% of Y"],
        ["whatPercent", "X is what % of Y"],
        ["change", "Percentage increase/decrease"]
      ]),
      optionalNumberField("x", "X value", 15, 0, 1000000000, 1),
      optionalNumberField("y", "Y value", 2000, 0, 1000000000, 1),
      optionalNumberField("startValue", "Start value", 1000, 0, 1000000000, 1),
      optionalNumberField("endValue", "End value", 1250, 0, 1000000000, 1)
    ],
    example: { mode: "percentOf", x: 15, y: 2000, startValue: 1000, endValue: 1250 },
    calculate(values) {
      let result;
      let explanation;
      if (values.mode === "percentOf") {
        result = values.x / 100 * values.y;
        explanation = `${formatNumber(values.x, 2)}% of ${formatNumber(values.y, 2)} is ${formatNumber(result, 2)}.`;
      } else if (values.mode === "whatPercent") {
        if (values.y === 0) throw new Error("Y value must be greater than zero for this mode.");
        result = values.x / values.y * 100;
        explanation = `${formatNumber(values.x, 2)} is ${formatPercent(result)} of ${formatNumber(values.y, 2)}.`;
      } else {
        if (values.startValue === 0) throw new Error("Start value must be greater than zero for change percentage.");
        result = (values.endValue - values.startValue) / values.startValue * 100;
        explanation = `The change from ${formatNumber(values.startValue, 2)} to ${formatNumber(values.endValue, 2)} is ${formatPercent(result)}.`;
      }
      return buildResult([
        { label: "Result", value: values.mode === "percentOf" ? formatNumber(result, 2) : formatPercent(result), primary: true },
        { label: "Mode", value: modeLabel(values.mode) }
      ], explanation);
    }
  },
  {
    id: "currency-converter",
    title: "Currency Converter UI",
    icon: "FX",
    category: "Business",
    description: "Convert between currencies using your own exchange-rate inputs. No live API - update rates manually for accuracy.",
    fields: [
      numberField("amount", "Amount", 1000, 0, 1000000000, 1),
      selectField("fromCurrency", "From currency", "USD", currencyOptions()),
      selectField("toCurrency", "To currency", "INR", currencyOptions()),
      numberField("INR", "Base value of 1 INR", 1, 0.0001, 1000000, 0.0001),
      numberField("USD", "Base value of 1 USD", 83, 0.0001, 1000000, 0.01),
      numberField("EUR", "Base value of 1 EUR", 90, 0.0001, 1000000, 0.01),
      numberField("GBP", "Base value of 1 GBP", 105, 0.0001, 1000000, 0.01),
      numberField("AED", "Base value of 1 AED", 22.6, 0.0001, 1000000, 0.01),
      numberField("SGD", "Base value of 1 SGD", 61.5, 0.0001, 1000000, 0.01)
    ],
    example: { amount: 1000, fromCurrency: "USD", toCurrency: "INR", INR: 1, USD: 83, EUR: 90, GBP: 105, AED: 22.6, SGD: 61.5 },
    calculate(values) {
      const rates = { INR: values.INR, USD: values.USD, EUR: values.EUR, GBP: values.GBP, AED: values.AED, SGD: values.SGD };
      if (Object.values(rates).some((rate) => !Number.isFinite(rate) || rate <= 0)) {
        throw new Error("All currency rates must be greater than zero.");
      }
      const baseAmount = values.amount * rates[values.fromCurrency];
      const converted = assertFiniteResult(baseAmount / rates[values.toCurrency], "Currency conversion");
      return buildResult([
        { label: "Converted amount", value: `${formatNumber(converted, 2)} ${values.toCurrency}`, primary: true },
        { label: "Base currency equivalent", value: formatCurrency(roundMoney(baseAmount)) },
        { label: "Applied rate", value: `1 ${values.fromCurrency} = ${formatNumber(rates[values.fromCurrency], 4)} base units` }
      ], "Static estimate mode. Update rates manually before relying on the conversion.", {
        note: "Static estimate mode. Update rates manually."
      });
    }
  }
];

function numberField(name, label, defaultValue, min, max, step, help = "") {
  return { type: "number", name, label, defaultValue, min, max, step, help, required: true };
}

function optionalNumberField(name, label, defaultValue, min, max, step, help = "") {
  return { type: "number", name, label, defaultValue, min, max, step, help, required: false };
}

function selectField(name, label, defaultValue, options, help = "") {
  return { type: "select", name, label, defaultValue, options, help };
}

function textareaField(name, label, defaultValue, help = "") {
  return { type: "textarea", name, label, defaultValue, help, full: true };
}

function loanPreset(id, title, icon, label, principal, interestRate, tenureYears) {
  return {
    id,
    title,
    icon,
    category: "Loans",
    description: `Calculate ${label.toLowerCase()} EMI, total interest, total payment, and amortization schedule.`,
    fields: [
      numberField("principal", `${label} amount`, principal, 1, 100000000, 1000),
      numberField("interestRate", "Annual interest rate (%)", interestRate, 0, 60, 0.05),
      numberField("tenureYears", "Tenure (years)", tenureYears, 0.08, 40, 0.5)
    ],
    example: { principal, interestRate, tenureYears },
    calculate: (values) => loanResult(values, label)
  };
}

function currencyOptions() {
  return [["INR", "INR"], ["USD", "USD"], ["EUR", "EUR"], ["GBP", "GBP"], ["AED", "AED"], ["SGD", "SGD"]];
}

function modeLabel(mode) {
  return {
    percentOf: "X% of Y",
    whatPercent: "X is what % of Y",
    change: "Percentage increase/decrease"
  }[mode] || mode;
}

function createGuide(calc) {
  const existing = guideDefaults[calc.id];
  if (existing) return existing;
  const formulaById = {
    lumpsum: "FV = P x (1+r)^t",
    "compound-interest": "A = P x (1 + r/n)^(n*t)",
    "simple-interest": "SI = P x R x T / 100",
    "fixed-deposit": "Maturity = P x (1 + r/n)^(n*t)",
    "recurring-deposit": "Each monthly deposit compounds monthly until maturity.",
    gst: "GST add: total = amount x (1+rate). GST remove: base = total / (1+rate).",
    salary: "In-hand = monthly gross - PF - professional tax - other deductions.",
    "loan-eligibility": "Eligible EMI = income x FOIR - existing EMI.",
    "home-loan": "Home loan EMI uses the reducing-balance EMI formula.",
    "car-loan": "Car loan EMI uses the reducing-balance EMI formula.",
    "personal-loan": "Personal loan EMI uses the reducing-balance EMI formula.",
    retirement: "Corpus is based on inflated expenses and post-retirement real return.",
    inflation: "Future Cost = Present Cost x (1 + inflation)^years",
    cagr: "CAGR = ((Ending / Beginning)^(1 / Years) - 1) x 100",
    roi: "ROI = ((Gain - Cost) / Cost) x 100",
    percentage: "Use the selected percentage identity for the current mode.",
    "currency-converter": "Converted amount = amount x source rate / target rate."
  };
  return {
    formula: formulaById[calc.id] || "Uses standard finance formulas for the selected inputs.",
    example: `Use the example values in the ${calc.title} to see a sample estimate.`,
    faqs: [
      [`How accurate is the ${calc.title}?`, "It uses standard formulas, but real-world fees, taxes, rounding, and provider rules can change final outcomes."],
      ["Can I use this for planning?", "Yes, it is useful for rough planning and comparison before speaking with a bank, tax professional, or advisor."],
      ["Does CalcNest store my inputs?", "No. All calculations happen in your browser - nothing is sent to a server."]
    ]
  };
}

const guides = calculators.map((calc) => ({ ...calc, guide: createGuide(calc) }));
const state = {
  activeCategory: "All",
  search: "",
  activeCalculator: null,
  results: {}
};

document.addEventListener("DOMContentLoaded", () => {
  renderCategories();
  renderFilters();
  renderCards();
  renderPopular();
  renderGuides();
  renderFaqSchema();
  bindSearch();
  bindCardNavigation();
  initDarkMode();
  initBackToTop();
  initMobileNav();
  initFooterYear();
  initCloseWorkspace();
  initFooterQuickLinks();
  window.addEventListener("hashchange", openFromHash);
  window.addEventListener("popstate", openFromHash);
  openFromHash();
  const checks = runFormulaSelfChecks(false);
  if (checks.failed.length) {
    console.warn("CalcNest formula self-check failures", checks.failed);
  }
});

function initDarkMode() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  const saved = localStorage.getItem("calcnest-theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
  btn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("calcnest-theme", next);
  });
}

function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  const onScroll = () => {
    btn.classList.toggle("visible", window.scrollY > 400);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function initMobileNav() {
  const toggle = document.getElementById("navMobileToggle");
  const links = document.querySelector(".nav-links");
  if (!toggle || !links) return;
  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  // Close on link click
  links.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

function initFooterYear() {
  const el = document.getElementById("footerYear");
  if (el) el.textContent = new Date().getFullYear();
}

function initCloseWorkspace() {
  const btn = document.getElementById("closeWorkspaceBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    state.activeCalculator = null;
    document.getElementById("workspaceTitle").textContent = "Open a calculator";
    document.getElementById("calculatorShell").innerHTML = `
      <div class="workspace-placeholder">
        <div class="workspace-placeholder-icon" aria-hidden="true">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>
        </div>
        <h3>No calculator open</h3>
        <p>Click any calculator card above or use search to find and open a calculator.</p>
        <a class="button primary" href="#calculators">Browse calculators</a>
      </div>`;
    btn.hidden = true;
    updateActiveCards(null);
    history.pushState(null, "", window.location.pathname);
  });
}

function initFooterQuickLinks() {
  document.querySelectorAll("[data-calc-link]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const shell = document.getElementById("calculatorShell");
      if (!shell) return; // Allow natural navigation on subpages
      e.preventDefault();
      const id = link.dataset.calcLink;
      openCalculator(id, { scroll: true });
      history.pushState(null, "", `#${id}`);
    });
  });
}

function updateActiveCards(activeId) {
  document.querySelectorAll("[data-calc-id]").forEach((card) => {
    card.classList.toggle("active", card.dataset.calcId === activeId);
  });
}

function bindSearch() {
  const input = document.getElementById("globalSearch");
  const clear = document.getElementById("clearSearch");
  if (!input || !clear) return;
  input.addEventListener("input", () => {
    state.search = input.value.trim().toLowerCase();
    renderCards();
  });
  clear.addEventListener("click", () => {
    input.value = "";
    state.search = "";
    renderCards();
    input.focus();
  });
}

function bindCardNavigation() {
  document.addEventListener("click", (event) => {
    const card = event.target.closest("[data-calc-id]");
    if (!card) return;
    const shell = document.getElementById("calculatorShell");
    if (!shell) return; // Allow natural hash navigation on other pages
    event.preventDefault();
    const id = card.dataset.calcId;
    const calc = calculators.find((item) => item.id === id);
    if (!calc) return;
    openCalculator(id, { scroll: true });
    history.pushState(null, "", `#${id}`);
  });
}

function renderCategories() {
  const container = document.getElementById("categoryCards");
  if (!container) return;
  container.innerHTML = CATEGORIES.map((category) => {
    const count = calculators.filter((calc) => calc.category === category.name).length;
    return `
      <a class="category-card" href="#calculators" data-category="${category.name}">
        <span class="calc-icon">${category.name.slice(0, 2).toUpperCase()}</span>
        <h3>${category.name}</h3>
        <p>${category.description}</p>
        <span class="tag">${count} tools</span>
      </a>`;
  }).join("");
  container.querySelectorAll("[data-category]").forEach((card) => {
    card.addEventListener("click", () => {
      state.activeCategory = card.dataset.category;
      renderFilters();
      renderCards();
    });
  });
}

function renderFilters() {
  const filter = document.getElementById("categoryFilter");
  if (!filter) return;
  const items = ["All", ...CATEGORIES.map((item) => item.name)];
  filter.innerHTML = items.map((item) => `<button type="button" aria-pressed="${state.activeCategory === item}" data-filter="${item}">${item}</button>`).join("");
  filter.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeCategory = button.dataset.filter;
      renderFilters();
      renderCards();
    });
  });
}

function renderCards() {
  const grid = document.getElementById("calculatorCards");
  const empty = document.getElementById("emptySearch");
  if (!grid || !empty) return;
  const filtered = calculators.filter((calc) => {
    const matchesCategory = state.activeCategory === "All" || calc.category === state.activeCategory;
    const haystack = `${calc.title} ${calc.description} ${calc.category}`.toLowerCase();
    const matchesSearch = !state.search || haystack.includes(state.search);
    return matchesCategory && matchesSearch;
  });
  grid.innerHTML = filtered.map((calc) => cardMarkup(calc)).join("");
  empty.hidden = filtered.length > 0;
}

function renderPopular() {
  const grid = document.getElementById("popularCards");
  if (!grid) return;
  grid.innerHTML = calculators.filter((calc) => calc.popular).map((calc) => cardMarkup(calc, "popular-card")).join("");
}

function cardMarkup(calc, className = "calculator-card") {
  return `
    <a class="${className}" href="#${calc.id}" data-calc-id="${calc.id}">
      <span class="calc-icon">${calc.icon}</span>
      <h3>${calc.title}</h3>
      <p>${calc.description}</p>
      <span class="tag-row"><span class="tag">${calc.category}</span></span>
    </a>`;
}

function openFromHash() {
  const hash = decodeURIComponent(window.location.hash.replace("#", ""));
  if (!hash) return;
  const calc = calculators.find((item) => item.id === hash);
  if (calc) openCalculator(calc.id, { scroll: true });
}

function openCalculator(id, options = {}) {
  const calc = calculators.find((item) => item.id === id);
  if (!calc) return;
  state.activeCalculator = calc.id;
  const workspaceTitle = document.getElementById("workspaceTitle");
  if (workspaceTitle) workspaceTitle.textContent = calc.title;
  const closeBtn = document.getElementById("closeWorkspaceBtn");
  if (closeBtn) closeBtn.hidden = false;
  updateActiveCards(calc.id);
  const shell = document.getElementById("calculatorShell");
  if (!shell) return;
  shell.innerHTML = `
    <div class="calculator-hero">
      <div class="calculator-hero-info">
        <p class="eyebrow">${calc.category}</p>
        <h3>${calc.title}</h3>
        <p>${calc.description}</p>
      </div>
      <div class="calculator-hero-icon" aria-hidden="true">${calc.icon}</div>
    </div>
    <div class="calculator-body">
      <form class="input-panel" id="${calc.id}-form" novalidate>
        <div class="field-grid">
          ${calc.fields.map((field) => fieldMarkup(calc.id, field)).join("")}
        </div>
        <div class="form-actions">
          <button class="primary-action" type="submit">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 4 12 14.01 9 11.01"/><path d="M22 4L12 14.01l-3-3L1 19"/></svg>
            Calculate
          </button>
          <button class="secondary-action" type="button" data-action="example">Example values</button>
          <button class="secondary-action" type="button" data-action="reset">Reset</button>
        </div>
        <div class="error-message" role="alert"></div>
      </form>
      <div class="result-panel" id="${calc.id}-result">
        <div class="result-placeholder">Enter values and click <strong>Calculate</strong> to see results.</div>
      </div>
    </div>`;

  const form = shell.querySelector("form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    calculateCurrent(calc, form);
  });
  form.querySelector('[data-action="example"]').addEventListener("click", () => {
    fillValues(form, calc.example);
    updateConditionalFields(calc, form);
    calculateCurrent(calc, form);
  });
  form.querySelector('[data-action="reset"]').addEventListener("click", () => {
    fillDefaults(form, calc.fields);
    clearError(form);
    state.results[calc.id] = null;
    document.getElementById(`${calc.id}-result`).innerHTML = `<div class="result-placeholder">Enter values and click <strong>Calculate</strong> to see results.</div>`;
    updateConditionalFields(calc, form);
  });
  form.addEventListener("change", () => updateConditionalFields(calc, form));
  updateConditionalFields(calc, form);
  if (options.scroll) {
    document.getElementById("calculatorWorkspace").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function fieldMarkup(calcId, field) {
  const id = `${calcId}-${field.name}`;
  const full = field.full ? " full" : "";
  const value = resolveDefault(field.defaultValue);
  if (field.type === "select") {
    return `
      <div class="field${full}">
        <label for="${id}">${field.label}</label>
        <select id="${id}" name="${field.name}">
          ${field.options.map(([optionValue, label]) => `<option value="${optionValue}" ${String(optionValue) === String(value) ? "selected" : ""}>${label}</option>`).join("")}
        </select>
        ${field.help ? `<small>${field.help}</small>` : ""}
      </div>`;
  }
  if (field.type === "textarea") {
    return `
      <div class="field${full}">
        <details class="advanced-field">
          <summary>Edit tax slab data (advanced)</summary>
          <label for="${id}">${field.label}</label>
          <textarea id="${id}" name="${field.name}" spellcheck="false">${escapeHtml(value)}</textarea>
          ${field.help ? `<small>${field.help}</small>` : ""}
        </details>
      </div>`;
  }
  return `
    <div class="field${full}" data-field-name="${field.name}">
      <label for="${id}">${field.label}</label>
      <input id="${id}" name="${field.name}" type="number" inputmode="decimal" value="${value}" min="${field.min}" max="${field.max}" step="${field.step}">
      ${field.help ? `<small>${field.help}</small>` : ""}
    </div>`;
}

function updateConditionalFields(calc, form) {
  if (calc.id !== "percentage") return;
  const mode = form.elements.mode.value;
  const visibleByMode = {
    percentOf: ["mode", "x", "y"],
    whatPercent: ["mode", "x", "y"],
    change: ["mode", "startValue", "endValue"]
  };
  const visible = new Set(visibleByMode[mode] || visibleByMode.percentOf);
  ["x", "y", "startValue", "endValue"].forEach((name) => {
    const wrapper = form.elements[name]?.closest(".field");
    if (wrapper) wrapper.hidden = !visible.has(name);
  });
}

function resolveDefault(value) {
  return typeof value === "function" ? value() : value;
}

function fillDefaults(form, fields) {
  fields.forEach((field) => {
    const input = form.elements[field.name];
    if (input) input.value = resolveDefault(field.defaultValue);
  });
}

function fillValues(form, values) {
  Object.entries(values).forEach(([name, value]) => {
    const input = form.elements[name];
    if (input) input.value = resolveDefault(value);
  });
}

function collectValues(calc, form) {
  const percentageRequiredByMode = {
    percentOf: new Set(["x", "y"]),
    whatPercent: new Set(["x", "y"]),
    change: new Set(["startValue", "endValue"])
  };
  const activePercentageFields = calc.id === "percentage"
    ? percentageRequiredByMode[form.elements.mode.value] || percentageRequiredByMode.percentOf
    : null;
  return calc.fields.reduce((values, field) => {
    if (field.type === "number") {
      const required = activePercentageFields?.has(field.name) || field.required;
      values[field.name] = getInputNumber(form, field.name, {
        label: field.label,
        min: field.min,
        max: field.max,
        positive: field.min > 0,
        required
      });
    } else {
      values[field.name] = form.elements[field.name].value;
    }
    return values;
  }, {});
}

function calculateCurrent(calc, form) {
  clearError(form);
  try {
    const values = collectValues(calc, form);
    const result = calc.calculate(values);
    state.results[calc.id] = result;
    renderResult(calc, result);
  } catch (error) {
    showError(form, error.message);
  }
}

function renderResult(calc, result) {
  const container = document.getElementById(`${calc.id}-result`);
  const tableMarkup = result.table ? `
    <div class="table-wrap">
      <table>
        <caption class="sr-only">${result.table.caption}</caption>
        <thead><tr>${result.table.columns.map((column) => `<th scope="col">${column}</th>`).join("")}</tr></thead>
        <tbody>${result.table.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
    </div>` : "";
  container.innerHTML = `
    <div class="summary-grid">
      ${result.summary.map((item) => `
        <div class="summary-card ${item.primary ? "primary" : ""}">
          <span class="stat-label">${item.label}</span>
          <strong>${item.value}</strong>
        </div>`).join("")}
    </div>
    ${renderChart(result.chart)}
    <p class="explanation">${result.explanation}</p>
    ${result.note ? `<p class="note">${result.note}</p>` : ""}
    ${tableMarkup}
    <div class="result-actions">
      <button class="secondary-action" type="button" data-result-action="copy">Copy result</button>
      <button class="secondary-action" type="button" data-result-action="csv">${result.table ? "Download table CSV" : "Download summary CSV"}</button>
    </div>`;
  container.querySelector('[data-result-action="copy"]').addEventListener("click", async (event) => {
    const button = event.currentTarget;
    await copyResult(calc.id);
    const original = button.textContent;
    button.textContent = "Copied!";
    button.disabled = true;
    window.setTimeout(() => {
      button.textContent = original;
      button.disabled = false;
    }, 1400);
  });
  container.querySelector('[data-result-action="csv"]').addEventListener("click", () => downloadResultCsv(calc.id));
}

function renderChart(chart) {
  if (!chart || !chart.length) return "";
  const total = chart.reduce((sum, item) => sum + Math.max(item.value, 0), 0);
  if (total <= 0) return "";
  return `<div class="result-bar" aria-label="Result split">${chart.map((item) => {
    const width = Math.max(0, item.value) / total * 100;
    return `<span class="${item.className}" title="${item.label}: ${formatCurrency(roundMoney(item.value))}" style="width:${width}%"></span>`;
  }).join("")}</div>`;
}

async function copyResult(id) {
  const result = state.results[id];
  if (!result) return false;
  const text = [
    calculators.find((calc) => calc.id === id)?.title || "Calculator result",
    ...result.summary.map((item) => `${item.label}: ${item.value}`),
    result.explanation
  ].join("\n");
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      if (typeof document.execCommand === "function") {
        document.execCommand("copy");
      }
      textArea.remove();
      return true;
    } catch {
      return false;
    }
  }
}

function downloadResultCsv(id) {
  const result = state.results[id];
  if (!result) return;
  const rows = result.table
    ? [result.table.columns, ...result.table.rows]
    : [["Metric", "Value"], ...result.summary.map((item) => [item.label, item.value])];
  downloadCsv(`${id}-result.csv`, rows);
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function renderGuides() {
  const container = document.getElementById("guideContent");
  if (!container) return;
  container.innerHTML = guides.map((calc) => `
    <article class="guide-card" id="guide-${calc.id}">
      <span class="tag">${calc.category}</span>
      <h3>${calc.title}</h3>
      <p>${calc.description}</p>
      <code>${calc.guide.formula}</code>
      <p>${calc.guide.example}</p>
      ${calc.guide.faqs.map(([question, answer]) => `
        <details>
          <summary>${question}</summary>
          <p>${answer}</p>
        </details>`).join("")}
    </article>`).join("");
}

function renderFaqSchema() {
  const el = document.getElementById("faqSchema");
  if (!el) return;
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guides.flatMap((calc) => calc.guide.faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer
      }
    })))
  };
  el.textContent = JSON.stringify(schema);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function runFormulaSelfChecks(log = true) {
  const checks = [
    {
      name: "EMI 1L 12% 12m",
      actual: computeEmi(100000, 12, 12),
      expected: 8884.88,
      tolerance: 1
    },
    {
      name: "Simple interest",
      actual: computeSimpleInterest(100000, 8, 3),
      expected: 24000,
      tolerance: 0.01
    },
    {
      name: "Lumpsum zero return",
      actual: computeLumpsum(100000, 0, 10),
      expected: 100000,
      tolerance: 0.01
    },
    {
      name: "GST add 18%",
      actual: 10000 * 1.18,
      expected: 11800,
      tolerance: 0.01
    },
    {
      name: "CAGR 100 to 121 for 2 years",
      actual: (Math.pow(121 / 100, 1 / 2) - 1) * 100,
      expected: 10,
      tolerance: 0.01
    }
  ].map((check) => ({
    ...check,
    passed: Math.abs(check.actual - check.expected) <= check.tolerance
  }));
  const failed = checks.filter((check) => !check.passed);
  if (log) {
    console.table(checks.map((check) => ({
      name: check.name,
      actual: roundMoney(check.actual),
      expected: check.expected,
      passed: check.passed
    })));
  }
  const section = document.getElementById("formulaSelfCheck");
  if (section) {
    section.textContent = JSON.stringify(checks, null, 2);
  }
  return { checks, failed };
}

window.CalcNestFinance = {
  calculators,
  helpers: {
    formatCurrency,
    formatNumber,
    formatPercent,
    getInputNumber,
    showError,
    clearError,
    computeEmi,
    computeSip,
    computeLumpsum,
    computeCompound,
    computeSimpleInterest
  },
  runFormulaSelfChecks
};
