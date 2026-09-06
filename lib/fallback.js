// Deterministic parser: the parachute. If no API key is set, or the LLM
// errors or rate-limits, golden-path prompts still work end to end.

import { DEPARTMENTS } from "./departments";

const dep = (id) => DEPARTMENTS.find((d) => d.id === id);

function hasAny(text, words) {
  const t = text.toLowerCase();
  return words.some((w) => t.includes(w));
}

function draftFor(department, summary, detail) {
  return (
    `To the Public Grievance Officer, ${department}.\n\n` +
    `Subject: ${summary}.\n\n` +
    `Respected Sir/Madam,\n\n` +
    `I wish to bring to your notice the following grievance: ${detail} ` +
    `Despite the issue being raised locally, no action has been taken so far.\n\n` +
    `I request that the matter be examined and redressed within the stated timeline, ` +
    `and that I be informed of the action taken.\n\n` +
    `Sincerely,\nDemo Citizen`
  );
}

function result(overrides) {
  return {
    chat_reply: "",
    summary: "",
    is_cpgrams_eligible: true,
    excluded_reason: null,
    ministry: null,
    department: null,
    confidence: 0,
    routing_reasons: [],
    needs_clarification: false,
    clarification_question: null,
    clarification_chips: [],
    draft_text: null,
    priority_flags: [],
    location_guess: null,
    ...overrides,
  };
}

