/**
 * Referral directory compiled from publicly published hospital and doctor
 * directory pages. Every entry carries the URL the facts were read from and an
 * `evidence` flag:
 *
 *   "listed"   — the source page explicitly lists dementia / Alzheimer's /
 *                memory disorders among the conditions the doctor treats.
 *   "adjacent" — the doctor is a neurologist / psychiatrist at a major
 *                institution, but the page read did not confirm dementia-specific
 *                clinic work. Shown as such rather than implied.
 *
 * Nothing here is invented: no phone numbers, no registration numbers, no
 * qualifications that were not on the page. This is a signposting aid for a
 * research prototype — not an endorsement, not a referral, and not a
 * prescription.
 */

export const DIRECTORY_SOURCES = {
  retrieved: "2026-10-26",
  note: "Compiled from official hospital faculty pages and major public doctor directories.",
};

/** Which kind of specialist the predicted stage suggests discussing a referral with. */
export const REFERRAL_BY_STAGE = {
  NonDemented: {
    specialist: "Neurologist or geriatrician — routine review",
    urgency: "Routine follow-up",
    tone: "info",
    summary:
      "The model reports no dementia pattern. If there is still a subjective memory concern, a baseline clinical assessment is the reasonable next step rather than any treatment.",
    questions: [
      "Whether a baseline cognitive screen (MMSE / MoCA) is worth recording now",
      "Normal age-related change versus something that needs watching",
      "When to re-scan or re-assess if symptoms appear",
    ],
  },
  VeryMildDemented: {
    specialist: "Neurologist at a memory clinic, with a neuropsychologist",
    urgency: "Recommended soon",
    tone: "warning",
    summary:
      "The output suggests an early prodromal pattern. This stage is usually confirmed with formal cognitive testing and history — not with imaging alone — so a specialist visit matters more than the score itself.",
    questions: [
      "Formal cognitive testing (MMSE / MoCA) to establish a baseline",
      "Whether reversible causes (thyroid, B12, medication, sleep) should be ruled out",
      "Vascular risk review — blood pressure, diabetes, cholesterol",
      "Scheduling and driving, financial and legal planning while capacity is intact",
    ],
  },
  MildDemented: {
    specialist: "Neurologist (dementia specialist) plus a geriatric psychiatrist",
    urgency: "Recommended promptly",
    tone: "warning",
    summary:
      "The output suggests clinically noticeable decline. A specialist should confirm the stage, screen for treatable contributors and start support planning — medication decisions belong to them, not to this tool.",
    questions: [
      "Confirmation of stage with clinical history and cognitive testing",
      "Screening for depression, delirium and medication effects, which can mimic decline",
      "Whether a cholinesterase inhibitor is appropriate — prescriber's call only",
      "Caregiver support, day-care and safety adaptations at home",
    ],
  },
  ModerateDemented: {
    specialist: "Neurologist, geriatric psychiatrist and a rehabilitation team",
    urgency: "Book as soon as possible",
    tone: "error",
    summary:
      "The output suggests advanced decline. Prompt specialist involvement is about safety, caregiver burden and advance care planning as much as about the imaging finding.",
    questions: [
      "Home safety, wandering risk and supervision arrangements",
      "Caregiver respite and support services",
      "Advance care planning and power of attorney while the person can participate",
      "Review of falls, swallowing and other late-stage complications",
    ],
  },
};

