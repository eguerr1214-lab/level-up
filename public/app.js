/* ============================================================
   LEVEL UP — app logic
   ============================================================ */
const $  = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const STORAGE_KEY = window.LEVELUP_STORAGE_KEY || 'levelup_state_v1';
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const DAYS_SHORT = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/* ---------- data ---------- */
const WORKOUTS = {
  Beginner: {
    name: 'Full Body Foundations', emoji: '🏋️', tag: 'FULL BODY', dur: 32, focus: 'Strength · Mobility · Form', list: 'Bodyweight + dumbbells',
    exercises: [
      { name: 'Push-Up', emoji: '💪', desc: 'Chest, shoulders, triceps', sets: 3, reps: '10 reps', secs: 40 },
      { name: 'Goblet Squat', emoji: '🦵', desc: 'Quads, glutes, core', sets: 3, reps: '12 reps', secs: 45 },
      { name: 'Glute Bridge', emoji: '🌉', desc: 'Glutes, hamstrings', sets: 3, reps: '15 reps', secs: 40 },
      { name: 'Plank', emoji: '🧘', desc: 'Deep core, shoulders', sets: 3, reps: '20 sec hold', secs: 30 },
      { name: 'Band Row', emoji: '🎗️', desc: 'Upper back, posture', sets: 3, reps: '12 reps', secs: 40 }
    ]
  },
  Intermediate: {
    name: 'Upper Strength + Core', emoji: '⚡', tag: 'UPPER BODY', dur: 42, focus: 'Strength · Control · Core', list: 'Dumbbells + bands',
    exercises: [
      { name: 'Dumbbell Bench', emoji: '🏋️', desc: 'Chest, triceps, shoulders', sets: 4, reps: '10 reps', secs: 45 },
      { name: 'Bent-Over Row', emoji: '🚣', desc: 'Lats, mid-back, biceps', sets: 4, reps: '10 reps', secs: 45 },
      { name: 'Split Squat', emoji: '🦵', desc: 'Quads, glutes, balance', sets: 3, reps: '10 / side', secs: 50 },
      { name: 'Overhead Press', emoji: '⬆️', desc: 'Shoulders, triceps, core', sets: 3, reps: '8 reps', secs: 40 },
      { name: 'Hollow Hold', emoji: '🧘', desc: 'Deep core, stability', sets: 3, reps: '30 sec hold', secs: 30 }
    ]
  },
  Advanced: {
    name: 'Power & Hypertrophy', emoji: '🔥', tag: 'PERFORMANCE', dur: 55, focus: 'Power · Strength · Density', list: 'Full gym',
    exercises: [
      { name: 'Bench Press', emoji: '🏋️', desc: 'Chest, shoulders, triceps', sets: 5, reps: '5 reps', secs: 55 },
      { name: 'Deadlift', emoji: '⚙️', desc: 'Posterior chain, grip', sets: 4, reps: '6 reps', secs: 60 },
      { name: 'Pull-Up', emoji: '🧲', desc: 'Lats, biceps, core', sets: 4, reps: '8 reps', secs: 45 },
      { name: 'Bulgarian Split Squat', emoji: '🦵', desc: 'Quads, glutes, balance', sets: 3, reps: '12 / side', secs: 55 },
      { name: 'Farmer Carry', emoji: '🧳', desc: 'Grip, traps, core', sets: 3, reps: '40 meters', secs: 45 }
    ]
  }
};

const SPORTS = {
  Basketball: { emoji:'🏀', focus:'Ball handling & finishing', weekly:'3 skill sessions · 1 game',
    drills:[
      {n:'Two-ball dribble series', d:'3 × 45 sec · hand speed & control', t:'Handles'},
      {n:'Form shooting', d:'50 makes · elbow alignment & arc', t:'Shooting'},
      {n:'Euro-step finishes', d:'3 × 8 reps · both sides', t:'Finishing'},
      {n:'Defensive slide ladder', d:'3 × 20 sec · low hips', t:'Defense'}
    ],
    goals:[{n:'Free-throw accuracy', v:72, label:'72% → 80%'},{n:'Weak-hand finishing', v:58, label:'58% → 75%'},{n:'Lateral quickness', v:66, label:'66% → 80%'}],
    radar:[84,76,68,72,70,82], note:'Your handles are ahead of your finishing — we\'ll bias left-hand reps this week.' },
  Football: { emoji:'🏈', focus:'Explosive power & footwork', weekly:'3 sessions · 1 game',
    drills:[
      {n:'Acceleration starts', d:'6 × 10 yd · low drive', t:'Speed'},
      {n:'Route-release footwork', d:'3 × 8 reps · clean breaks', t:'Footwork'},
      {n:'Med-ball rotational throws', d:'3 × 6 / side', t:'Power'},
      {n:'Catch & tuck ladder', d:'4 × 30 sec', t:'Ball security'}
    ],
    goals:[{n:'40-yard split', v:62, label:'5.1s → 4.8s'},{n:'Vertical jump', v:68, label:'24" → 28"'},{n:'Route precision', v:74, label:'74% → 85%'}],
    radar:[78,80,86,72,68,76], note:'Power is your edge — keep sprint mechanics sharp on recovery days.' },
  Soccer: { emoji:'⚽', focus:'First touch & agility', weekly:'3 sessions · 1 match',
    drills:[
      {n:'Wall pass combos', d:'4 × 60 sec · both feet', t:'Touch'},
      {n:'Cone weave dribble', d:'4 × 30 sec', t:'Agility'},
      {n:'Finishing angles', d:'20 shots · near & far post', t:'Finishing'},
      {n:'Pressing shadow drill', d:'3 × 45 sec', t:'Defense'}
    ],
    goals:[{n:'Weak-foot passes', v:64, label:'64% → 80%'},{n:'Sprint endurance', v:70, label:'70% → 85%'},{n:'First-touch control', v:76, label:'76% → 88%'}],
    radar:[80,82,70,84,72,78], note:'Engine is strong. Small-sided games will sharpen your first touch under pressure.' },
  Baseball: { emoji:'⚾', focus:'Rotational power & accuracy', weekly:'3 sessions · 2 games',
    drills:[
      {n:'Tee work — inside pitch', d:'25 swings · stay through it', t:'Hitting'},
      {n:'Long toss progression', d:'10 min · build to 90 ft', t:'Arm care'},
      {n:'Med-ball rotational throws', d:'3 × 8 / side', t:'Power'},
      {n:'Short-hop footwork', d:'3 × 12 reps', t:'Fielding'}
    ],
    goals:[{n:'Exit velocity', v:66, label:'78 → 85 mph'},{n:'Throw accuracy', v:72, label:'72% → 84%'},{n:'Sprint to first', v:60, label:'4.6s → 4.3s'}],
    radar:[82,68,84,64,78,74], note:'Rotational power is trending up. Keep arm-care days non-negotiable.' },
  Tennis: { emoji:'🎾', focus:'Footwork & serve rhythm', weekly:'3 sessions · 1 match',
    drills:[
      {n:'Split-step reaction', d:'4 × 30 sec', t:'Footwork'},
      {n:'Serve toss consistency', d:'30 serves · same toss', t:'Serve'},
      {n:'Cross-court rally', d:'10 min · depth control', t:'Groundstrokes'},
      {n:'Approach & volley', d:'3 × 8 reps', t:'Net play'}
    ],
    goals:[{n:'First-serve %', v:64, label:'64% → 72%'},{n:'Return depth', v:70, label:'70% → 82%'},{n:'Court coverage', v:75, label:'75% → 86%'}],
    radar:[80,78,66,72,84,76], note:'Your focus scores highest — use it to build a repeatable serve ritual.' },
  Volleyball: { emoji:'🏐', focus:'Jump power & touch', weekly:'3 sessions · 1 match',
    drills:[
      {n:'Approach jump reps', d:'4 × 6 · full arm swing', t:'Jumping'},
      {n:'Wall setting', d:'4 × 45 sec', t:'Setting'},
      {n:'Serve receive platform', d:'30 balls · target zones', t:'Passing'},
      {n:'Block footwork', d:'3 × 10 reps', t:'Blocking'}
    ],
    goals:[{n:'Vertical jump', v:62, label:'22" → 26"'},{n:'Serve accuracy', v:74, label:'74% → 86%'},{n:'Pass rating', v:70, label:'70% → 82%'}],
    radar:[74,70,80,68,76,72], note:'Jump power responds fast to consistent landing mechanics. Quality over volume.' },
  Track: { emoji:'🏃', focus:'Speed mechanics & endurance', weekly:'4 sessions · 1 meet',
    drills:[
      {n:'A-skip drill', d:'4 × 20 m · posture tall', t:'Mechanics'},
      {n:'Flying 30s', d:'5 reps · full recovery', t:'Speed'},
      {n:'Tempo 200s', d:'4 × 200 m · relaxed', t:'Endurance'},
      {n:'Hip mobility flow', d:'10 min · after run', t:'Recovery'}
    ],
    goals:[{n:'100m time', v:68, label:'12.4s → 11.8s'},{n:'Stride consistency', v:72, label:'72% → 85%'},{n:'Aerobic base', v:64, label:'64% → 78%'}],
    radar:[72,88,74,82,70,74], note:'Speed is your weapon. Keep easy days truly easy to protect it.' },
  Other: { emoji:'🥇', focus:'Athletic base & coordination', weekly:'3 sessions · 1 event',
    drills:[
      {n:'Dynamic warm-up flow', d:'8 min · full body', t:'Prep'},
      {n:'Agility ladder', d:'4 × 30 sec', t:'Agility'},
      {n:'Single-leg balance', d:'3 × 30 sec / side', t:'Control'},
      {n:'Sprint mechanics', d:'5 × 20 m', t:'Speed'}
    ],
    goals:[{n:'Overall conditioning', v:66, label:'66% → 80%'},{n:'Coordination', v:70, label:'70% → 84%'},{n:'Explosive power', v:62, label:'62% → 78%'}],
    radar:[74,76,72,70,72,76], note:'A strong athletic base transfers to every sport. Keep the foundation broad.' }
};

const FLASHCARDS = [
  { q:'What is the main function of mitochondria?', a:'They produce ATP — the energy currency cells use for almost every process.' },
  { q:'What happens during glycolysis?', a:'Glucose breaks down into pyruvate in the cytoplasm, producing 2 ATP and NADH.' },
  { q:'Why does the body switch to anaerobic respiration?', a:'When oxygen can\'t meet demand, cells rely on anaerobic pathways — fast but short-lived energy.' },
  { q:'What is the role of NADH in cellular respiration?', a:'It carries electrons to the electron transport chain, helping build the proton gradient for ATP.' },
  { q:'How many ATP does aerobic respiration produce per glucose?', a:'Roughly 30–32 ATP — far more than anaerobic pathways.' }
];

const QUIZ = [
  { q:'Which process produces the most ATP per glucose molecule?', opts:['Glycolysis','Anaerobic respiration','Aerobic respiration','Fermentation'], answer:2, why:'Aerobic respiration yields ~30–32 ATP via the electron transport chain.' },
  { q:'Where does the Krebs cycle take place?', opts:['Cytoplasm','Mitochondrial matrix','Cell membrane','Nucleus'], answer:1, why:'The Krebs cycle runs in the mitochondrial matrix, feeding NADH into the ETC.' }
];

/* Achievements are computed from stored activity — nothing is pre-marked as earned. */
const ACHIEVEMENTS = [
  { id:'first-step', icon:'🌱', name:'First Step', desc:'Complete your first activity', goal:1, value:() => totalActivityCount() },
  { id:'habit-builder', icon:'🌅', name:'Habit Builder', desc:'Complete 5 habits', goal:5, value:() => countLedger('habit:') },
  { id:'streak-3', icon:'🔥', name:'Warm Streak', desc:'Stay active 3 days in a row', goal:3, value:() => longestStreak() },
  { id:'streak-7', icon:'🏆', name:'7-Day Streak', desc:'Stay active 7 days in a row', goal:7, value:() => longestStreak() },
  { id:'hydrated', icon:'💧', name:'Hydrated', desc:'Hit your water goal 7 times', goal:7, value:() => countLedger('water:') },
  { id:'focused', icon:'🎯', name:'Focused', desc:'Finish 3 focus sessions', goal:3, value:() => countLedger('focus:') },
  { id:'strong-start', icon:'💪', name:'Strong Start', desc:'Record your first workout', goal:1, value:() => (state.workoutHistory || []).length },
  { id:'iron-will', icon:'⚙️', name:'Iron Will', desc:'Record 10 workouts', goal:10, value:() => (state.workoutHistory || []).length },
  { id:'scholar', icon:'🎓', name:'Scholar', desc:'Complete 5 assignments', goal:5, value:() => countLedger('assignment:') },
  { id:'athlete', icon:'🏅', name:'Athlete', desc:'Complete 10 sport drills', goal:10, value:() => countLedger('drill:') },
  { id:'century', icon:'💯', name:'Century Club', desc:'Earn 1,000 XP', goal:1000, value:() => totalXp() },
  { id:'level-10', icon:'👑', name:'Level 10', desc:'Reach level 10', goal:10, value:() => levelInfo(totalXp()).level }
];

