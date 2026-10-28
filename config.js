/* Learner Feedback app - shared settings for the form (index.html) and the report (report.html).
   Edit this file only; both pages read it, so the questions and the mapping always match. */
window.FEEDBACK_CONFIG = {
  version: '1.0',

  // Paste the Apps Script web app URL here after deploying apps-script/Code.gs.
  // Leave it blank to run in demo mode (responses are kept in this browser only).
  endpoint: 'https://script.google.com/macros/s/AKfycbzia_dAoWaw9yR5kz4gO8LoHRfBQdexi8Kc2nJ-Wqf19q0LBgTaDkGomgKgQ2mDF6p1/exec',

  trainer: 'Caesar Tado',
  rto: 'EIM Training Pty Ltd',
  course: 'TAE40122 Certificate IV in Training and Assessment',
  provider: 'Phoenix Academy',
  contact: 'caesar.tado@eim.edu.au',

  // Each program is keyed by its unit code. The key is used in links (?unit=UEEIC0013),
  // in stored responses and in the Sheet, so add it to PROGRAMS in Code.gs as well.
  // label is for the trainer report and PDF only; learners see the unit code and title.
  // tae: true adds the TAE40122 evidence wording to the learner consent. Leave it out for other units.
  // To add a unit: copy a block, change the key, title, mode, delivered and cohort, and add the code
  // to PROGRAMS in Code.gs (then redeploy a new version). label, tae and the map entries are optional.
  programs: {
    UEEIC0013: {
      label: 'Learning Program A',
      tae: true,
      title: 'Develop, enter and verify discrete control programs for programmable controllers',
      mode: 'Face to face',
      delivered: '19 January 2026',
      cohort: 4,
      photos: [
        { src: 'img/UEEIC0013-1.webp', caption: 'Session 1: Introduction to PLCs' },
        { src: 'img/UEEIC0013-2.webp', caption: 'Session 2: Setting up the PLC trainers' },
        { src: 'img/UEEIC0013-3.webp', caption: 'Session 2: Your first ladder program' },
        { src: 'img/UEEIC0013-4.webp', caption: 'Session 3: Timers and counters' },
        { src: 'img/UEEIC0013-5.webp', caption: 'Session 3: Assessed tasks briefing' }
      ]
    },
    UEEIC0038: {
      label: 'Learning Program B',
      tae: true,
      title: 'Solve problems in density/level measurement components and systems',
      mode: 'Online (Microsoft Teams)',
      delivered: '10 April 2026',
      cohort: 3,
      photos: [
        { src: 'img/UEEIC0038-1.webp', caption: 'Session 1: Welcome on Teams' },
        { src: 'img/UEEIC0038-2.webp', caption: 'Session 1: Level measurement technologies' },
        { src: 'img/UEEIC0038-3.webp', caption: 'Session 2: Transmitter suppression and elevation' },
        { src: 'img/UEEIC0038-4.webp', caption: 'Session 3: Measuring liquid density' },
        { src: 'img/UEEIC0038-5.webp', caption: 'Session 3: DP transmitter practical' },
        { src: 'img/UEEIC0038-6.webp', caption: 'Session 3: Wrap-up' }
      ]
    }
  },
  // photos (optional): pictures from the sessions, shown in a carousel at the top of the form.
  // Put the files in img/ (WebP or JPEG, about 1280 px wide) and list them here with a short caption.

  scale: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],

  // text: shown to learners. textBy overrides the text for a given unit code.
  // map: evidence mapping printed in the PDF, by unit code (UEEIC0013 face to face, UEEIC0038 online).
  questions: [
    { id: 'q1', section: 'Your training',
      text: 'I was told what I would learn, how I would be assessed and what was expected of me.',
      map: { UEEIC0013: 'TAEDEL411 El. 3; TAEASS412 El. 3; OS 1.4 (fairness)',
             UEEIC0038: 'TAEDEL405 El. 2; TAEASS412 El. 3; OS 1.4 (fairness)' } },
    { id: 'q2', section: 'Your training',
      text: 'The content was relevant to my job and current industry practice.',
      map: { UEEIC0013: 'TAEDES411 PC 3.2; OS 1.2 (industry relevance)',
             UEEIC0038: 'TAEDES411 PC 3.2; OS 1.2 (industry relevance)' } },
    { id: 'q3', section: 'Your training',
      text: 'The sessions were well organised and the pace suited me.',
      map: { UEEIC0013: 'TAEDES412 (plan and sequence); TAEDEL411 PC 4.3',
             UEEIC0038: 'TAEDES412 (plan and sequence); TAEDEL405 PC 1.4' } },
    { id: 'q4', section: 'Your training',
      text: 'The learning materials were clear and easy to read.',
      map: { UEEIC0013: 'TAELLN411; OS 1.1 (resources)',
             UEEIC0038: 'TAELLN411; TAEDEL405 PC 1.6; OS 1.1 (resources)' } },
    { id: 'q5', section: 'Your training',
      text: 'The trainer explained things clearly and used practical examples.',
      map: { UEEIC0013: 'TAEDEL411 El. 3',
             UEEIC0038: 'TAEDEL405 El. 3' } },
    { id: 'q6', section: 'Your training',
      text: 'I had chances to ask questions, practise and get feedback.',
      map: { UEEIC0013: 'TAEDEL411 El. 4',
             UEEIC0038: 'TAEDEL405 PC 3.4' } },
    { id: 'q7', section: 'Your training',
      text: 'My individual learning needs were recognised and supported.',
      map: { UEEIC0013: 'TAEDEL411 PC 1.4, 4.3; OS 2.4 (reasonable adjustment)',
             UEEIC0038: 'TAEDEL405 PC 2.3; OS 2.4 (reasonable adjustment)' } },
    { id: 'q8', section: 'Your training',
      textBy: { UEEIC0013: 'The workshop, equipment and safety briefing were ready and suitable.',
                UEEIC0038: 'The online platform, audio, video and files worked well for me.' },
      map: { UEEIC0013: 'TAEDEL411 PC 1.5, 3.1; OS 1.8 (facilities and equipment)',
             UEEIC0038: 'TAEDEL405 PC 1.6, 3.1' } },
    { id: 'q9', section: 'Your assessment',
      text: 'The assessment tasks matched what was taught.',
      map: { UEEIC0013: 'OS 1.3, 1.4 (validity); TAEASS412',
             UEEIC0038: 'OS 1.3, 1.4 (validity); TAEASS412' } },
    { id: 'q10', section: 'Your assessment',
      text: 'Feedback on my assessment was clear, and I know how to resubmit or appeal.',
      map: { UEEIC0013: 'TAEASS412 PC 5.6; OS 1.4 (fairness)',
             UEEIC0038: 'TAEASS412 PC 5.6; OS 1.4 (fairness)' } }
  ],

  overall: { id: 'overall', text: 'Overall, how would you rate this training?',
             map: { UEEIC0013: 'TAEDEL411 PC 5.1', UEEIC0038: 'TAEDEL405 PC 5.1' } },

  comments: [
    { id: 'good', text: 'What worked well for you?' },
    { id: 'change', text: 'What is one thing you would change?' }
  ],

  // Printed in the PDF next to the trainer's analysis and actions.
  reviewMap: {
    UEEIC0013: 'TAEDEL411 PC 5.1, 5.2; TAEDES411 PC 3.2, 3.3; TAEASS412 PC 6.2',
    UEEIC0038: 'TAEDEL405 El. 5; TAEDES411 PC 3.2, 3.3; TAEASS412 PC 6.2'
  }
};

// The unit code is the program key.
Object.keys(window.FEEDBACK_CONFIG.programs).forEach(k => { window.FEEDBACK_CONFIG.programs[k].unit = k; });