export const DOCTORS = [
  /* ---------------- Bengaluru ---------------- */
  {
    id: "blr-mathuranath",
    name: "Prof. P. S. Mathuranath",
    quals: null,
    qualsNote: "Qualifications not shown on the faculty page read",
    designation: "Professor & Head, Neurology",
    specialty: "Neurology",
    institution: "NIMHANS",
    city: "Bengaluru",
    region: "bangalore",
    evidence: "listed",
    evidenceNote:
      "Faculty profile lists publications on Alzheimer's disease and dementia; NIMHANS runs a multidisciplinary cognitive neurology / dementia clinic.",
    source: "NIMHANS faculty page",
    url: "https://www.nimhans.ac.in/faculty/pavagada-sivasankara-mathuranath",
  },
  {
    id: "blr-anitha-chandra",
    name: "Dr. Anitha Chandra",
    quals: "MBBS, MRCPsych, CCT — Old Age Psychiatry",
    designation: "Geriatric Psychiatrist",
    specialty: "Psychiatry",
    institution: "Aster CMI Hospital, Hebbal",
    city: "Bengaluru",
    region: "bangalore",
    evidence: "listed",
    evidenceNote:
      "Practo lists dementia treatment among her services; trained in old-age psychiatry.",
    source: "Practo",
    url: "https://www.practo.com/bangalore/doctor/dr-anitha-chandra-psychiatrist-psychiatrist",
  },
  {
    id: "blr-lokesh-b",
    name: "Dr. Lokesh B",
    quals: "MBBS, MD (General Medicine), DM — Neurology",
    designation: "Head of Neurology",
    specialty: "Neurology",
    institution: "Aster CMI Hospital, Hebbal",
    city: "Bengaluru",
    region: "bangalore",
    evidence: "listed",
    evidenceNote: "Included in Practo's Bengaluru doctors-for-dementia-treatment listing.",
    source: "Practo",
    url: "https://www.practo.com/bangalore/doctor/dr-lokesh-b-neurologist",
  },
  {
    id: "blr-shiva-kumar-r",
    name: "Dr. Shiva Kumar R",
    quals: "MBBS, MD (General Medicine), DM — Neurology, DNB",
    designation: "Consultant Neurologist",
    specialty: "Neurology",
    institution: "Manipal Hospital, Sarjapur Road",
    city: "Bengaluru",
    region: "bangalore",
    evidence: "listed",
    evidenceNote: "Included in Practo's Bengaluru dementia-treatment listing.",
    source: "Practo",
    url: "https://www.practo.com/bangalore/doctor/dr-shiva-kumar-r-neurologist",
  },
  {
    id: "blr-dinesh-nayak",
    name: "Dr. Dinesh Nayak",
    quals: "MBBS, MD (General Medicine), DM — Neurology",
    designation: "Consultant Neurologist",
    specialty: "Neurology",
    institution: "KIMS Hospitals, Electronics City",
    city: "Bengaluru",
    region: "bangalore",
    evidence: "listed",
    evidenceNote: "Included in Practo's Bengaluru dementia-treatment listing.",
    source: "Practo",
    url: "https://www.practo.com/bangalore/doctors-for-dementia-treatment",
  },
  {
    id: "blr-madhusudhan",
    name: "Dr. B. K. Madhusudhan",
    quals: "MBBS, MD (General Medicine), DM — Neurology",
    designation: "Consultant Neurologist",
    institution: "Aster RV Hospital, JP Nagar",
    city: "Bengaluru",
    region: "bangalore",
    evidence: "listed",
    evidenceNote:
      "Included in Practo's dementia-treatment listing. The profile narrative also names SPARSH Hospital — confirm the current location first.",
    source: "Practo",
    url: "https://www.practo.com/bangalore/doctor/madhusudhan-b-k-neurologist",
  },
  {
    id: "blr-anirudh-kulkarni",
    name: "Dr. Anirudh V. Kulkarni",
    quals: "MBBS, MD (General Medicine), DM — Neurology",
    designation: "Consultant Neurologist",
    institution: "Apollo One, Electronics City",
    city: "Bengaluru",
    region: "bangalore",
    evidence: "listed",
    evidenceNote: "Profile lists Alzheimer's disease-related treatments among services.",
    source: "Practo",
    url: "https://www.practo.com/bangalore/doctor/anirudh-v-kulkarni-neurologist",
  },

  /* ---------------- Rest of India ---------------- */
  {
    id: "del-tripathi",
    name: "Dr. Manjari Tripathi",
    quals: "DM Neurology",
    designation: "Professor & Head, Neurology",
    specialty: "Neurology",
    institution: "AIIMS",
    city: "New Delhi",
    region: "india",
    evidence: "adjacent",
    evidenceNote:
      "AIIMS profile highlights contributions to cognitive neurology and dementia outreach; it does not state that she runs a dementia clinic.",
    source: "AIIMS faculty page",
    url: "https://www.aiims.edu/index.php/en/2014-12-18-11-27-59/neurology_faculty/193-neurology/1391-dr-manjari-tripathi",
  },
  {
    id: "del-zutshi",
    name: "Dr. Dhruv Vikram Zutshi",
    quals: "MBBS, MD (Medicine), DM Neurology",
    designation: "Additional Director, Neurology",
    specialty: "Neurology",
    institution: "Fortis Hospital, Vasant Kunj",
    city: "New Delhi",
    region: "india",
    evidence: "listed",
    evidenceNote: "Fortis profile specifically includes dementia among the conditions treated.",
    source: "Fortis Healthcare",
    url: "https://www.fortishealthcare.com/doctors/dr-dhruv-vikram-zutshi-6182",
  },
  {
    id: "ncr-arun-garg",
    name: "Dr. Arun Garg",
    quals: "MBBS, MD, DM Neurology",
    designation: "Chairman, Neurosciences",
    specialty: "Neurology",
    institution: "Medanta",
    city: "Gurugram",
    region: "india",
    evidence: "adjacent",
    evidenceNote:
      "Profile emphasises stroke care; dementia-specific clinical practice is not stated on the page read.",
    source: "Medanta",
    url: "https://www.medanta.org/hospitals-near-me/gurugram-hospital/speciality/neurology/doctor/dr-arun-garg",
  },
  {
    id: "mum-joy-desai",
    name: "Dr. Joy Desai",
    quals: "MBBS, MD (Internal Medicine), DNB Neurology",
    designation: "Director, Neurology",
    specialty: "Neurology",
    institution: "Jaslok Hospital",
    city: "Mumbai",
    region: "india",
    evidence: "listed",
    evidenceNote: "Profile lists expertise in cognition and neurodegenerative diseases.",
    source: "Jaslok Hospital",
    url: "https://www.jaslokhospital.net/doctor-profile/469",
  },
  {
    id: "navi-mumbai-neeraj-jain",
    name: "Dr. Neeraj Jain",
    quals: "MBBS, MD, DNB Medicine, DM Neurology, DNB Neurology",
    designation: "Consultant Neurologist",
    specialty: "Neurology",
    institution: "Apollo Hospitals, Navi Mumbai",
    city: "Navi Mumbai",
    region: "india",
    evidence: "listed",
    evidenceNote:
      "Apollo listing includes Alzheimer's disease among conditions managed; formerly Associate Professor at KEM Hospital.",
    source: "Apollo 24|7",
    url: "https://www.apollo247.com/doctors/dr-neeraj-jain-e4050446-ff10-4824-9e7d-dafe45dbc3b1",
  },
  {
    id: "mum-pardasani",
    name: "Dr. Vibhor Pardasani",
    quals: "DM (AIIMS, New Delhi)",
    designation: "Consultant Neurologist",
    specialty: "Neurology",
    institution: "Bombay Hospital",
    city: "Mumbai",
    region: "india",
    evidence: "adjacent",
    evidenceNote:
      "Profile lists general neurology, stroke and epilepsy interests — dementia is not named.",
    source: "Bombay Hospital",
    url: "https://www.bombayhospital.com/doctor/dr-vibhor-pardasani",
  },
  {
    id: "che-srikanth-srinivasan",
    name: "Dr. Srikanth Srinivasan",
    quals: "MD, DM (Neurology), Master of Psychiatry (Melbourne)",
    designation: "Consultant Neurologist",
    specialty: "Neurology",
    institution: "Apollo Hospitals, Greams Road",
    city: "Chennai",
    region: "india",
    evidence: "listed",
    evidenceNote:
      "Apollo listing names dementia, memory disorders, Lewy body dementia and frontotemporal dementia, with dementia training at UCSF's Memory and Aging Center.",
    source: "Apollo 24|7",
    url: "https://www.apollo247.com/doctors/dr-srikanth-srinivasan-63792eb3-e7ef-4105-ac0e-1f0d9939cd99",
  },
  {
    id: "hyd-sudhir-kumar",
    name: "Dr. Sudhir Kumar",
    quals: "MBBS, MD (Internal Medicine), DM (Neurology)",
    designation: "Consultant Neurologist",
    specialty: "Neurology",
    institution: "Apollo Hospitals, Jubilee Hills",
    city: "Hyderabad",
    region: "india",
    evidence: "listed",
    evidenceNote: "Apollo listing includes dementia among the conditions treated.",
    source: "Apollo 24|7",
    url: "https://www.apollo247.com/doctors/dr-sudhir-kumar-776a37a7-2cea-4cd7-9ee0-dcb1884d484a",
  },
  {
    id: "kol-ghosh",
    name: "Dr. Amitabha Ghosh",
    quals: "MBBS, MD, MRCP, CCST (Neurology), FRCP",
    designation: "Consultant Neurologist",
    specialty: "Neurology",
    institution: "Apollo Multispeciality Hospital",
    city: "Kolkata",
    region: "india",
    evidence: "listed",
    evidenceNote:
      "Apollo listing says he established one of India's early comprehensive dementia clinics and names Alzheimer's disease among conditions treated.",
    source: "Apollo 24|7",
    url: "https://www.apollo247.com/doctors/dr-amitabha-ghosh-age-should-be-above-sixteen-caf3c631-be7c-4d18-b2a4-01c9b7cca58e",
  },
  {
    id: "vel-prabhakar",
    name: "Dr. A. T. Prabhakar",
    quals: "MBBS, MD, DM Neurology",
    designation: "Professor, Neurology",
    specialty: "Neurology",
    institution: "Christian Medical College",
    city: "Vellore",
    region: "india",
    evidence: "adjacent",
    evidenceNote:
      "Faculty page lists cognitive neuroscience as an area of interest; membership of CMC's cognition-services team was not confirmed on the pages read.",
    source: "CMC Vellore, Neurology faculty",
    url: "http://neuro.cmcvellore.edu.in/division/neuromedicine/neuromedicine-faculty/",
  },
  {
    id: "mohali-prabhakar",
    name: "Dr. Sudesh Kumar Prabhakar",
    quals: "MD, DM",
    designation: "Director & HOD, Neurology",
    specialty: "Neurology",
    institution: "Fortis Hospital, Mohali",
    city: "Mohali",
    region: "india",
    evidence: "listed",
    evidenceNote:
      "Fortis states experience managing dementia and dementia-treatment research; retired from PGIMER Chandigarh in 2014.",
    source: "Fortis Healthcare",
    url: "https://www.fortishealthcare.com/doctors/dr-sudesh-kumar-prabhakar-1176",
  },
];

/** Region + specialty filters, plus the counts the UI shows. */
export function filterDoctors({ region = "all", specialty = "all", query = "" } = {}) {
  const q = query.trim().toLowerCase();
  return DOCTORS.filter((d) => {
    if (region !== "all" && d.region !== region) return false;
    if (specialty !== "all" && d.specialty !== specialty) return false;
    if (!q) return true;
    return [d.name, d.institution, d.city, d.specialty, d.quals ?? "", d.designation ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });
}

export const countByRegion = (region) =>
  region === "all" ? DOCTORS.length : DOCTORS.filter((d) => d.region === region).length;