const HABIT_ICONS = ['🌅','🌙','💧','🧘','📓','📖','📵','🥗','🏃','🧠'];
const SUBJECT_COLORS = ['#4C8DFF','#3DDC97','#FF9F45','#FF5C8A','#9B5CFF','#38E0CE','#FFD166'];

const QUOTES = [
  ['Small steps, repeated daily, become the identity you\'re building.', 'LEVEL UP · DAILY REMINDER'],
  ['You don\'t need more motivation. You need a smaller first step.', 'COACH NOTE'],
  ['Discipline is choosing what you want most over what you want now.', 'LEVEL UP · DAILY REMINDER'],
  ['The version of you that quits isn\'t invited today.', 'COACH NOTE'],
  ['Progress hides in boring repetitions. Keep going.', 'LEVEL UP · DAILY REMINDER']
];

const WEEK_PLAN = {
  Beginner: ['Full Body Foundations','Mobility & Core','Full Body A','Active Recovery','Lower Body Basics','Walk + Stretch','Rest'],
  Intermediate: ['Upper Strength + Core','Lower Power','Mobility Flow','Push / Pull','Conditioning','Recovery Walk','Rest'],
  Advanced: ['Power & Hypertrophy','Speed & Agility','Upper Volume','Active Recovery','Lower Strength','Conditioning','Rest']
};

