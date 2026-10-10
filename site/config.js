/* Cloudboosta · single sources of truth for the marketing site.
   Edit values here; pages render from them. Carried over from the previous
   site's /v4/js/config.js so nothing that was configurable stops being so. */

window.CB = window.CB || {};

// The pathway cohorts carry NO published dates or deadlines (9-Oct-2026): the
// AI-Native Cloud Programme below is the only dated intake on the site. A null
// here renders nothing through data-cb, so a page cannot show a stale date.
CB.cohort = {
  enrolmentCloses: null,
  enrolmentClosesISO: null,
  startDate: null,
  seatCap: 20,
  seatsLeft: null,
  discountDeadline: null,
};

// The AI-Native Cloud Programme, /academy/ai-native-cloud/. Six Saturdays,
// one cohort, priced on its own rather than through CB.pricing. The page
// renders these through data-cb, so a date or price changes here, once.
CB.aiNative = {
  cohort: "Cohort 1",
  startDate: "Saturday 7 November 2026",
  startShort: "7 Nov",
  endDate: "Saturday 12 December 2026",
  sessionTime: "9am to 3pm UK time",
  liveHours: 6,
  weeks: 6,
  seatCap: 20,
  priceFull: "£799",
  instalment: "£430",
  instalmentTotal: "£860",
  corporateDiscount: "10%",
};

CB.pricing = {
  single:  1350,    // any one 8-week pathway
  bundle2: 2400,    // 2 pathways / 16 weeks
  three:   3450,    // 3 pathways / 24 weeks
  four:    4500,    // 4 pathways / 32 weeks
  aiNative: 799,    // the AI-Native Cloud Programme, 6 weeks
  splitSurcharge2: 100,
  splitSurcharge3: 200,
};

// Payment plans per pathway id (the enrol tiles' data-pathway): what each
// plan adds to the full fee and how many payments it is. A plan missing from
// a pathway's row is not offered and the enrol page hides its tile. Mirrors
// PLAN_RULES in src/payments.js, which is what Stripe is asked to charge;
// test/payments.test.js keeps the two identical.
CB.plans = {
  default: { full: { instalments: 1, surcharge: 0 }, split2: { instalments: 2, surcharge: 100 }, split3: { instalments: 3, surcharge: 200 } },
  ai:      { full: { instalments: 1, surcharge: 0 }, split2: { instalments: 2, surcharge: 61 } },
};

// Set 10-Oct-2026 from the ECB reference rates of 9-Oct-2026 (GBP/USD 1.322,
// GBP/EUR 1.180) and the CBN official GBP/NGN rate (about 1,759), rounded for
// a price list. Must equal FX in src/payments.js.
CB.fx = {
  GBP: { rate: 1,    symbol: "£" },
  USD: { rate: 1.32, symbol: "$" },
  EUR: { rate: 1.18, symbol: "€" },
  NGN: { rate: 1760, symbol: "₦" },
};

// The discovery-call booking page: a Google Calendar appointment schedule on the
// support account (recreated 2026-08-26; the previous one had been deleted
// upstream). Every data-booking button on the site uses it. Keep it in step with
// the BOOKING_URL* variables on Netlify, which the assessment report emails use.
CB.bookingUrl = "https://calendar.app.google/ZFmVD5jZGv3KFMN6A";

// WhatsApp routing: page → { number, prefilledText }
CB.whatsapp = {
  triage:   { number: "447592233052", text: "Hi Cloudboosta, I have a question. I'm interested in: [ ] cloud services for my company [ ] the Academy [ ] something else" },
  services: { number: "447565707254", text: "Hi, I'm interested in cloud / DevOps services for my team." },
  academy:  { number: "447592233052", text: "Hi, I have a question about the Academy cohort." },
  ainative: { number: "447592233052", text: "Hi, I have a question about the AI-Native Cloud Programme." },
  resources:{ number: "447592233052", text: "Hi, I had a question after reading your resources." },
  whoweare: { number: "447565707254", text: "Hi, I'd like to speak to someone at Cloudboosta." },
};

CB.isWorkingHours = function () {
  const now = new Date();
  const uk = new Date(now.toLocaleString("en-GB", { timeZone: "Europe/London" }));
  const day = uk.getDay();
  const hour = uk.getHours();
  return day >= 1 && day <= 6 && hour >= 8 && hour < 20;
};

CB.waLink = function (routeKey) {
  const r = CB.whatsapp[routeKey] || CB.whatsapp.triage;
  return "https://wa.me/" + r.number + "?text=" + encodeURIComponent(r.text);
};