// Multi-turn: userTurns is every user message so far, joined. chipAnswer is
// the latest user turn when the previous agent turn asked for clarification.
export function fallbackParse(userTurns, askedClarification) {
  const text = userTurns.join(" ").toLowerCase();
  const last = userTurns[userTurns.length - 1] || "";

  // Excluded categories first — "RTI about road contracts" must not route as a road complaint.
  if (hasAny(text, ["rti", "right to information", "information about"])) {
    return result({
      chat_reply:
        "This reads like a request for information rather than a grievance — that path is RTI, not CPGRAMS. File it at rtionline.gov.in (a first RTI costs Rs 10). If an office has refused you a service, that refusal itself can be a grievance — tell me about that and I'll file it.",
      is_cpgrams_eligible: false,
      excluded_reason: "Information requests go through RTI, not CPGRAMS",
      summary: "RTI matter",
      confidence: 0.8,
    });
  }
  if (hasAny(text, ["court", "case chal raha", "sub judice", "judge"])) {
    return result({
      chat_reply:
        "If this matter is already before a court, CPGRAMS can't act on it — sub judice matters are excluded. If there's a separate service failure (say, an office refusing to accept documents), I can file that part.",
      is_cpgrams_eligible: false,
      excluded_reason: "Sub judice matters are excluded from CPGRAMS",
      summary: "Court matter",
      confidence: 0.75,
    });
  }

  // Turn 2 of the water golden path: chip answer arrived.
  if (askedClarification && hasAny(text, ["paani", "water", "jal"])) {
    const municipal = hasAny(last, ["municipal", "tap", "nagar", "city"]) || hasAny(last, ["not sure", "pata nahi"]);
    const d = municipal ? dep("municipal") : dep("jalshakti");
    const note = hasAny(last, ["not sure", "pata nahi"])
      ? "You weren't sure, so I went with the municipal body — city supply lines are theirs in most towns. The draft says so, and the officer will forward it if I guessed wrong."
      : "Got it.";
    return result({
      chat_reply: `${note} I've routed this to the ${d.department} and drafted your grievance below. Read it, edit anything, and file when you're ready.`,
      summary: "No water supply in the locality for around two weeks",
      ministry: d.ministry,
      department: d.department,
      confidence: municipal ? 0.86 : 0.9,
      routing_reasons: [
        "Water supply for residential areas is handled at this level",
        municipal ? "You indicated a municipal tap connection" : "You indicated a Jal Nigam supply line",
      ],
      draft_text: draftFor(
        d.department,
        "No water supply for around two weeks despite complaints",
        "The water supply to my street has been completely stopped for around two weeks. Residents, including elderly people, are dependent on private tankers. A complaint to the local office has produced no action."
      ),
      priority_flags: ["essential service", "ongoing for 2 weeks"],
    });
  }

  // Golden path 1: water problem, first turn -> clarify.
  if (hasAny(text, ["paani", "water supply", "no water", "jal nahi"])) {
    return result({
      chat_reply:
        "That sounds rough — two weeks without water is an essential-service failure, and it is exactly what CPGRAMS exists for. One question so it reaches the right office the first time:",
      summary: "No water supply in the locality",
      confidence: 0.62,
      routing_reasons: ["Water supply complaints split between the municipal body and the state Jal Nigam"],
      needs_clarification: true,
      clarification_question: "Is this a municipal tap connection or a Jal Nigam supply line?",
      clarification_chips: ["Municipal tap", "Jal Nigam line", "Not sure"],
      priority_flags: ["essential service"],
    });
  }

  // Golden path 2: PF claim stuck.
  if (hasAny(text, ["pf", "provident", "epf", "uan"])) {
    const d = dep("epfo");
    return result({
      chat_reply:
        "PF claims stuck without a stated reason are one of the most common grievances in the country — you're not alone. I've routed this to EPFO and drafted the grievance below. If you have your UAN handy, add it to the draft before filing; it speeds things up.",
      summary: "PF withdrawal claim pending beyond the stated timeline with no reason given",
      ministry: d.ministry,
      department: d.department,
      confidence: 0.95,
      routing_reasons: ["PF withdrawals and transfers are handled by EPFO directly"],
      draft_text: draftFor(
        d.department,
        "PF withdrawal claim pending beyond stated timeline",
        "My PF withdrawal claim has been showing 'Under Process' for around two months. The stated processing timeline has passed and no deficiency memo or reason has been communicated to me."
      ),
      priority_flags: ["financial hardship"],
    });
  }

  // Golden path 3: road / pothole -> clarify local vs highway.
  if (hasAny(text, ["road", "pothole", "sadak", "gaddha"])) {
    if (askedClarification) {
      const highway = hasAny(last, ["highway", "nh"]);
      const d = highway ? dep("morth") : dep("municipal");
      return result({
        chat_reply: `Understood. Routed to the ${d.department}; the draft is ready below.`,
        summary: "Damaged road causing accidents in the locality",
        ministry: d.ministry,
        department: d.department,
        confidence: 0.85,
        routing_reasons: [highway ? "National highways are NHAI's responsibility" : "Local roads are maintained by the municipal body"],
        draft_text: draftFor(
          d.department,
          "Badly damaged road surface causing daily accidents",
          "The road in my area is severely damaged with deep potholes. Two-wheeler riders have been injured, and during rain the potholes are invisible under water. No repair has been done despite local complaints."
        ),
        priority_flags: ["public safety"],
      });
    }
    return result({
      chat_reply: "I can file this. One question that decides which office is responsible:",
      summary: "Damaged road with potholes",
      confidence: 0.6,
      routing_reasons: ["Local streets belong to the municipality; national highways to NHAI"],
      needs_clarification: true,
      clarification_question: "Is this a street inside your town, or a national highway stretch?",
      clarification_chips: ["Local street", "National highway", "Not sure"],
      priority_flags: ["public safety"],
    });
  }

  // Other keyword routes: direct, no clarification.
  const direct = [
    ["power", ["bijli", "electricity", "power cut", "transformer"], "Frequent power cuts / electricity supply problem", "Electricity supply in my area has been erratic with long unscheduled cuts. Complaints to the local lineman and the helpline have produced no lasting fix."],
    ["petroleum", ["cylinder", "lpg", "gas booking"], "LPG cylinder delivery delayed repeatedly", "My LPG refill bookings are being delivered 10 to 15 days late by the distributor, and the delivery person demands extra money above the invoice."],
    ["railways", ["train", "refund", "irctc", "tatkal"], "Railway refund / service grievance", "My railway ticket refund (TDR) has been pending well beyond the stated timeline with no communication."],
    ["passport", ["passport"], "Passport application stuck", "My passport application has been stuck at police verification for weeks with no update from the office."],
    ["dfs", ["bank", "atm", "loan"], "Bank service grievance", "My bank has failed to resolve a transaction dispute within the promised timeline, and branch visits have produced no written response."],
    ["consumer", ["ration", "pds"], "Ration / PDS dealer grievance", "The fair price shop in my ward is overcharging above the notified PDS rate."],
  ];
  for (const [id, words, summary, detail] of direct) {
    if (hasAny(text, words)) {
      const d = dep(id);
      return result({
        chat_reply: `This belongs with the ${d.department}. I've drafted the grievance below — read it, edit anything, and file.`,
        summary,
        ministry: d.ministry,
        department: d.department,
        confidence: 0.82,
        routing_reasons: [d.scope.split(",")[0]],
        draft_text: draftFor(d.department, summary, detail),
        priority_flags: [],
      });
    }
  }

  // No match: guide to golden paths without pretending to understand.
  return result({
    chat_reply:
      "I want to route this correctly and I'm not confident I've understood the department yet (the full model isn't reachable right now). Could you try one of the samples below, or re-describe the problem with the service named — water, electricity, PF, ration, passport, train?",
    summary: last.slice(0, 80),
    confidence: 0.2,
    needs_clarification: true,
    clarification_question: "Which service is this about?",
    clarification_chips: ["Water supply", "Electricity", "PF claim", "Road repair"],
  });
}