/* ---------- state ---------- */
function todayKey(d = new Date()){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function dateFromKey(key){
  const [y,m,d] = String(key || '').split('-').map(Number);
  return new Date(y || 2024, (m || 1) - 1, d || 1);
}
function shiftKey(key, days){
  const d = dateFromKey(key);
  d.setDate(d.getDate() + days);
  return todayKey(d);
}
function uid(prefix){ return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`; }

const HABIT_XP = 5, DRILL_XP = 10, ASSIGN_XP = 15, GOAL_XP = 10, FOCUS_XP = 20;
const TASK_XP = { morning:15, workout:40, study:30, drills:25, water:15 };
function taskKeyFor(id){
  const day = todayKey();
  if (id === 'workout') return `workout:${day}`;
  if (id === 'water') return `water:${day}`;
  return `task:${id}:${day}`;
}

function defaultHabits(){
  return [
    { id:'h_morning', name:'Morning routine', icon:'🌅', reminder:'7:00 AM' },
    { id:'h_water', name:'Hydration', icon:'💧', reminder:'' },
    { id:'h_stretch', name:'Stretch', icon:'🧘', reminder:'' },
    { id:'h_night', name:'Night routine', icon:'🌙', reminder:'9:30 PM' }
  ];
}
function defaultAssignments(){
  const t = todayKey();
  return [
    { id:'a_alg', title:'Algebra: Quadratics worksheet', subject:'Math', color:'#4C8DFF', due:shiftKey(t,1), done:false },
    { id:'a_bio', title:'Biology lab report — cellular energy', subject:'Biology', color:'#3DDC97', due:shiftKey(t,4), done:false },
    { id:'a_hist', title:'History reading + notes (pp. 142–160)', subject:'History', color:'#FF9F45', due:shiftKey(t,6), done:false },
    { id:'a_span', title:'Spanish vocab set 7', subject:'Spanish', color:'#FF5C8A', due:shiftKey(t,3), done:false }
  ];
}
function defaultGrades(){
  return [
    { id:'g_math', name:'Math', value:92 }, { id:'g_bio', name:'Biology', value:88 },
    { id:'g_hist', name:'History', value:85 }, { id:'g_span', name:'Spanish', value:90 },
    { id:'g_eng', name:'English', value:87 }
  ];
}
function defaultWorkoutSchedule(difficulty = 'Beginner'){
  const plan = WEEK_PLAN[difficulty] || WEEK_PLAN.Beginner;
  return plan.map(title => ({
    title,
    minutes: /rest/i.test(title) ? 0 : /recovery|stretch|walk|mobility/i.test(title) ? 20 : 40
  }));
}
function defaultSportSchedule(sport){
  const sp = SPORTS[sport] || SPORTS.Basketball;
  return [
    { title:`${sp.drills[0].t} focus`, detail:'35 min · after school', minutes:35 },
    { title:'Strength + mobility', detail:'30 min · gym or home', minutes:30 },
    { title:sp.drills[1].n, detail:'25 min · skill block', minutes:25 },
    { title:'Recovery + film study', detail:'20 min · low intensity', minutes:20 },
    { title:'Team practice', detail:'90 min · full intensity', minutes:90 },
    { title:'Game day', detail:'Warm-up + compete', minutes:60 },
    { title:'Reset & mobility', detail:'15 min · easy', minutes:15 }
  ];
}
function defaultSportGoals(sport){
  const sp = SPORTS[sport] || SPORTS.Basketball;
  return sp.goals.map((g, i) => ({ id:`sg_${sport.toLowerCase()}_${i}`, name:g.n, value:g.v, target:100, unit:'%', legacyLabel:g.label }));
}

function defaultState(){
  return {
    v: 2,
    onboarded: false,
    name: 'Alex',
    age: '16–18',
    interests: ['Strength','Sports','School','Discipline'],
    sports: ['Basketball'],
    experience: 'Beginner',
    equipment: ['Bodyweight','Dumbbells'],
    schoolGoals: ['Better grades','Homework on time'],
    time: '40 minutes',
    goal: 'Get stronger',
    xpBase: 0,
    xpLedger: {},
    activeDays: {},
    achievements: {},
    habits: defaultHabits(),
    habitLog: {},
    tasksDone: {},
    tasksDay: todayKey(),
    water: 0,
    waterGoal: 8,
    difficulty: 'Beginner',
    sport: 'Basketball',
    customCards: [],
    fcIndex: 0,
    quizIndex: 0,
    quizAnswer: null,
    dayCelebrated: false,
    assignments: defaultAssignments(),
    grades: defaultGrades(),
    workoutHistory: [],
    workoutSchedule: defaultWorkoutSchedule('Beginner'),
    scheduleCustom: false,
    sportSchedules: {},
    sportGoals: {},
    drillsDone: {},
    weekMinutes: [0,0,0,0,0,0,0],
    settings: { reminders: true, haptics: true, accent: 'midnight' }
  };
}

function defaultState(){
  return {
    v: 1,
    onboarded: false,
    name: 'Alex',
    age: '16–18',
    interests: ['Strength','Sports','School','Discipline'],
    sports: ['Basketball'],
    experience: 'Beginner',
    equipment: ['Bodyweight','Dumbbells'],
    schoolGoals: ['Better grades','Homework on time'],
    time: '40 minutes',
    habits: ['Morning routine','Hydration','Stretch','Night routine'],
    goal: 'Get stronger',
    xp: 1240,
    streak: 12,
    water: 3,
    waterGoal: 8,
    difficulty: 'Beginner',
    sport: 'Basketball',
    tasksDone: {},
    habitsDone: {},
    habitIcons: {},
    habitReminders: {},
    customCards: [],
    drillsDone: {},
    quizIndex: 0,
    quizAnswer: null,
    quizAwarded: {},
    dayCelebrated: false,
    fcIndex: 0,
    assignments: defaultAssignments(),
    weekMinutes: [38, 52, 0, 64, 45, 72, 30],
    settings: { reminders: true, haptics: true, accent: 'midnight' }
  };
}

let state = loadState();
function loadState(){
  const fresh = () => {
    const s = defaultState();
    if (window.LEVELUP_USER) {
      // A signed-in account already has an identity, so skip the intro wizard.
      // Personalization stays available from Profile → "Redo personalization".
      if (window.LEVELUP_USER.name) s.name = window.LEVELUP_USER.name;
      s.onboarded = true;
    }
    return s;
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh();
    const saved = JSON.parse(raw) || {};
    return migrateState(saved, fresh());
  } catch(e){ return fresh(); }
}

/* Upgrade any earlier save into the v2 shape without dropping user data. */
function migrateState(saved, base){
  const s = Object.assign(base, saved);
  s.v = 2;
  s.xpLedger = Object.assign({}, saved.xpLedger || {});
  s.activeDays = Object.assign({}, saved.activeDays || {});
  s.achievements = Object.assign({}, saved.achievements || {});
  s.habitLog = Object.assign({}, saved.habitLog || {});
  s.tasksDone = Object.assign({}, saved.tasksDone || {});
  s.drillsDone = Object.assign({}, saved.drillsDone || {});
  s.sportSchedules = Object.assign({}, saved.sportSchedules || {});
  s.sportGoals = Object.assign({}, saved.sportGoals || {});
  s.workoutHistory = Array.isArray(saved.workoutHistory) ? saved.workoutHistory : [];
  s.grades = Array.isArray(saved.grades) ? saved.grades : defaultGrades();
  s.customCards = Array.isArray(saved.customCards) ? saved.customCards : [];
  s.settings = Object.assign({ reminders: true, haptics: true, accent: 'midnight' }, saved.settings || {});

  // v1 kept a plain `xp` counter and a fake streak. Keep the earned total, but
  // turn it into a ledger so nothing can be awarded twice.
  const legacyXp = Number.isFinite(saved.xp) ? saved.xp : (Number.isFinite(saved.xpBase) ? saved.xpBase : 0);
  s.xpBase = Number.isFinite(saved.xpBase) ? saved.xpBase : Math.max(0, legacyXp);
  delete s.xp;
  delete s.streak;
  delete s.habitsDone;
  delete s.habitIcons;
  delete s.habitReminders;
  delete s.quizAwarded;

  // v1 habits were plain strings.
  if (!Array.isArray(saved.habits) || !saved.habits.length) {
    s.habits = defaultHabits();
  } else if (typeof saved.habits[0] === 'string') {
    const icons = saved.habitIcons || {}, reminders = saved.habitReminders || {};
    s.habits = saved.habits.map((name, i) => ({
      id: 'h_' + String(name).toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      name, icon: icons[name] || HABIT_ICONS[i % HABIT_ICONS.length], reminder: reminders[name] || ''
    }));
  }

  // v1 assignments stored display strings ("Tomorrow"); convert to real dates.
  s.assignments = (Array.isArray(saved.assignments) ? saved.assignments : defaultAssignments()).map(a => {
    const dueMap = { tomorrow: 1, monday: 6, tuesday: 5, wednesday: 4, thursday: 3, friday: 2 };
    let due = a.due;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(due))) {
      const key = String(due || '').toLowerCase().replace(/[^a-z]/g, '');
      due = shiftKey(todayKey(), dueMap[key] != null ? dueMap[key] : 2);
    }
    return { id: a.id || uid('a'), title: a.title || 'Assignment', subject: a.subject || 'General',
      color: a.color || SUBJECT_COLORS[0], due, done: !!a.done };
  });

  // Real weekly minutes start from stored history rather than sample bars.
  if (!Array.isArray(saved.weekMinutes) || saved.weekMinutes.some(n => !Number.isFinite(n))) {
    s.weekMinutes = [0,0,0,0,0,0,0];
  }
  if (!Array.isArray(s.workoutSchedule) || !s.workoutSchedule.length) {
    s.workoutSchedule = defaultWorkoutSchedule(s.difficulty);
  }
  s.scheduleCustom = !!saved.scheduleCustom;

  // Yesterday's completed daily tasks should not carry over as "done today".
  if (saved.tasksDay !== todayKey()) {
    s.tasksDone = {};
    s.drillsDone = {};
    s.tasksDay = todayKey();
    s.water = 0;
    s.dayCelebrated = false;
  }

  // Seed the ledger from anything already completed today so it cannot pay out twice.
  Object.keys(s.tasksDone).forEach(id => { if (s.tasksDone[id]) s.xpLedger[taskKeyFor(id)] = TASK_XP[id] || 10; });
  Object.keys(s.habitLog[todayKey()] || {}).forEach(hid => { if (s.habitLog[todayKey()][hid]) s.xpLedger[`habit:${hid}:${todayKey()}`] = HABIT_XP; });
  Object.keys(s.drillsDone).forEach(d => { if (s.drillsDone[d]) s.xpLedger[`drill:${d}:${todayKey()}`] = DRILL_XP; });
  s.assignments.forEach(a => { if (a.done) s.xpLedger[`assignment:${a.id}`] = ASSIGN_XP; });
  return s;
}

function saveState(){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e){}
}

/* ---------- derived helpers ---------- */
function nowParts(){
  const d = new Date();
  const mondayIndex = (d.getDay() + 6) % 7;
  return { d, mondayIndex, hour: d.getHours() };
}
function firstName(){ return (state.name || 'Champion').trim().split(' ')[0]; }
function initial(){ return (firstName()[0] || 'A').toUpperCase(); }
function ledgerSum(){
  const l = state.xpLedger || {};
  return Object.keys(l).reduce((sum, k) => sum + (Number(l[k]) || 0), 0);
}
function totalXp(){ return Math.max(0, (Number(state.xpBase) || 0) + ledgerSum()); }
function countLedger(prefix){
  return Object.keys(state.xpLedger || {}).filter(k => k.startsWith(prefix) && state.xpLedger[k] > 0).length;
}
function markActive(key = todayKey()){ state.activeDays[key] = true; }
function longestStreak(){
  const days = Object.keys(state.activeDays || {}).sort();
  let best = 0, run = 0, prev = null;
  days.forEach(day => {
    run = prev && shiftKey(prev, 1) === day ? run + 1 : 1;
    best = Math.max(best, run);
    prev = day;
  });
  return best;
}
function currentStreak(){
  let key = todayKey(), streak = 0;
  if (!state.activeDays[key]) key = shiftKey(key, -1);
  while (state.activeDays[key]) { streak++; key = shiftKey(key, -1); }
  return streak;
}
function totalActivityCount(){ return countLedger('') ; }
function achievementsView(){
  return ACHIEVEMENTS.map(a => {
    const value = a.value();
    const earned = value >= a.goal;
    return { ...a, value, earned, pct: Math.min(100, Math.round(value / a.goal * 100)) };
  });
}
function checkAchievements(){
  const unlocked = [];
  achievementsView().forEach(a => {
    if (a.earned && !state.achievements[a.id]) { state.achievements[a.id] = todayKey(); unlocked.push(a); }
  });
  return unlocked;
}
function announceAchievements(list){
  if (!list.length) return;
  setTimeout(() => { toast(`Achievement unlocked — ${list[0].name}!`, list[0].icon); confetti(); }, 420);
}
/* Awards XP exactly once per activity key. Returns false when it was already paid. */
function awardXp(key, amount, label, icon = '✦', opts = {}){
  if (!key) return false;
  state.xpLedger = state.xpLedger || {};
  if (state.xpLedger[key]) return false;
  const before = levelInfo(totalXp()).level;
  state.xpLedger[key] = amount;
  markActive();
  const after = levelInfo(totalXp()).level;
  if (!opts.silent) toast(`+${amount} XP${label ? ' · ' + label : ''}`, icon);
  if (!opts.silent) haptic();
  if (after > before) {
    setTimeout(() => { toast(`Level ${after} unlocked — ${levelInfo(totalXp()).name}!`, '👑'); confetti(); }, 350);
  }
  announceAchievements(checkAchievements());
  return true;
}
/* Reverses a single award when the user un-completes something. */
function revokeXp(key){
  if (state.xpLedger && state.xpLedger[key] != null) delete state.xpLedger[key];
}

function levelInfo(xp){
  const level = Math.floor(xp / 200) + 1;
  const into = xp % 200;
  const names = ['Getting Started','Building Momentum','Finding Rhythm','Consistent','Disciplined','Momentum Builder','Locked In','Relentless','Elite','Unstoppable'];
  const name = names[Math.min(names.length - 1, Math.floor((level - 1) / 2))];
  return { level, into, need: 200 - into, pct: Math.round(into / 200 * 100), name };
}
function fmt(n){ return Number(n).toLocaleString('en-US'); }
function esc(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function currentWorkout(){ return WORKOUTS[state.difficulty] || WORKOUTS.Beginner; }
function currentSport(){ return SPORTS[state.sport] || SPORTS.Basketball; }
function sportName(){ return state.sport || state.sports[0] || 'Basketball'; }

function getCards(){ return [...FLASHCARDS, ...(state.customCards || [])]; }
function makeTasks(){
  const w = currentWorkout();
  const sport = currentSport();
  const habitName = (state.habits[0] && state.habits[0].name) || 'Morning routine';
  const firstAssign = state.assignments.find(a => !a.done) || state.assignments[0];
  return [
    { id:'morning', label:`${habitName} — 5 min reset`, sub:'Habits · Mindset', xp:15, icon:'🌅' },
    { id:'workout', label:`${w.name}`, sub:`Fitness · ${w.dur} min`, xp:40, icon:'💪' },
    { id:'study', label:`${firstAssign ? firstAssign.subject : 'Study'} focus — 25 min`, sub:'School · Focus timer', xp:30, icon:'📚' },
    { id:'drills', label:`${sportName()} — ${sport.drills[0].n}`, sub:`Sports · ${sport.focus}`, xp:25, icon:'🏆' },
    { id:'water', label:`Hydrate — ${state.waterGoal} glasses`, sub:'Habits · Recovery', xp:15, icon:'💧' }
  ];
}
function taskById(id){ return makeTasks().find(t => t.id === id); }
function tasksDoneCount(){ return makeTasks().filter(t => state.tasksDone[t.id]).length; }
/* Rolls daily state over when the calendar day changes (prevents stale "done" ticks). */
function ensureDay(){
  const key = todayKey();
  if (state.tasksDay !== key) {
    state.tasksDay = key;
    state.tasksDone = {};
    state.drillsDone = {};
    state.water = 0;
    state.dayCelebrated = false;
  }
  if (!state.habitLog[key]) state.habitLog[key] = {};
}

function setTaskDone(id, done, opts = {}){
  const t = taskById(id);
  if (!t) return;
  ensureDay();
  const key = taskKeyFor(id);
  if (done && !state.tasksDone[id]) {
    state.tasksDone[id] = true;
    awardXp(key, t.xp, t.label.split('—')[0].trim(), '✦', opts);
    if (id === 'workout') recordWorkout({ source: 'daily', title: t.label, minutes: currentWorkout().dur });
  } else if (!done && state.tasksDone[id]) {
    delete state.tasksDone[id];
    revokeXp(key);
  }
  if (!done) state.dayCelebrated = false;
  if (done && !state.dayCelebrated && makeTasks().every(x => state.tasksDone[x.id])) {
    state.dayCelebrated = true;
    setTimeout(() => { toast('All goals complete — day won!', '🔥'); confetti(); }, 500);
  }
  saveState();
}

/* ---------- habits ---------- */
function habitDoneToday(id){ ensureDay(); return !!(state.habitLog[todayKey()] || {})[id]; }
function habitWeek(id){
  const out = [];
  const { mondayIndex } = nowParts();
  for (let i = 0; i < 7; i++) {
    const key = shiftKey(todayKey(), i - mondayIndex);
    out.push(!!((state.habitLog[key] || {})[id]));
  }
  return out;
}
function habitStreak(id){
  let key = todayKey(), streak = 0;
  if (!((state.habitLog[key] || {})[id])) key = shiftKey(key, -1);
  while ((state.habitLog[key] || {})[id]) { streak++; key = shiftKey(key, -1); }
  return streak;
}
function toggleHabit(id){
  ensureDay();
  const day = state.habitLog[todayKey()];
  const key = `habit:${id}:${todayKey()}`;
  const habit = state.habits.find(h => h.id === id);
  if (day[id]) { delete day[id]; revokeXp(key); }
  else {
    day[id] = true;
    awardXp(key, HABIT_XP, habit ? habit.name : 'Habit complete', '✓');
  }
  saveState(); renderHome(); renderProfile();
}
function saveHabit(data){
  ensureDay();
  if (data.id) {
    const h = state.habits.find(x => x.id === data.id);
    if (h) Object.assign(h, { name: data.name, icon: data.icon, reminder: data.reminder });
    toast('Habit updated', '✓');
  } else {
    state.habits.push({ id: uid('h'), name: data.name, icon: data.icon, reminder: data.reminder });
    toast('Habit added', '✓');
  }
  saveState(); renderHome(); renderProfile();
}
function deleteHabit(id){
  state.habits = state.habits.filter(h => h.id !== id);
  Object.keys(state.habitLog).forEach(day => { delete state.habitLog[day][id]; });
  Object.keys(state.xpLedger).forEach(k => { if (k.startsWith(`habit:${id}:`)) delete state.xpLedger[k]; });
  toast('Habit deleted', '🗑');
  saveState(); renderHome(); renderProfile();
}

/* ---------- school ---------- */
function subjects(){
  const set = new Set(state.assignments.map(a => a.subject));
  return [...set];
}
function colorForSubject(subject){
  const idx = subjects().indexOf(subject);
  return SUBJECT_COLORS[(idx < 0 ? 0 : idx) % SUBJECT_COLORS.length];
}
function saveAssignment(data){
  if (data.id) {
    const a = state.assignments.find(x => x.id === data.id);
    if (a) Object.assign(a, data, { color: colorForSubject(data.subject) });
    toast('Assignment updated', '✓');
  } else {
    state.assignments.push({
      id: uid('a'), title: data.title, subject: data.subject, color: colorForSubject(data.subject),
      due: data.due, done: false
    });
    toast('Assignment added', '✓');
  }
  saveState(); renderSchool(); renderHome(); renderProfile();
}
function toggleAssignment(id){
  const a = state.assignments.find(x => x.id === id);
  if (!a) return;
  a.done = !a.done;
  if (a.done) awardXp(`assignment:${id}`, ASSIGN_XP, 'Assignment complete', '🎓');
  else revokeXp(`assignment:${id}`);
  saveState(); renderSchool(); renderHome(); renderProfile();
}
function deleteAssignment(id){
  state.assignments = state.assignments.filter(a => a.id !== id);
  revokeXp(`assignment:${id}`);
  toast('Assignment deleted', '🗑');
  saveState(); renderSchool(); renderHome(); renderProfile();
}
function dueLabel(due){
  const diff = Math.round((dateFromKey(due) - dateFromKey(todayKey())) / 86400000);
  if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, cls: 'over' };
  if (diff === 0) return { text: 'Due today', cls: 'soon' };
  if (diff === 1) return { text: 'Due tomorrow', cls: 'soon' };
  if (diff <= 3) return { text: `Due in ${diff}d`, cls: 'soon' };
  return { text: `Due ${dateFromKey(due).toLocaleDateString('en-US', { month:'short', day:'numeric' })}`, cls: '' };
}

/* ---------- fitness ---------- */
function recordWorkout(entry){
  ensureDay();
  const rec = {
    id: uid('w'), day: todayKey(), title: entry.title || 'Workout',
    minutes: Number(entry.minutes) || 0, source: entry.source || 'plan'
  };
  state.workoutHistory = [rec, ...(state.workoutHistory || [])].slice(0, 120);
  const { mondayIndex } = nowParts();
  state.weekMinutes[mondayIndex] = (state.weekMinutes[mondayIndex] || 0) + rec.minutes;
  return rec;
}
function workoutsThisWeek(){
  const start = shiftKey(todayKey(), -nowParts().mondayIndex);
  return (state.workoutHistory || []).filter(w => w.day >= start);
}
function weekMinutesTotal(){ return (state.weekMinutes || []).reduce((a, b) => a + b, 0); }

/* ---------- sports ---------- */
function scheduleFor(sport = sportName()){
  if (!state.sportSchedules[sport]) state.sportSchedules[sport] = defaultSportSchedule(sport);
  return state.sportSchedules[sport];
}
function goalsFor(sport = sportName()){
  if (!state.sportGoals[sport]) state.sportGoals[sport] = defaultSportGoals(sport);
  return state.sportGoals[sport];
}
function setSport(sport){
  if (!SPORTS[sport]) return;
  state.sport = sport;
  state.drillsDone = {};
  if (!state.sports.includes(sport)) state.sports = [sport, ...state.sports].slice(0, 3);
  scheduleFor(sport); goalsFor(sport);
  saveState(); renderSports(); renderHome();
}
function logGoalProgress(id, delta){
  const goal = goalsFor().find(g => g.id === id);
  if (!goal) return;
  const before = goal.value;
  goal.value = Math.max(0, Math.min(100, goal.value + delta));
  if (goal.value > before) awardXp(`goal:${id}:${todayKey()}`, 3, goal.name, '🎯', { silent: true });
  else revokeXp(`goal:${id}:${todayKey()}`);
  saveState(); renderSports(); renderProfile();
}
function toggleDrill(i){
  ensureDay();
  const key = `${state.sport}-${i}`;
  const drill = currentSport().drills[i];
  if (state.drillsDone[key]) { delete state.drillsDone[key]; revokeXp(`drill:${key}:${todayKey()}`); }
  else {
    state.drillsDone[key] = true;
    awardXp(`drill:${key}:${todayKey()}`, DRILL_XP, drill ? drill.n : 'Drill complete', '🏆');
  }
  saveState(); renderSports(); renderHome(); renderProfile();
}

function haptic(){ if (!settings().haptics) return; if (navigator.vibrate) try { navigator.vibrate(8); } catch(e){} }

/* ---------- settings, appearance, privacy, account ---------- */
const ACCENTS = [
  { id:'midnight', label:'Midnight', note:'Blue → violet' },
  { id:'violet',   label:'Aurora',   note:'Violet → teal' },
  { id:'sunset',   label:'Sunset',   note:'Amber → pink' }
];
function settings(){
  if (!state.settings || typeof state.settings !== 'object') state.settings = {};
  const s = state.settings;
  if (typeof s.reminders !== 'boolean') s.reminders = true;
  if (typeof s.haptics !== 'boolean') s.haptics = true;
  if (!ACCENTS.some(a => a.id === s.accent)) s.accent = 'midnight';
  return s;
}
function applyAccent(){
  const phone = $('#phone');
  if (phone) phone.dataset.accent = settings().accent;
}
function syncSettingsUI(){
  const s = settings();
  $$('[data-setting]').forEach(el => {
    const on = !!s[el.dataset.setting];
    el.classList.toggle('on', on);
    el.setAttribute('aria-checked', on ? 'true' : 'false');
    const sub = el.closest('.setting') && el.closest('.setting').querySelector('.s-body span');
    if (sub) {
      if (el.dataset.setting === 'reminders') sub.textContent = on ? 'Adapts to your schedule' : 'Paused — no nudges';
      if (el.dataset.setting === 'haptics') sub.textContent = on ? 'Tactile on completions' : 'Vibrations off';
    }
  });
  const themeBtn = $('#themeBtn');
  if (themeBtn) {
    const a = ACCENTS.find(x => x.id === s.accent) || ACCENTS[0];
    themeBtn.textContent = a.label;
  }
}
function toggleSetting(key){
  const s = settings();
  s[key] = !s[key];
  saveState();
  syncSettingsUI();
  haptic();
  if (key === 'haptics') toast(s.haptics ? 'Haptic feedback on' : 'Haptic feedback off', s.haptics ? '📳' : '🔇');
  else toast(s.reminders ? 'Smart reminders on' : 'Smart reminders paused', s.reminders ? '🔔' : '🔕');
}
function openAppearanceSheet(){
  const s = settings();
  $('#miniTitle').textContent = 'Appearance';
  $('#miniContent').innerHTML = `
    <p class="mini-label">Accent color</p>
    <div class="opt-grid">
      ${ACCENTS.map(a => `
        <button type="button" class="opt ${a.id === s.accent ? 'selected' : ''}" data-accent-opt="${a.id}" aria-pressed="${a.id === s.accent}">
          <span class="o-txt"><b>${a.label}</b><span>${a.note}</span></span>
          <span class="o-check">✓</span>
        </button>`).join('')}
    </div>
    <p class="tiny" style="margin-top:14px;line-height:1.6">The accent changes buttons, highlights and the gradient behind your stats across the whole app.</p>`;
  $$('#miniContent [data-accent-opt]').forEach(btn => btn.addEventListener('click', () => {
    settings().accent = btn.dataset.accentOpt;
    saveState();
    applyAccent();
    syncSettingsUI();
    $$('#miniContent [data-accent-opt]').forEach(x => {
      const sel = x === btn;
      x.classList.toggle('selected', sel);
      x.setAttribute('aria-pressed', sel ? 'true' : 'false');
    });
    toast(`Accent: ${btn.querySelector('b').textContent}`, '🎨');
    haptic();
  }));
  openMini();
}
function openPrivacySheet(){
  const u = window.LEVELUP_USER;
  $('#miniTitle').textContent = 'Privacy';
  $('#miniContent').innerHTML = `
    <p class="mini-label">What is stored</p>
    <p class="tiny" style="line-height:1.6">${u
      ? `Your account <b>${esc(u.email)}</b> keeps your name, a hashed password and your plan. Your daily progress stays in this browser.`
      : 'You are in demo mode. Your progress is saved only in this browser — no account, nothing sent to a server.'}</p>
    <p class="mini-label" style="margin-top:14px">Security</p>
    <p class="tiny" style="line-height:1.6">Passwords are hashed with scrypt and never stored in plain text. Sessions use signed, HTTP-only cookies. Card details are never stored — only the brand and last four digits.</p>
    <button type="button" class="btn ghost full sm mt10" id="miniClearData">Clear my progress on this device</button>`;
  $('#miniClearData').addEventListener('click', () => {
    if (!confirm('Clear all saved progress on this device? This cannot be undone.')) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch(e){}
    state = loadState();
    applyAccent();
    renderAll();
    closeMini();
    toast('Local progress cleared', '🧹');
  });
  openMini();
}
function openAccountSheet(){
  const u = window.LEVELUP_USER;
  $('#miniTitle').textContent = 'Your account';
  $('#miniContent').innerHTML = `
    <label class="mini-label" for="miniAccName">Display name</label>
    <input class="mini-input" id="miniAccName" maxlength="40" value="${esc(state.name || '')}" autocomplete="off">
    <p class="tiny" style="margin-top:8px">${u ? esc(u.email) : 'Demo mode · no account yet'}</p>
    <button type="button" class="btn primary full sm mt10" id="miniAccSave">Save name</button>
    <button type="button" class="btn ghost full sm mt10" id="miniAccBilling">Plan &amp; billing</button>
    <button type="button" class="btn ghost full sm mt10" id="miniAccAuth">${u ? 'Sign out' : 'Create an account or sign in'}</button>`;
  $('#miniAccSave').addEventListener('click', () => {
    const v = $('#miniAccName').value.trim();
    if (!v) { toast('Enter a name first', '⚠️'); return; }
    state.name = v;
    saveState();
    renderAll();
    closeMini();
    toast('Name updated', '✓');
    haptic();
  });
  $('#miniAccBilling').addEventListener('click', () => {
    closeMini();
    const row = $('#billingRow');
    if (row) row.click();
    else showScreen('billing');
  });
  $('#miniAccAuth').addEventListener('click', () => {
    closeMini();
    const btn = $('#signOutBtn');
    if (btn) btn.click();
    else location.reload();
  });
  openMini();
}

/* Delegated wiring so the settings controls work on any screen render */
document.addEventListener('click', (e) => {
  if (e.target.closest('#signOutBtn')) return;
  const t = e.target.closest('[data-setting]');
  if (t) { e.preventDefault(); toggleSetting(t.dataset.setting); return; }
  if (e.target.closest('#themeBtn')) { openAppearanceSheet(); return; }
  if (e.target.closest('#privacyBtn')) { openPrivacySheet(); return; }
  if (e.target.closest('#accountRow')) openAccountSheet();
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const row = e.target.closest && e.target.closest('#accountRow, [data-setting]');
  if (!row) return;
  e.preventDefault();
  row.click();
});
try { applyAccent(); } catch(e){}

/* ---------- toast + confetti ---------- */
let toastTimer = null;
function toast(message, icon = '✦'){
  const el = $('#toast');
  $('#toastMsg').textContent = message;
  const spark = $('.tspark', el);
  if (spark) spark.textContent = icon;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2100);
}
function confetti(origin){
  const layer = $('#confettiLayer');
  const colors = ['#4C8DFF','#9B5CFF','#38E0CE','#FF9F45','#FF5C8A','#FFD166'];
  const cx = origin ? origin.x : 50, cy = origin ? origin.y : 55;
  for (let i = 0; i < 26; i++){
    const p = document.createElement('i');
    p.className = 'confetti';
    p.style.left = cx + '%';
    p.style.top = cy + '%';
    p.style.background = colors[i % colors.length];
    p.style.setProperty('--dx', (Math.random() * 220 - 110) + 'px');
    p.style.setProperty('--dy', (Math.random() * 260 + 60) + 'px');
    p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    p.style.animationDelay = (Math.random() * .12) + 's';
    layer.appendChild(p);
    setTimeout(() => p.remove(), 1400);
  }
}

/* ============================================================
   RENDER
   ============================================================ */
function setRing(el, pct){
  if (!el) return;
  el.style.setProperty('--p', pct);
  const c = el.querySelector('.prog');
  if (c) c.style.strokeDashoffset = (326.7 * (1 - Math.max(0, Math.min(100, pct)) / 100)).toFixed(1);
}

function renderHome(){
  const { d, hour } = nowParts();
  const nm = firstName();
  const li = levelInfo(totalXp());
  $('#homeDate').textContent = `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
  $('#greetWord').textContent = hour < 5 ? 'Still up' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  $('#homeName').textContent = nm;
  $('#homeAvatar').textContent = initial();
  $('#profileAvatar').textContent = initial();
  $('#homeLevelPin').textContent = li.level;
  $('#homeStreak').textContent = currentStreak();
  $('#homeXp').textContent = fmt(totalXp());

  const tasks = makeTasks();
  const done = tasks.filter(t => state.tasksDone[t.id]);
  const pct = Math.round(done.length / tasks.length * 100);
  setRing($('#homeRing'), pct);
  $('#ringPct').textContent = pct + '%';
  $('#heroTitle').textContent = pct === 0 ? 'Let\'s start strong' : pct < 50 ? 'Momentum building' : pct < 100 ? 'You\'re on track' : 'Day complete 🔥';
  $('#heroSub').textContent = pct === 100
    ? 'Every goal checked. This is how the chain stays alive.'
    : `${done.length} of ${tasks.length} goals complete. Keep the chain alive.`;
  const earnedToday = done.reduce((s, t) => s + t.xp, 0);
  $('#heroXp').textContent = `+${earnedToday} XP earned today`;
  $('#hfGoals').textContent = `${done.length}/${tasks.length}`;
  $('#hfWorkout').textContent = state.tasksDone.workout ? '1' : '0';
  $('#hfFocus').textContent = state.tasksDone.study ? '25m' : '0m';
  $('#goalsCount').textContent = `${done.length}/${tasks.length}`;

  /* tasks */
  $('#taskList').innerHTML = tasks.map(t => {
    const isDone = !!state.tasksDone[t.id];
    return `<div class="task ${isDone ? 'done' : ''}" onclick="toggleTask('${t.id}')">
      <div class="check">${svgCheck()}</div>
      <div class="t-body">
        <div class="t-label">${esc(t.label)}</div>
        <div class="t-sub"><span class="tag">${esc(t.sub.split(' · ')[0])}</span>${esc(t.sub.split(' · ')[1] || '')}</div>
      </div>
      <span class="xp-badge">+${t.xp}</span>
    </div>`;
  }).join('');

  /* workout card */
  const w = currentWorkout();
  $('#homeWorkout').innerHTML = `
    <div class="wk-visual">
      <span class="wk-tag">${w.tag} · ${state.difficulty}</span>
      <span class="wk-emoji">${w.emoji}</span>
    </div>
    <div class="wk-body">
      <div class="wk-row">
        <div>
          <div class="h3">${w.name}</div>
          <div class="tiny" style="margin-top:3px">${w.focus}</div>
        </div>
        <span class="xp-badge">+40 XP</span>
      </div>
      <div class="wk-meta">
        <div>${svgClock()} ${w.dur} min</div>
        <div>${svgLayers()} ${w.exercises.length} exercises</div>
        <div>${svgBolt()} ${state.difficulty}</div>
      </div>
      <button class="btn primary full sm mt10" onclick="openPlayer()">${state.tasksDone.workout ? 'Repeat workout' : 'Start workout'} <span class="arrow">→</span></button>
    </div>`;

  /* study card */
  const dueAssign = state.assignments.find(a => !a.done) || state.assignments[0];
  const doneAssign = state.assignments.filter(a => a.done).length;
  $('#homeStudy').innerHTML = `
    <div class="study-top">
      <div class="study-ico">📚</div>
      <div>
        <b style="font-size:12.5px">${esc(dueAssign ? dueAssign.title.split(':')[0] : 'Study block')}</b>
        <div class="tiny">${dueAssign ? esc(dueAssign.subject) + ' · due ' + esc(dueAssign.due) : 'All caught up'}</div>
      </div>
      <div class="study-time">4:00<br><span style="font-size:8px;color:var(--muted);letter-spacing:.5px">PM</span></div>
    </div>
    <div class="divider"></div>
    <div class="row-between">
      <span class="tiny">${doneAssign} of ${state.assignments.length} assignments done</span>
      <button class="btn ghost sm" data-nav="school">Open planner</button>
    </div>`;

  /* water */
  $('#waterLabel').textContent = `${state.water} / ${state.waterGoal} glasses`;
  $('#waterRow').innerHTML = Array.from({ length: state.waterGoal }, (_, i) =>
    `<span class="glass ${i < state.water ? 'full' : ''}" onclick="setWater(${i})" role="button" aria-label="Glass ${i + 1}"></span>`
  ).join('');

  /* habits */
  const habitList = state.habits;
  const habitDone = habitList.filter(h => habitDoneToday(h.id)).length;
  $('#habitCount').textContent = `${habitDone}/${habitList.length}`;
  const { mondayIndex: todayIdx } = nowParts();
  $('#habitList').innerHTML = habitList.length ? habitList.map(h => {
    const on = habitDoneToday(h.id);
    const streak = habitStreak(h.id);
    const week = habitWeek(h.id);
    return `<div class="habit-row">
      <div class="habit-ico">${esc(h.icon || '✨')}</div>
      <div class="t-body">
        <div class="t-label" style="${on ? 'color:var(--muted2);text-decoration:line-through' : ''}">${esc(h.name)}</div>
        <div class="t-sub">${on ? 'Completed today' : (h.reminder ? '⏰ ' + esc(h.reminder) : 'Tap to check off')}${streak > 1 ? ` · 🔥 ${streak}-day streak` : ''}</div>
        <div class="habit-week">${week.map((v, i) => `<i class="${v ? 'on' : ''}${i === todayIdx ? ' today' : ''}" title="${DAYS_SHORT[i]}"></i>`).join('')}</div>
      </div>
      <button class="icon-btn sm" data-habit-edit="${h.id}" aria-label="Edit ${esc(h.name)}">✎</button>
      <button class="check habit-toggle ${on ? 'done' : ''}" style="${on ? 'background:var(--grad);border-color:transparent;color:#fff' : ''}" data-habit="${h.id}" aria-label="Toggle ${esc(h.name)}">${svgCheck()}</button>
    </div>`;
  }).join('') : `<div class="empty-note">No habits yet. Tap “Add habit” to create your first one.</div>`;

  /* heat map + consistency from the real habit log */
  const heat = [];
  for (let i = 13; i >= 0; i--) {
    const key = shiftKey(todayKey(), -i);
    const day = state.habitLog[key] || {};
    const count = Object.keys(day).filter(k => day[k]).length;
    heat.push(count === 0 ? 0 : count >= Math.max(1, Math.ceil(habitList.length / 2)) ? 2 : 1);
  }
  $('#habitHeat').innerHTML = heat.map(v => `<i class="${v === 2 ? 'on' : v === 1 ? 'half' : ''}"></i>`).join('');
  const weekCells = habitList.reduce((sum, h) => sum + habitWeek(h.id).filter(Boolean).length, 0);
  const weekPossible = habitList.length * (todayIdx + 1);
  const weekPct = weekPossible ? Math.round(weekCells / weekPossible * 100) : 0;
  $('#habitConsistency').textContent = `${weekPct}% this week`;

  /* ai recommendation */
  renderAiRecommendation();

  /* quote */
  const qi = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000) % QUOTES.length;
  $('#quoteText').textContent = QUOTES[qi][0];
  $('#quoteAuthor').textContent = QUOTES[qi][1];
}

