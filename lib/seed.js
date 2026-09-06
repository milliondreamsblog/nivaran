// Three seeded grievances so the judge's dashboard looks alive and every
// tracking state (on-time, breached, template-disposal) is demoable without waiting.

export const SEED_GRIEVANCES = [
  {
    id: "g-seed-1",
    regId: "NVRN/E/2026/04412",
    summary: "Streetlights not working in Gali No. 4, Shastri Nagar",
    ministry: "Ministry of Housing and Urban Affairs",
    department: "Urban Local Body (Nagar Nigam / Municipality)",
    location: "Shastri Nagar, Kanpur, Uttar Pradesh",
    filedAt: "2026-08-25",
    status: "in_progress",
    draft:
      "To the Public Grievance Officer, Kanpur Nagar Nigam.\n\nSubject: Non-functional streetlights in Gali No. 4, Shastri Nagar.\n\nRespected Sir/Madam,\n\nAll six streetlights in Gali No. 4, Shastri Nagar have been non-functional for over three weeks. The lane is completely dark after 7 pm and elderly residents have had two falls. A complaint at the ward office on 18 August produced no action.\n\nI request repair of the streetlights at the earliest.\n\nSincerely,\nDemo Citizen",
    events: [
      { day: 0, date: "2026-08-25", label: "Filed", plain: "Your grievance was registered and given ID NVRN/E/2026/04412." },
      { day: 1, date: "2026-08-26", label: "Routed", plain: "Sent to Kanpur Nagar Nigam, Electrical Wing. Routing took 1 day." },
      { day: 3, date: "2026-08-28", label: "With officer", plain: "Your complaint reached the responsible officer on day 3. They have 18 days left on the clock." },
    ],
  },
  {
    id: "g-seed-2",
    regId: "NVRN/E/2026/03871",
    summary: "PF withdrawal claim pending for 2 months, no reason given",
    ministry: "Ministry of Labour and Employment",
    department: "Employees' Provident Fund Organisation (EPFO)",
    location: "Ghaziabad, Uttar Pradesh",
    filedAt: "2026-08-06",
    status: "breached",
    draft:
      "To the Public Grievance Officer, EPFO Regional Office, Ghaziabad.\n\nSubject: Form 19 withdrawal claim pending beyond stated timeline (UAN 100XXXXXX234).\n\nRespected Sir/Madam,\n\nMy PF final settlement claim was submitted on 12 June 2026 and still shows 'Under Process'. The stated timeline of 20 days has long passed and no deficiency has been communicated.\n\nI request settlement of the claim or a written reason for the delay.\n\nSincerely,\nDemo Citizen",
    events: [
      { day: 0, date: "2026-08-06", label: "Filed", plain: "Your grievance was registered and given ID NVRN/E/2026/03871." },
      { day: 2, date: "2026-08-08", label: "Routed", plain: "Sent to EPFO Regional Office, Ghaziabad." },
      { day: 9, date: "2026-08-15", label: "With officer", plain: "Assigned to the accounts section. No update since." },
      { day: 22, date: "2026-08-28", label: "Deadline crossed", plain: "The 21-day redressal window has passed with no resolution. You can appeal now — one tap and Nivaran drafts it." },
    ],
  },
  {
    id: "g-seed-3",
    regId: "NVRN/E/2026/02659",
    summary: "Ration dealer charging Rs 5/kg above PDS rate",
    ministry: "Ministry of Consumer Affairs, Food and Public Distribution",
    department: "Department of Consumer Affairs / Ration (PDS)",
    location: "Ward 9, Lucknow, Uttar Pradesh",
    filedAt: "2026-07-20",
    status: "disposed_template",
    draft:
      "To the District Supply Officer, Lucknow.\n\nSubject: Overcharging by Fair Price Shop no. 114, Ward 9.\n\nRespected Sir/Madam,\n\nFair Price Shop no. 114 in Ward 9 has been charging Rs 5 per kg above the notified PDS rate for wheat since June. Multiple cardholders can confirm this.\n\nI request an inspection and action against the dealer.\n\nSincerely,\nDemo Citizen",
    events: [
      { day: 0, date: "2026-07-20", label: "Filed", plain: "Your grievance was registered and given ID NVRN/E/2026/02659." },
      { day: 4, date: "2026-07-24", label: "Routed", plain: "Sent to the District Supply Office, Lucknow." },
      { day: 25, date: "2026-08-14", label: "Disposed", plain: "Closed with the reply: 'The matter has been examined and necessary action taken.' Nivaran flagged this as a template reply — it names no inspection, date, or outcome. You can appeal." },
    ],
  },
];

export const WATCHER_EVENTS = [
  {
    id: "w1",
    detected: "2026-08-12",
    source: "Gazette notification CG-DL-E-12082026",
    title: "Ministry of Jal Shakti restructured grievance categories",
    detail:
      "Rural drinking water complaints move from 'DDWS-General' to three new sub-categories (supply, quality, scheme). 3 knowledge entries reference the old category.",
    proposal: "Update routing entries for jalshakti: map old 'DDWS-General' to 'JJM-Supply' unless quality keywords present.",
    status: "pending",
  },
  {
    id: "w2",
    detected: "2026-08-21",
    source: "EPFO circular WSU/2026/14",
    title: "EPFO claim timeline changed from 20 to 15 days",
    detail:
      "Auto-settlement now covers claims up to Rs 5 lakh; stated processing timeline reduced. 1 knowledge entry and 2 draft templates quote the old 20-day line.",
    proposal: "Update EPFO scope note and draft templates to state the 15-day timeline.",
    status: "pending",
  },
];