function renderAiRecommendation(){
  const a = state.assignments.find(x => !x.done);
  const w = currentWorkout();
  const sp = currentSport();
  const studyLine = a
    ? `Your <b>${esc(a.subject.toLowerCase())} work</b> is due ${esc(a.due.toLowerCase())}, so I placed a 25-min focus block at 4:00 PM and moved training to <b>5:30 PM</b>.`
    : `Everything is submitted, so you have a clear runway today.`;
  const rec = `${studyLine} Recovery is 82%, so today is <b>${esc(w.focus.toLowerCase())}</b> — quality over volume, then 10 minutes of mobility.`;
  $('#aiRec').innerHTML = rec;
  $('#aiTags').innerHTML = [
    `⚖️ School-aware`, `⏱️ ${esc(state.time)}`, `${sp.emoji} ${esc(sportName())}`, `😴 Recovery 82%`
  ].map(t => `<span>${t}</span>`).join('');
}

function renderFitness(){
  const w = currentWorkout();
  $('#fitLevelChip').textContent = state.difficulty;
  $$('#fitSeg button').forEach(b => b.classList.toggle('active', b.dataset.diff === state.difficulty));

  $('#fitHero').innerHTML = `
    <div class="wk-visual" style="height:142px">
      <span class="wk-tag" style="position:absolute;top:14px;left:14px">TODAY · ${w.tag}</span>
      <span class="wk-emoji" style="font-size:66px">${w.emoji}</span>
      <div style="position:absolute;left:14px;bottom:12px">
        <div style="font-family:var(--display);font-size:20px;font-weight:700;letter-spacing:-.4px">${w.name}</div>
        <div class="tiny" style="margin-top:2px">${w.focus}</div>
      </div>
    </div>
    <div class="wk-body">
      <div class="ph-stats" style="margin-top:0">
        <div class="ph-stat"><b>${w.dur}</b><span>minutes</span></div>
        <div class="ph-stat"><b>${w.exercises.length}</b><span>exercises</span></div>
        <div class="ph-stat"><b>${w.exercises.reduce((s,e)=>s+e.sets,0)}</b><span>sets</span></div>
      </div>
      <div class="wk-meta" style="margin-top:11px">
        <div>${svgLayers()} ${esc(w.list)}</div>
        <div>${svgBolt()} ${state.difficulty}</div>
      </div>
      <div class="btn-row mt14">
        <button class="btn primary sm" onclick="openPlayer()">${state.tasksDone.workout ? 'Do it again' : 'Start workout'} <span class="arrow">→</span></button>
        <button class="btn ghost sm" data-exercise-library>Exercise library</button>
      </div>
    </div>`;

  const { mondayIndex } = nowParts();
  const max = Math.max(...state.weekMinutes, 1);
  $('#weekBars').innerHTML = state.weekMinutes.map((m, i) => `
    <div class="bar-col ${i === mondayIndex ? 'today' : ''}">
      <div class="bar-track"><div class="bar-fill ${m === 0 ? 'zero' : ''}" style="height:${Math.max(4, Math.round(m / max * 100))}%"></div></div>
      <span>${DAYS_SHORT[i]}</span>
    </div>`).join('');
  $('#weekSummary').textContent = `${workoutsThisWeek().length} workouts · ${weekMinutesTotal()} min`;

  const sched = state.workoutSchedule;
  $('#planList').innerHTML = sched.map((s, i) => {
    const isToday = i === mondayIndex;
    const logged = isToday && !!state.tasksDone.workout;
    const rest = !s.minutes;
    return `<div class="task" style="cursor:default">
      <div class="check" style="${logged ? 'background:var(--grad);border-color:transparent;color:#fff' : ''}">${svgCheck()}</div>
      <div class="t-body">
        <div class="t-label" style="${logged ? 'color:var(--muted2)' : ''}">${esc(isToday ? w.name : s.title)}</div>
        <div class="t-sub">${logged ? 'Logged today' : rest ? 'Rest · recovery only' : `${s.minutes} min · planned`}${isToday ? ' · <span class="tag">TODAY</span>' : ''}</div>
      </div>
      <button class="icon-btn sm" data-schedule-edit="${i}" aria-label="Edit ${esc(s.title)}">✎</button>
      ${isToday && !logged && !rest ? `<button class="btn ghost sm" data-log-workout="${i}">Log</button>` : ''}
    </div>`;
  }).join('');

  renderFitnessHistory();
}

function renderFitnessHistory(){
  const el = $('#fitHistory');
  if (!el) return;
  const hist = (state.workoutHistory || []).slice(0, 6);
  el.innerHTML = hist.length ? hist.map(w => `
    <div class="hist-row">
      <div class="hist-ico">💪</div>
      <div class="t-body">
        <div class="t-label">${esc(w.title)}</div>
        <div class="t-sub">${esc(dateFromKey(w.day).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' }))} · ${w.minutes} min</div>
      </div>
      <span class="xp-badge">✓</span>
    </div>`).join('') : `<div class="empty-note">No workouts recorded yet. Finish a session and it shows up here.</div>`;
  const total = (state.workoutHistory || []).length;
  const mins = (state.workoutHistory || []).reduce((s, w) => s + (w.minutes || 0), 0);
  const sum = $('#fitHistoryMeta');
  if (sum) sum.textContent = `${total} logged · ${fmt(mins)} min`;
}

function renderSports(){
  const sp = currentSport();
  $$('#sportGrid .sport-tile').forEach(t => t.classList.toggle('active', t.dataset.sport === state.sport));

  $('#practiceHero').innerHTML = `
    <div class="ph-top">
      <div class="ph-em">${sp.emoji}</div>
      <span class="ph-badge">● TODAY'S PRACTICE</span>
      <div style="font-family:var(--display);font-size:21px;font-weight:700;letter-spacing:-.4px;max-width:240px">${esc(sportName())} · ${esc(sp.focus)}</div>
      <div class="sub" style="font-size:11px;margin-top:6px;max-width:250px">${esc(sp.note)}</div>
    </div>
    <div class="ph-body">
      <div class="ph-stats">
        <div class="ph-stat"><b>35</b><span>minutes</span></div>
        <div class="ph-stat"><b>${sp.drills.length}</b><span>drills</span></div>
        <div class="ph-stat"><b>4:45</b><span>PM start</span></div>
      </div>
      <div class="wk-meta" style="margin-top:11px"><div>📅 ${esc(sp.weekly)}</div><div>🎯 After study block</div></div>
    </div>`;

  const doneCount = sp.drills.filter((_, i) => state.drillsDone[`${state.sport}-${i}`]).length;
  $('#drillCount').textContent = `${doneCount}/${sp.drills.length}`;
  $('#drillList').innerHTML = sp.drills.map((d, i) => {
    const done = !!state.drillsDone[`${state.sport}-${i}`];
    return `<div class="drill ${done ? 'done' : ''}">
      <div class="drill-num">${done ? '✓' : i + 1}</div>
      <div class="t-body"><div class="t-label">${esc(d.n)}</div><div class="t-sub">${esc(d.d)} · <span class="tag">${esc(d.t)}</span></div></div>
      <button class="btn ghost sm" onclick="toggleDrill(${i})">${done ? 'Done' : '+10 XP'}</button>
    </div>`;
  }).join('');

  const { mondayIndex } = nowParts();
  const sched = scheduleFor();
  $('#sportSchedule').innerHTML = sched.map((s, i) => {
    const isToday = i === mondayIndex;
    return `<div class="schedule-row ${isToday ? 'today' : ''}">
      <div class="sch-day"><b>${DAYS_SHORT[i]}</b><span>${isToday ? 'TODAY' : ''}</span></div>
      <div class="sch-bar"><div><b>${esc(s.title)}</b><span>${esc(s.detail)}</span></div>
        <button class="icon-btn sm" data-practice-edit="${i}" aria-label="Edit ${esc(s.title)}">✎</button></div>
    </div>`;
  }).join('');

  $('#goalList').innerHTML = goalsFor().map(g => `
    <div class="goal">
      <div class="goal-top"><b>${esc(g.name)}</b><span>${g.value}%${g.target && g.target !== 100 ? ` / ${g.target}%` : ''}</span></div>
      <div class="track"><i style="width:${g.value}%"></i></div>
      <div class="goal-actions">
        <button class="icon-btn sm" data-goal-delta="-5" data-goal-id="${g.id}" aria-label="Lower ${esc(g.name)}">−</button>
        <button class="icon-btn sm" data-goal-delta="5" data-goal-id="${g.id}" aria-label="Raise ${esc(g.name)}">+</button>
        <span class="tiny">Log progress</span>
      </div>
    </div>`).join('');

  $('#radarChart').innerHTML = radarSVG(sp.radar);
}

function radarSVG(values){
  const labels = ['Skill','Speed','Power','Stamina','Focus','Recovery'];
  const cx = 90, cy = 84, R = 56, n = 6;
  const pt = (i, r) => {
    const a = -Math.PI / 2 + i * 2 * Math.PI / n;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };
  const poly = (arr) => arr.map((v, i) => pt(i, R * v).join(',')).join(' ');
  const grid = [0.25, 0.5, 0.75, 1].map(l =>
    `<polygon points="${poly(Array(n).fill(l))}" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="1"/>`).join('');
  const axes = Array.from({ length: n }, (_, i) => {
    const [x, y] = pt(i, R);
    return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,.06)" stroke-width="1"/>`;
  }).join('');
  const data = values.map((v, i) => pt(i, R * v / 100));
  const dataPoly = data.map(p => p.join(',')).join(' ');
  const dots = data.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="2.6" fill="#B98CFF" stroke="#0A0C12" stroke-width="1.5"/>`).join('');
  const text = labels.map((l, i) => {
    const [x, y] = pt(i, R + 17);
    const anchor = Math.abs(x - cx) < 6 ? 'middle' : x > cx ? 'start' : 'end';
    return `<text x="${x}" y="${y + 3}" text-anchor="${anchor}" font-size="7.6" font-family="Inter,sans-serif" fill="#8B93A7" font-weight="600">${l}</text>`;
  }).join('');
  return `<svg viewBox="0 0 180 172" width="100%" height="100%">
    ${grid}${axes}
    <polygon points="${dataPoly}" fill="rgba(124,155,255,.25)" stroke="#8FA6FF" stroke-width="1.6" stroke-linejoin="round"/>
    ${dots}${text}
  </svg>`;
}

function renderSchool(){
  const pending = state.assignments.filter(a => !a.done).length;
  $('#assignCount').textContent = pending ? `${pending} due` : 'All done';

  const filter = state.schoolFilter || 'all';
  const subs = subjects();
  const filterEl = $('#subjectFilter');
  if (filterEl) {
    filterEl.innerHTML = ['all', ...subs].map(s => `<button class="chip ${filter === s ? 'active' : ''}" data-subject-filter="${esc(s)}">${s === 'all' ? 'All subjects' : esc(s)}</button>`).join('');
  }
  const list = state.assignments
    .filter(a => filter === 'all' || a.subject === filter)
    .sort((a, b) => (a.done - b.done) || String(a.due).localeCompare(String(b.due)));

  $('#assignmentList').innerHTML = list.length ? list.map(a => {
    const due = dueLabel(a.due);
    return `<div class="assignment ${a.done ? 'done' : ''}">
      <button class="check" onclick="toggleAssignment('${a.id}')" aria-label="Complete ${esc(a.title)}" style="${a.done ? 'background:var(--grad);border-color:transparent;color:#fff' : ''}">${svgCheck()}</button>
      <div class="subject-dot" style="background:${a.color}"></div>
      <div class="t-body">
        <div class="t-label">${esc(a.title)}</div>
        <div class="t-sub">${esc(a.subject)} · <span class="due ${due.cls}">${esc(due.text)}</span></div>
      </div>
      <button class="icon-btn sm" data-assignment-edit="${a.id}" aria-label="Edit ${esc(a.title)}">✎</button>
    </div>`;
  }).join('') : `<div class="empty-note">Nothing here yet. Tap “Add assignment” to plan your work.</div>`;

  /* Study blocks are built from real upcoming work, not sample text. */
  const upcoming = state.assignments.filter(a => !a.done)
    .sort((a, b) => String(a.due).localeCompare(String(b.due))).slice(0, 3);
  const slots = ['4:00 PM', '5:00 PM', '6:30 PM'];
  $('#studyPlan').innerHTML = upcoming.length ? upcoming.map((a, i) => `
    <div class="schedule-row" style="padding:7px 0">
      <div class="sch-day" style="width:48px"><b style="font-size:9px;color:${i === 0 ? '#8FE9D6' : 'var(--muted)'}">${slots[i]}</b></div>
      <div class="sch-bar" style="background:${i === 1 ? 'rgba(56,224,206,.07)' : 'rgba(255,255,255,.035)'}">
        <div><b>${esc(a.title)}</b><span>25 min · ${esc(a.subject)}</span></div>
        <button class="icon-btn sm" data-focus="${a.id}" aria-label="Start focus session">▶</button>
      </div>
    </div>`).join('') : `<div class="empty-note">No open assignments — your study block is clear.</div>`;

  const cards = getCards();
  if (state.fcIndex > cards.length - 1) state.fcIndex = 0;
  const card = cards[state.fcIndex];
  $('#fcQuestion').textContent = card.q;
  $('#fcAnswer').textContent = card.a;
  $('#fcDots').innerHTML = cards.map((_, i) => `<i class="${i === state.fcIndex ? 'on' : ''}"></i>`).join('');
  const fcEdit = $('#editCardBtn');
  if (fcEdit) fcEdit.style.display = state.fcIndex >= FLASHCARDS.length ? '' : 'none';

  const q = QUIZ[state.quizIndex];
  const answered = state.quizAnswer !== null;
  $('#quizCard').innerHTML = `
    <div class="tiny" style="letter-spacing:1.2px;margin-bottom:8px">QUESTION ${state.quizIndex + 1} OF ${QUIZ.length}</div>
    <div class="h3" style="font-size:13px;line-height:1.45;margin-bottom:11px">${esc(q.q)}</div>
    ${q.opts.map((o, i) => {
      let cls = '';
      if (answered) {
        if (i === q.answer) cls = 'correct';
        else if (i === state.quizAnswer) cls = 'wrong';
      }
      return `<button class="quiz-opt ${cls}" onclick="answerQuiz(${i})"><span class="qkey">${'ABCD'[i]}</span>${esc(o)}</button>`;
    }).join('')}
    ${answered ? `<div class="sub" style="font-size:11px;line-height:1.5;margin-top:9px;color:${state.quizAnswer === q.answer ? '#7DE8BB' : '#FFB8C9'}">${state.quizAnswer === q.answer ? 'Correct! ' : 'Not quite. '}${esc(q.why)}</div>
      <button class="btn ghost full sm mt10" onclick="nextQuiz()">Try another question</button>` : ''}`;

  $('#gradeList').innerHTML = state.grades.map(g => `
    <div class="grade-row">
      <span class="gname">${esc(g.name)}</span>
      <div class="track"><i style="width:${Math.max(0, Math.min(100, g.value))}%"></i></div>
      <span class="gval">${gradeLetter(g.value)}</span>
      <button class="icon-btn sm" data-grade-edit="${g.id}" aria-label="Edit ${esc(g.name)} grade">✎</button>
    </div>`).join('');
}

function gradeLetter(v){
  if (v >= 93) return 'A'; if (v >= 90) return 'A−'; if (v >= 87) return 'B+';
  if (v >= 83) return 'B'; if (v >= 80) return 'B−'; if (v >= 77) return 'C+';
  if (v >= 70) return 'C'; return 'D';
}

function renderProfile(){
  const li = levelInfo(totalXp());
  const goal = state.goal || 'Get stronger';
  $('#profileName').textContent = state.name || 'Champion';
  $('#profileTag').textContent = `Building discipline, one day at a time.`;
  $('#profileLoc').textContent = `🎯 Goal: ${goal} · ${state.time || '40 minutes'}/day`;
  $('#levelNum').textContent = li.level;
  $('#levelName').textContent = li.name;
  $('#levelBar').style.width = li.pct + '%';
  $('#xpToNext').textContent = `${li.need} XP to next`;
  $('#xpTotal').textContent = `${fmt(totalXp())} XP total`;
  $('#xpNextLevel').textContent = `Level ${li.level + 1}`;
  $('#statXp').textContent = fmt(totalXp());
  $('#statStreak').textContent = currentStreak();
  $('#statWorkouts').textContent = (state.workoutHistory || []).length;

  const list = achievementsView();
  const earned = list.filter(a => a.earned).length;
  $('#statBadges').textContent = earned;

  $('#badgeGrid').innerHTML = list.map(b => `
    <div class="badge ${b.earned ? 'earned' : 'locked'}" title="${esc(b.desc)}">
      <span class="b-ico">${b.icon}</span><span>${b.name}</span>
      ${b.earned ? '' : `<div class="b-track"><i style="width:${b.pct}%"></i></div>`}
    </div>`).join('');
  $('#badgeMeta').textContent = `${earned} of ${list.length}`;

  const next = list.filter(b => !b.earned).sort((a, b) => b.pct - a.pct).slice(0, 3);
  $('#challengeList').innerHTML = next.length ? next.map(c => `
    <div class="challenge">
      <div class="ch-ico">${c.icon}</div>
      <div class="ch-body"><b>${esc(c.name)}</b><div class="tiny" style="margin-top:2px">${esc(c.desc)} · ${c.value}/${c.goal}</div>
        <div class="ch-bar"><i style="width:${c.pct}%"></i></div>
      </div>
      <span class="ch-xp">${c.pct}%</span>
    </div>`).join('') : `<div class="empty-note">Every achievement unlocked. Legend. 👑</div>`;

  $('#profileTags').innerHTML = (state.interests.length ? state.interests : ['Strength','Discipline'])
    .map(t => `<span class="chip active">${esc(t)}</span>`).join('');
  $('#profileLevel').textContent = state.experience;
  $('#profileTime').textContent = state.time;
  $('#profileSports').textContent = state.sports.length ? state.sports.join(', ') : sportName();
  syncSettingsUI();
}

function renderAll(){
  renderHome();
  renderFitness();
  renderSports();
  renderSchool();
  renderProfile();
  saveState();
}

function svgCheck(){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5 9.5 18 20 6.5"/></svg>'; }
function svgClock(){ return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'; }
function svgLayers(){ return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 3 8l9 5 9-5-9-5z"/><path d="m3 13 9 5 9-5"/></svg>'; }
function svgBolt(){ return '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg>'; }

/* ============================================================
   INTERACTIONS
   ============================================================ */
function showScreen(name){
  $$('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + name));
  const navKey = name === 'billing' ? 'profile' : name;
  $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.nav === navKey));
  const sc = $('#screens');
  if (sc) sc.scrollTop = 0;
  if (name === 'profile') renderProfile();
  if (name === 'fitness') renderFitness();
  if (name === 'sports') renderSports();
  if (name === 'school') renderSchool();
  if (name === 'home') renderHome();
}

function toggleTask(id){
  if (id === 'water') {
    if (state.tasksDone.water) {
      state.water = 0;
      setTaskDone('water', false);
    } else {
      state.water = state.waterGoal;
      setTaskDone('water', true);
    }
    saveState();
    renderAll();
    return;
  }
  setTaskDone(id, !state.tasksDone[id]);
  renderAll();
}

function setWater(i){
  state.water = state.water === i + 1 ? i : i + 1;
  const was = !!state.tasksDone.water;
  const done = state.water >= state.waterGoal;
  if (done && !was) {
    setTaskDone('water', true);
    toast('Hydration goal complete +15 XP', '💧');
  } else if (!done && was) {
    setTaskDone('water', false);
  }
  saveState();
  renderHome();
  renderProfile();
}

function toggleAssignment(id){
  const a = state.assignments.find(x => x.id === id);
  if (!a) return;
  a.done = !a.done;
  if (state.tasksDone.study && a.done) { /* keep study task as-is */ }
  toast(a.done ? 'Assignment complete ✓' : 'Moved back to your list', a.done ? '✅' : '↩');
  haptic();
  saveState();
  renderSchool();
  renderHome();
}
function answerQuiz(i){
  if (state.quizAnswer !== null) return;
  const q = QUIZ[state.quizIndex];
  state.quizAnswer = i;
  if (i === q.answer) {
    const fresh = awardXp(`quiz:${state.quizIndex}`, 10, 'Quiz answered correctly', '🎯');
    if (fresh) confetti();
    else toast('Correct — you already earned XP for this question', '🎯');
  } else {
    toast('Not quite — check the explanation', '💡');
  }
  saveState();
  renderSchool();
  renderProfile();
}
function nextQuiz(){ state.quizIndex = (state.quizIndex + 1) % QUIZ.length; state.quizAnswer = null; saveState(); renderSchool(); }
function flipCard(){ $('#flashcard').classList.toggle('flipped'); }
function moveCard(dir){
  const cards = getCards();
  state.fcIndex = (state.fcIndex + dir + cards.length) % cards.length;
  $('#flashcard').classList.remove('flipped');
  saveState(); renderSchool();
  if (dir > 0) toast('Next card — active recall beats re-reading', '🧠');
}

/* ---------- focus timer ---------- */
let focusTotal = 25 * 60, focusLeft = 25 * 60, focusTimer = null, focusRunning = false;
function focusPct(){ return Math.round(focusLeft / focusTotal * 100); }
function updateFocusUI(){
  const m = Math.floor(focusLeft / 60), s = focusLeft % 60;
  $('#focusTime').textContent = `${m}:${String(s).padStart(2, '0')}`;
  setRing($('#focusRing'), focusPct());
  $('#focusStart').textContent = focusRunning ? 'Pause' : 'Start';
  $('#focusStart').classList.toggle('primary', !focusRunning);
  $('#focusStart').classList.toggle('ghost', focusRunning);
}
function stopFocus(){ clearInterval(focusTimer); focusTimer = null; focusRunning = false; updateFocusUI(); }
function toggleFocus(){
  if (focusRunning) { stopFocus(); return; }
  if (focusLeft <= 0) focusLeft = focusTotal;
  focusRunning = true;
  updateFocusUI();
  focusTimer = setInterval(() => {
    focusLeft--;
    updateFocusUI();
    if (focusLeft <= 0) {
      stopFocus();
      focusLeft = 0;
      updateFocusUI();
      awardXp(`focus:${todayKey()}:${Date.now()}`, 20, 'Focus session completed', '🎯');
      saveState();
      renderProfile();
      setTimeout(() => { focusLeft = focusTotal; updateFocusUI(); }, 1800);
    }
  }, 1000);
}
function resetFocus(){ stopFocus(); focusLeft = focusTotal; updateFocusUI(); }

/* ---------- workout player ---------- */
let playerIdx = 0, playerSetNo = 1, playerLeft = 0, playerTimer = null;
function openPlayer(){
  playerIdx = 0; playerSetNo = 1;
  $('#player').classList.add('open');
  renderPlayer();
  startPlayerTimer();
}
function closePlayer(){
  $('#player').classList.remove('open');
  clearInterval(playerTimer);
  playerTimer = null;
}
function renderPlayer(){
  const w = currentWorkout();
  const ex = w.exercises[playerIdx];
  $('#playerPlan').textContent = `${state.difficulty.toUpperCase()} · ${w.dur} MIN`;
  $('#playerEmoji').textContent = ex.emoji;
  $('#playerSet').textContent = `EXERCISE ${playerIdx + 1} OF ${w.exercises.length} · SET ${playerSetNo} OF ${ex.sets}`;
  $('#playerName').textContent = ex.name;
  $('#playerDesc').textContent = `${ex.sets} sets · ${ex.reps} · ${ex.desc}`;
  const totalSets = w.exercises.reduce((s, e) => s + e.sets, 0);
  let completed = 0;
  for (let i = 0; i < playerIdx; i++) completed += w.exercises[i].sets;
  completed += playerSetNo - 1;
  $('#playerBar').style.width = Math.round(completed / totalSets * 100) + '%';
  $('#playerNote').textContent = `Rest 30s between sets · Form first, speed second`;
}
function startPlayerTimer(){
  clearInterval(playerTimer);
  const ex = currentWorkout().exercises[playerIdx];
  playerLeft = ex.secs;
  paintPlayerTimer(ex.secs);
  playerTimer = setInterval(() => {
    playerLeft--;
    if (playerLeft <= 0) {
      clearInterval(playerTimer); playerTimer = null;
      $('#playerTime').textContent = '0:00';
      $('#playerRing').style.strokeDashoffset = 326.7;
      $('#playerNote').textContent = 'Set done — take 30 seconds, then continue';
      return;
    }
    paintPlayerTimer(ex.secs);
  }, 1000);
}
function paintPlayerTimer(total){
  const m = Math.floor(Math.max(0, playerLeft) / 60);
  const sec = Math.max(0, playerLeft) % 60;
  $('#playerTime').textContent = `${m}:${String(sec).padStart(2, '0')}`;
  $('#playerRing').style.strokeDashoffset = (326.7 * (1 - playerLeft / total)).toFixed(1);
}
function playerNext(){
  const w = currentWorkout();
  const ex = w.exercises[playerIdx];
  if (playerSetNo < ex.sets) {
    playerSetNo++;
    playerLeft = ex.secs;
    startPlayerTimer();
    renderPlayer();
    toast(`Set ${playerSetNo - 1} done — rest 30s`, '💪');
    haptic();
    return;
  }
  if (playerIdx < w.exercises.length - 1) {
    playerIdx++; playerSetNo = 1;
    renderPlayer(); startPlayerTimer();
    toast('Next exercise', '➡️');
    haptic();
    return;
  }
  finishWorkout();
}
function playerPrev(){
  if (playerSetNo > 1) { playerSetNo--; }
  else if (playerIdx > 0) { playerIdx--; playerSetNo = 1; }
  else { closePlayer(); return; }
  renderPlayer(); startPlayerTimer();
}
function finishWorkout(){
  closePlayer();
  const w = currentWorkout();
  const already = !!state.tasksDone.workout;
  recordWorkout({ id: `w:${todayKey()}:${Date.now()}`, name: w.name, minutes: w.dur, date: todayKey() });
  if (!already) setTaskDone('workout', true, { silent:true });
  saveState();
  renderAll();
  confetti();
  haptic();
}

/* ============================================================
   AI COACH
   ============================================================ */
let coachBusy = false, coachWelcomed = false;
let coachQueue = [];
function coachWelcome(){
  const a = state.assignments.find(x => !x.done);
  const sp = currentSport();
  return `Hey <b>${esc(firstName())}</b> 👋 I'm your personal coach — I can see your whole week, not just one screen.<br><br>
  Right now: <b>${a ? esc(a.title) + ' · due ' + esc(a.due.toLowerCase()) : 'no pending assignments'}</b>, ${state.experience.toLowerCase()} training, and ${esc(sportName())} practice. Your study block is at <b>4:00 PM</b> and training at <b>5:30 PM</b>.<br><br>
  Where do you want to start?`;
}
function openCoach(){
  $('#coachSheet').classList.add('open');
  $('#backdrop').classList.add('open');
  if (!coachWelcomed) {
    coachWelcomed = true;
    $('#coachWelcome').innerHTML = coachWelcome();
  }
  setTimeout(scrollCoach, 350);
}
function closeCoach(){
  $('#coachSheet').classList.remove('open');
  $('#backdrop').classList.remove('open');
}
function scrollCoach(){ const el = $('#coachScroll'); el.scrollTop = el.scrollHeight; }
function askCoach(text){ openCoach(); setTimeout(() => sendCoach(text), 260); }

function sendCoach(raw){
  const text = String(raw || '').trim();
  if (!text) return;
  if (coachBusy) { coachQueue.push(text); return; }
  coachBusy = true;
  const scroll = $('#coachScroll');
  scroll.insertAdjacentHTML('beforeend', `<div class="msg user">${esc(text)}</div>`);
  $('#coachInput').value = '';
  scrollCoach();
  const typing = document.createElement('div');
  typing.className = 'typing';
  typing.innerHTML = '<i></i><i></i><i></i>';
  scroll.appendChild(typing);
  scrollCoach();
  setTimeout(() => {
    typing.remove();
    scroll.insertAdjacentHTML('beforeend', `<div class="msg ai">${coachReply(text)}</div>`);
    coachBusy = false;
    scrollCoach();
    if (coachQueue.length) setTimeout(() => sendCoach(coachQueue.shift()), 300);
  }, 850);
}

function coachReply(raw){
  const t = raw.toLowerCase();
  const sp = currentSport();
  const w = currentWorkout();
  const a = state.assignments.find(x => !x.done);
  const assignLine = a ? `<b>${esc(a.title)}</b> (${esc(a.due)})` : 'nothing overdue';
  const li = levelInfo(totalXp());

  if (/form|technique|how do i do|demonstrat|good form/.test(t)) {
    const ex = currentWorkout().exercises[Math.min(playerIdx, currentWorkout().exercises.length - 1)];
    return `Form guide — <b>${esc(ex.name)}</b><br><br>
    1. <b>Set your base.</b> Feet planted, core braced, ribs stacked over hips.<br>
    2. <b>Control the lowering phase</b> for about 2 seconds — that's where the strength is built.<br>
    3. <b>Keep joints stacked.</b> Knees track toes, elbows over wrists, neck neutral.<br>
    4. <b>Breathe out on the effort</b> and stop 1–2 reps before form breaks.<br><br>
    Want me to count you through the next set?`;
  }
  if (/quadratic|algebra|factor|equation/.test(t)) {
    return `Let's break this down. A quadratic is any equation in the form <b>ax² + bx + c = 0</b>.<br><br>
    For <b>x² − 5x + 6 = 0</b>: find two numbers that multiply to <b>+6</b> and add to <b>−5</b> → <b>−2</b> and <b>−3</b>.<br><br>
    So it factors to <b>(x − 2)(x − 3) = 0</b>, which gives <b>x = 2</b> or <b>x = 3</b>.<br><br>
    Paste your exact problem and I'll walk you through it one step at a time — no answer-only shortcuts.`;
  }
  if (/test prep|midterm|final exam|exam|studying for|test tomorrow/.test(t)) {
    return `Here's a 3-day plan for your Biology test:<br><br>
    <b>Today</b> — 25 min active recall with your cellular-energy deck, then 10 min of self-testing.<br>
    <b>Tomorrow</b> — 20 min on weak cards + one 5-question quiz. No re-reading notes.<br>
    <b>Day of</b> — 10 min light review, then close the book. Sleep beats cramming.<br><br>
    <span class="m-action">✓ Test prep plan saved to School</span>`;
  }
  if (/mitochondria|atp|cellular|glycolysis|biology|cell/.test(t)) {
    return `Think of mitochondria as the cell's <b>power plant</b>. They take energy from glucose and convert it into <b>ATP</b> — the molecule cells spend to do work.<br><br>
    The flow: <b>glycolysis</b> (cytoplasm) → <b>Krebs cycle</b> (mitochondrial matrix) → <b>electron transport chain</b> (inner membrane), where most ATP is made.<br><br>
    Quick memory hook: <i>glucose in, ATP out, oxygen required</i>. Your flashcard deck covers exactly this — want a 5-question quiz?`;
  }
  if (/tired|exhaust|sore|energy|sleepy|low|burn/.test(t)) {
    return `Thanks for telling me — that's information, not weakness.<br><br>
    I'd keep the streak alive with a <b>20-minute mobility flow</b> and a <b>15-minute light review</b> of ${assignLine}. We move the heavy session to Thursday, when your recovery score is higher.<br><br>
    <span class="m-action">✓ Today's plan adapted · intensity 70%</span>`;
  }
  if (/resched|move|when should|when.*(work|train)|best time|schedule|time/.test(t)) {
    return `Here's the cleanest window today:<br><br>
    <b>4:00–4:25</b> — ${a ? esc(a.subject) : 'Study'} focus (deep work first)<br>
    <b>4:45–5:20</b> — ${esc(sportName())} drills<br>
    <b>5:30–6:15</b> — ${esc(w.name)}<br>
    <b>7:00–7:30</b> — flashcards + lab outline<br><br>
    Training lands after your study block and before dinner, so you're not cramming either one. Want me to shift it earlier?`;
  }
  if (/plan|my day|routine|organize|productive/.test(t)) {
    return `Here's your day, built around school first:<br><br>
    <b>4:00 PM</b> — ${a ? esc(a.subject) : 'Study'} deep block, 25 min<br>
    <b>4:45 PM</b> — ${esc(sp.drills[0].n)}, 35 min<br>
    <b>5:30 PM</b> — ${esc(w.name)}, ${w.dur} min<br>
    <b>7:00 PM</b> — review + 10 flashcards, 20 min<br><br>
    That's ${w.dur + 55} focused minutes — enough to move every area without burning out. <span class="m-action">✓ Added to today's plan</span>`;
  }
  if (/school|study|homework|assignment|test|quiz|flash|grade|focus|exam/.test(t)) {
    return `${a ? `Your next deadline is ${assignLine}.` : 'You are fully caught up right now — great place to be.'}<br><br>
    Try one <b>25/5 block</b> on the hardest subject first, then 10 minutes of active recall. Your Biology deck is ready to review, and I can generate a 5-question quiz when you finish.<br><br>
    If a topic feels stuck, paste the question here and I'll explain it step by step.`;
  }
  if (/sport|basketball|football|soccer|baseball|tennis|volleyball|track|practice|drill|game/.test(t)) {
    return `For ${esc(sportName())}, your focus is <b>${esc(sp.focus.toLowerCase())}</b>. You're at ${sp.goals[0].v}% on ${esc(sp.goals[0].n.toLowerCase())} — trending up.<br><br>
    Today: 3 rounds of <b>${esc(sp.drills[0].n)}</b> (${esc(sp.drills[0].d)}), then ${esc(sp.drills[1].n.toLowerCase())}. Keep it crisp — stop a set early if form breaks.<br><br>
    ${esc(sp.note)}`;
  }
  if (/motiv|discipline|consistent|lazy|quit|give up|hard|can't|stuck/.test(t)) {
    return `You're on a <b>${currentStreak()}-day streak</b>. That didn't happen by accident — it happened because you showed up on days you didn't feel like it.<br><br>
    Today doesn't need to be impressive. It needs to be <b>non-zero</b>. Do the smallest real version: one study block, one set, one glass of water.<br><br>
    The goal isn't perfection. It's proving to yourself that you don't disappear when it gets boring.`;
  }
  if (/water|hydrat|drink/.test(t)) {
    return `You're at <b>${state.water} of ${state.waterGoal} glasses</b> today. You've got ${Math.max(0, state.waterGoal - state.water)} to go — that's one glass per hour for the rest of the afternoon.<br><br>
    Pair it with your study blocks: finish a block, finish a glass. Easier than remembering out of nowhere.`;
  }
  if (/progress|level|xp|streak|badge|improving/.test(t)) {
    return `You're <b>Level ${li.level} · ${li.name}</b> with <b>${fmt(totalXp())} XP</b> and a <b>${currentStreak()}-day streak</b>.<br><br>
    Today: ${tasksDoneCount()}/5 goals complete. You're <b>${li.need} XP</b> from Level ${li.level + 1}. The fastest path: finish your workout (+40), your study block (+30), and your sport drills (+25).<br><br>
    More importantly, you've trained ${state.weekMinutes.filter(m => m > 0).length} days this week — consistency is the real score.`;
  }
  if (/balance|busy|overwhelm|stress|anxious|too much/.test(t)) {
    return `You're carrying school, ${esc(sportName())}, training, and a social life. That's a lot — feeling stretched is normal.<br><br>
    My rule for weeks like this: <b>one priority per block</b>. School gets 4:00, sport gets 4:45, training gets 5:30. Everything else is a bonus, not a failure.<br><br>
    Protect sleep first. If something has to give, cut volume — never recovery.`;
  }
  if (/sleep|rest|recover/.test(t)) {
    return `Recovery is where the progress actually sticks. Aim for <b>8–9 hours</b>, especially after ${esc(w.name.toLowerCase())} days.<br><br>
    Tonight: screens down 30 minutes early, room cool and dark, and a 5-minute breathing reset. Your recovery score is already 82% — let's push it to 90%.`;
  }
  if (/eat|nutrition|food|protein|meal/.test(t)) {
    return `Keep it simple: <b>protein at every meal</b>, carbs around training, and water throughout the day.<br><br>
    Pre-workout (5:00 PM): a banana or toast. Post-workout: protein + rice or potatoes. You don't need a perfect diet — you need a repeatable one.`;
  }
  if (/^(hi|hey|hello|yo|sup)\b/.test(t)) {
    return `Hey ${esc(firstName())} 👋 I'm here. You've got ${tasksDoneCount()}/5 goals done and ${esc(sportName())} practice on deck.<br><br>
    Want me to plan your afternoon, adjust training, or help with ${assignLine}?`;
  }
  return `I hear you. Here's how I'd approach it:<br><br>
  Anchor it to your goal — <b>${esc(state.goal)}</b> — then make the next step smaller than feels necessary. Based on your day, I'd protect the 4:00 study block, train at 5:30, and keep tonight's recovery routine.<br><br>
  Tell me a bit more about what's blocking you and I'll adjust the plan around it.`;
}

/* ============================================================
   ONBOARDING
   ============================================================ */
let onbStep = 0;
let onbEditing = false;
const ONB_LABELS = { 1:'Continue', 2:'Continue', 3:'Continue', 4:'Continue', 5:'Continue', 6:'Continue', 7:'Build my plan' };

function syncOnbFromState(){
  $('#onbName').value = state.name || '';
  $$('#onb [data-group]').forEach(g => {
    const key = g.dataset.group;
    let val = state[key];
    if (key === 'habits') val = state.habits;
    if (key === 'sports') val = state.sports;
    if (key === 'interests') val = state.interests;
    if (key === 'schoolGoals') val = state.schoolGoals;
    if (key === 'equipment') val = state.equipment;
    const values = Array.isArray(val) ? val : (val ? [val] : []);
    $$('.opt', g).forEach(o => o.classList.toggle('selected', values.includes(o.dataset.val)));
  });
}
function showOnb(step){
  onbStep = step;
  $('#onb').style.display = 'flex';
  requestAnimationFrame(() => { $('#onb').classList.remove('hidden'); $('#onb').classList.remove('closing'); });
  updateOnb();
}
function hideOnb(){
  $('#onb').classList.add('closing');
  setTimeout(() => { $('#onb').style.display = 'none'; }, 600);
}
function updateOnb(){
  $$('.onb-step').forEach(s => s.classList.toggle('active', Number(s.dataset.step) === onbStep));
  const pct = onbStep === 0 ? 0 : Math.round(onbStep / 7 * 100);
  $('#onbBar').style.width = pct + '%';
  $('#onbFoot').style.display = onbStep === 0 ? 'none' : 'block';
  if (onbStep === 7) updateOnbSummary();
  const label = ONB_LABELS[onbStep] || 'Continue';
  $('#onbNext').innerHTML = `${label} <svg class="arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
  $('#onbHint').textContent = onbStep === 7 ? 'Your AI coach will adapt everything as you progress' : 'You can change everything later in Profile';
  $('#onbBody').scrollTop = 0;
  $('#onbSkip').textContent = onbStep === 0 ? 'Skip to demo' : 'Exit';
}
function getSel(group){ return $$(`#onb [data-group="${group}"] .opt.selected`).map(o => o.dataset.val); }
function updateOnbSummary(){
  const name = $('#onbName').value.trim() || firstName();
  const sports = getSel('sports');
  const interests = getSel('interests');
  const exp = getSel('experience')[0] || state.experience;
  const time = getSel('time')[0] || state.time;
  const goal = getSel('goal')[0] || state.goal;
  $('#onbSummary').innerHTML =
    `<b>${esc(name)}</b> · ${esc(exp)} · ${esc(time)}/day<br>
     Sports: ${sports.length ? esc(sports.join(', ')) : '—'}<br>
     Focus: ${interests.length ? esc(interests.slice(0, 3).join(', ')) : '—'}<br>
     Goal: ${esc(goal)}`;
}
function onbNext(){
  if (onbStep === 1) {
    if (!$('#onbName').value.trim()) { toast('Add your name to continue', '👋'); $('#onbName').focus(); return; }
    if (!getSel('age').length) { toast('Pick an age range', '🎂'); return; }
  }
  if (onbStep === 2 && !getSel('interests').length) { toast('Pick at least one focus', '🎯'); return; }
  if (onbStep === 3 && !getSel('sports').length) { toast('Pick at least one sport', '🏀'); return; }
  if (onbStep === 4 && !getSel('experience').length) { toast('Choose your starting point', '🌱'); return; }
  if (onbStep === 6 && !getSel('habits').length) { toast('Pick at least one habit', '💧'); return; }
  if (onbStep === 7) { finishOnboarding(false); return; }
  onbStep++;
  updateOnb();
}
function finishOnboarding(skip){
  if (!skip) {
    const name = $('#onbName').value.trim();
    if (name) state.name = name;
    state.age = getSel('age')[0] || state.age;
    state.interests = getSel('interests').length ? getSel('interests') : state.interests;
    state.sports = getSel('sports').length ? getSel('sports') : state.sports;
    state.experience = getSel('experience')[0] || state.experience;
    state.equipment = getSel('equipment').length ? getSel('equipment') : state.equipment;
    state.schoolGoals = getSel('schoolGoals').length ? getSel('schoolGoals') : state.schoolGoals;
    state.time = getSel('time')[0] || state.time;
    state.habits = getSel('habits').length ? getSel('habits') : state.habits;
    state.goal = getSel('goal')[0] || state.goal;
    state.difficulty = state.experience;
    state.sport = state.sports[0] || 'Basketball';
    state.sport = SPORTS[state.sport] ? state.sport : 'Other';
    state.tasksDone = {};
  }
  state.onboarded = true;
  saveState();
  hideOnb();
  renderAll();
  showScreen('home');
  toast(`Plan ready, ${firstName()} — let's level up`, '🚀');
  confetti();
}

/* ============================================================
   INIT + EVENTS
   ============================================================ */
function tickClock(){
  const d = new Date();
  let h = d.getHours(), m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  $('#sbTime').textContent = `${h}:${m}`;
}

document.addEventListener('click', (e) => {
  const nav = e.target.closest('[data-nav]');
  if (nav) { showScreen(nav.dataset.nav); return; }

  const coachBtn = e.target.closest('[data-coach]');
  if (coachBtn) { askCoach(coachBtn.dataset.coach); return; }

  const toggle = e.target.closest('[data-toggle]');
  if (toggle) { toggle.classList.toggle('on'); haptic(); return; }

  const opt = e.target.closest('#onb .opt');
  if (opt) {
    const group = opt.closest('[data-group]');
    const single = group.dataset.single === '1';
    const max = Number(group.dataset.max || 99);
    if (single) {
      $$('.opt', group).forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
    } else {
      const selected = $$('.opt.selected', group);
      if (!opt.classList.contains('selected') && selected.length >= max) {
        toast(`Pick up to ${max}`, '✋');
        return;
      }
      opt.classList.toggle('selected');
    }
    haptic();
    if (onbStep === 7) updateOnbSummary();
    return;
  }

  const habitBtn = e.target.closest('[data-habit]');
  if (habitBtn) { toggleHabit(habitBtn.dataset.habit); return; }

  const sportTile = e.target.closest('.sport-tile');
  if (sportTile) {
    state.sport = sportTile.dataset.sport;
    if (!state.sports.includes(state.sport)) state.sports = [state.sport, ...state.sports].slice(0, 3);
    saveState();
    renderSports(); renderHome(); renderProfile();
    toast(`${state.sport} plan loaded`, '🏆');
    haptic();
    return;
  }
});

$('#openCoachTop').addEventListener('click', openCoach);
$('#closeCoach').addEventListener('click', closeCoach);
$('#backdrop').addEventListener('click', closeCoach);
$('#coachForm').addEventListener('submit', (e) => { e.preventDefault(); sendCoach($('#coachInput').value); });

$('#flashcard').addEventListener('click', flipCard);
$('#fcPrev').addEventListener('click', () => moveCard(-1));
$('#fcNext').addEventListener('click', () => moveCard(1));

$('#focusStart').addEventListener('click', toggleFocus);
$('#focusReset').addEventListener('click', resetFocus);

$('#playerClose').addEventListener('click', closePlayer);
$('#playerNext').addEventListener('click', playerNext);
$('#playerPrev').addEventListener('click', playerPrev);
$('#playerGuide').addEventListener('click', () => {
  const ex = currentWorkout().exercises[playerIdx];
  closePlayer();
  setTimeout(() => askCoach(`How do I do ${ex.name} with good form?`), 380);
});

$$('#fitSeg button').forEach(b => b.addEventListener('click', () => {
  state.difficulty = b.dataset.diff;
  saveState();
  renderFitness(); renderHome(); renderProfile();
  toast(`${state.difficulty} plan selected`, '⚡');
}));

$('#onbStart').addEventListener('click', () => { onbStep = 1; updateOnb(); });
$('#onbNext').addEventListener('click', onbNext);
$('#onbSkip').addEventListener('click', () => finishOnboarding(true));
$('#restartOnb').addEventListener('click', () => { onbEditing = true; syncOnbFromState(); showOnb(1); });
$('#editProfile').addEventListener('click', () => { onbEditing = true; syncOnbFromState(); showOnb(1); });
/* ---------- mini sheet (custom habits & flashcards) ---------- */
let miniEmoji = '✨';
function openMini(){ $('#miniSheet').classList.add('open'); $('#miniBackdrop').classList.add('open'); }
function closeMini(){ $('#miniSheet').classList.remove('open'); $('#miniBackdrop').classList.remove('open'); }
function openHabitSheet(){
  miniEmoji = '✨';
  $('#miniTitle').textContent = 'Create a habit';
  $('#miniContent').innerHTML = `
    <label class="mini-label" for="miniHabitName">Habit name</label>
    <input class="mini-input" id="miniHabitName" maxlength="32" placeholder="e.g. Read 10 pages before bed" autocomplete="off">
    <label class="mini-label">Pick an icon</label>
    <div class="emoji-pick" id="miniEmojiPick">
      ${['🌅','🌙','💧','🧘','📓','📖','📵','🥗','🏃','🧠'].map(e => `<button type="button" data-emoji="${e}" class="${e === miniEmoji ? 'active' : ''}">${e}</button>`).join('')}
    </div>
    <label class="mini-label" for="miniReminder">Reminder (optional)</label>
    <input class="mini-input" id="miniReminder" maxlength="24" placeholder="e.g. 7:30 AM — before school" autocomplete="off">
    <button class="btn primary mini-save" id="miniSaveHabit">Add habit</button>`;
  $$('#miniEmojiPick button').forEach(b => b.addEventListener('click', () => {
    miniEmoji = b.dataset.emoji;
    $$('#miniEmojiPick button').forEach(x => x.classList.toggle('active', x === b));
  }));
  $('#miniSaveHabit').addEventListener('click', saveHabit);
  openMini();
  setTimeout(() => $('#miniHabitName').focus(), 350);
}
function saveHabit(){
  const name = $('#miniHabitName').value.trim();
  if (!name) { toast('Give your habit a name first', '✏️'); return; }
  if (state.habits.some(h => h.toLowerCase() === name.toLowerCase())) { toast('That habit is already on your list', '👀'); return; }
  if (state.habits.length >= 8) { toast('8 habits is plenty — quality over quantity', '🎯'); return; }
  state.habits.push(name);
  state.habitIcons[name] = miniEmoji;
  const reminder = $('#miniReminder').value.trim();
  if (reminder) state.habitReminders[name] = reminder;
  saveState(); closeMini(); renderHome(); renderProfile();
  toast('Habit added — check it off for +5 XP', '✨');
  haptic();
}
function openCardSheet(){
  $('#miniTitle').textContent = 'Create a flashcard';
  $('#miniContent').innerHTML = `
    <label class="mini-label" for="miniQuestion">Question</label>
    <textarea class="mini-textarea" id="miniQuestion" maxlength="160" placeholder="What do you need to remember?"></textarea>
    <label class="mini-label" for="miniAnswer">Answer</label>
    <textarea class="mini-textarea" id="miniAnswer" maxlength="240" placeholder="Explain it in your own words — that's how it sticks."></textarea>
    <button class="btn primary mini-save" id="miniSaveCard">Add to deck</button>`;
  $('#miniSaveCard').addEventListener('click', saveCard);
  openMini();
  setTimeout(() => $('#miniQuestion').focus(), 350);
}
function saveCard(){
  const q = $('#miniQuestion').value.trim();
  const a = $('#miniAnswer').value.trim();
  if (!q || !a) { toast('Add both a question and an answer', '🗂'); return; }
  state.customCards.push({ q, a });
  state.fcIndex = getCards().length - 1;
  saveState(); closeMini(); $('#flashcard').classList.remove('flipped'); renderSchool();
  toast('Flashcard added to your deck', '🗂');
  haptic();
}
$('#addHabitBtn').addEventListener('click', openHabitSheet);
$('#addCardBtn').addEventListener('click', openCardSheet);
$('#miniClose').addEventListener('click', closeMini);
$('#miniBackdrop').addEventListener('click', closeMini);

$('#regenPlan').addEventListener('click', () => {
  renderSports();
  toast('Fresh 7-day plan generated around school', '✨');
  confetti();
});

window.showScreen = showScreen;

/* boot */
tickClock();
setInterval(tickClock, 30000);
renderAll();
updateFocusUI();
if (state.onboarded) {
  $('#onb').style.display = 'none';
} else {
  showOnb(0);
}
