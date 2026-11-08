/* ============================================================
   LEVEL UP — app logic
   ============================================================ */
const $  = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const STORAGE_KEY = 'levelup_state_v1';
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

const BADGES = [
  { icon:'🌱', name:'First Step', earned:true }, { icon:'🔥', name:'7-Day Streak', earned:true },
  { icon:'💧', name:'Hydrated', earned:true }, { icon:'🌅', name:'Early Bird', earned:true },
  { icon:'🎯', name:'Focused', earned:true }, { icon:'💪', name:'Strong Start', earned:true },
  { icon:'🏆', name:'30-Day Streak', earned:false }, { icon:'💯', name:'Century Club', earned:false },
  { icon:'⚙️', name:'Iron Will', earned:false }, { icon:'🎓', name:'Scholar', earned:false },
  { icon:'🏅', name:'Athlete', earned:false }, { icon:'👑', name:'Level 10', earned:false }
];

const CHALLENGES = [
  { icon:'🔥', name:'Move 5 days this week', detail:'4 of 5 days complete', pct:80, xp:120 },
  { icon:'📚', name:'Complete 10 study blocks', detail:'7 of 10 blocks', pct:70, xp:80 },
  { icon:'💧', name:'Hydrate 7 days in a row', detail:'5 of 7 days', pct:71, xp:60 }
];

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
function defaultAssignments(){
  return [
    { id:'alg', title:'Algebra: Quadratics worksheet', subject:'Math', color:'#4C8DFF', due:'Tomorrow', dueClass:'soon', done:false },
    { id:'bio', title:'Biology lab report — cellular energy', subject:'Biology', color:'#3DDC97', due:'Friday', dueClass:'', done:false },
    { id:'hist', title:'History reading + notes (pp. 142–160)', subject:'History', color:'#FF9F45', due:'Monday', dueClass:'ok', done:false },
    { id:'span', title:'Spanish vocab set 7', subject:'Spanish', color:'#FF5C8A', due:'Thursday', dueClass:'', done:false }
  ];
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
    weekMinutes: [38, 52, 0, 64, 45, 72, 30]
  };
}

let state = loadState();
function loadState(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const saved = JSON.parse(raw);
    const merged = Object.assign(defaultState(), saved);
    merged.assignments = Array.isArray(saved.assignments) ? saved.assignments : defaultAssignments();
    return merged;
  } catch(e){ return defaultState(); }
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
function totalXp(){ return Math.max(0, state.xp); }
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
  const habitName = state.habits[0] || 'Morning routine';
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
function addXp(amount){
  const before = levelInfo(totalXp()).level;
  state.xp = Math.max(0, state.xp + amount);
  const after = levelInfo(totalXp()).level;
  if (after > before) {
    setTimeout(() => { toast(`Level ${after} unlocked — ${levelInfo(totalXp()).name}!`, '👑'); confetti(); }, 350);
  }
}
function setTaskDone(id, done, opts = {}){
  const t = taskById(id);
  if (!t) return;
  if (done && !state.tasksDone[id]) {
    state.tasksDone[id] = true;
    addXp(t.xp);
    if (!opts.silent) toast(`+${t.xp} XP · ${t.label.split('—')[0].trim()}`, '✦');
    if (!opts.silent) haptic();
  } else if (!done && state.tasksDone[id]) {
    delete state.tasksDone[id];
    addXp(-t.xp);
  }
  if (!done) state.dayCelebrated = false;
  if (done && !state.dayCelebrated && makeTasks().every(x => state.tasksDone[x.id])) {
    state.dayCelebrated = true;
    setTimeout(() => { toast('All goals complete — day won!', '🔥'); confetti(); }, 500);
  }
  saveState();
}
function toggleHabit(name){
  if (state.habitsDone[name]) { delete state.habitsDone[name]; addXp(-5); }
  else { state.habitsDone[name] = true; addXp(5); toast('+5 XP · Habit complete', '✓'); haptic(); }
  saveState(); renderHome(); renderProfile();
}
function toggleDrill(i){
  const key = `${state.sport}-${i}`;
  if (state.drillsDone[key]) { delete state.drillsDone[key]; addXp(-10); }
  else { state.drillsDone[key] = true; addXp(10); toast('+10 XP · Drill complete', '🏆'); haptic(); }
  saveState(); renderSports(); renderHome(); renderProfile();
}
function haptic(){ if (navigator.vibrate) try { navigator.vibrate(8); } catch(e){} }

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
  $('#homeStreak').textContent = state.streak;
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
  const habitEmoji = { 'Morning routine':'🌅','Night routine':'🌙','Hydration':'💧','Stretch':'🧘','Journal':'📓','Read':'📖','Less screen':'📵','Eat well':'🥗' };
  const habitList = state.habits;
  const habitDone = habitList.filter(h => state.habitsDone[h]).length;
  $('#habitCount').textContent = `${habitDone}/${habitList.length}`;
  $('#habitList').innerHTML = habitList.map(h => {
    const on = !!state.habitsDone[h];
    const icon = (state.habitIcons && state.habitIcons[h]) || habitEmoji[h] || '✨';
    const reminder = state.habitReminders && state.habitReminders[h];
    return `<div class="habit-row">
      <div class="habit-ico">${icon}</div>
      <div class="t-body"><div class="t-label" style="${on ? 'color:var(--muted2);text-decoration:line-through' : ''}">${esc(h)}</div><div class="t-sub">${on ? 'Completed today' : (reminder ? '⏰ ' + esc(reminder) : 'Tap to check off')}</div></div>
      <button class="check habit-toggle ${on ? 'done' : ''}" style="${on ? 'background:var(--grad);border-color:transparent;color:#fff' : ''}" data-habit="${esc(h)}" aria-label="Toggle ${esc(h)}">${svgCheck()}</button>
    </div>`;
  }).join('');
  const heat = [1,1,1,0,1,1,1,1,1,0,1,1,1,1];
  if (habitDone > 0) heat[13] = 1;
  $('#habitHeat').innerHTML = heat.map(v => `<i class="${v ? 'on' : ''}"></i>`).join('');
  const monthPct = Math.min(98, 78 + habitDone * 3);
  $('#habitConsistency').textContent = `${monthPct}% this month`;

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
      <button class="btn primary full sm mt14" onclick="openPlayer()">${state.tasksDone.workout ? 'Do it again' : 'Start workout'} <span class="arrow">→</span></button>
    </div>`;

  const { mondayIndex } = nowParts();
  const max = Math.max(...state.weekMinutes, 1);
  $('#weekBars').innerHTML = state.weekMinutes.map((m, i) => `
    <div class="bar-col ${i === mondayIndex ? 'today' : ''}">
      <div class="bar-track"><div class="bar-fill ${m === 0 ? 'zero' : ''}" style="height:${Math.max(4, Math.round(m / max * 100))}%"></div></div>
      <span>${DAYS_SHORT[i]}</span>
    </div>`).join('');
  $('#weekSummary').textContent = `${state.weekMinutes.filter(m => m > 0).length} active days`;

  const plan = WEEK_PLAN[state.difficulty] || WEEK_PLAN.Beginner;
  $('#planList').innerHTML = plan.map((name, i) => {
    const isToday = i === mondayIndex;
    const done = i < mondayIndex || (isToday && state.tasksDone.workout);
    const label = isToday ? (state.tasksDone.workout ? 'Completed today' : 'Today · 5:30 PM') : done ? 'Completed' : 'Planned · 5:30 PM';
    return `<div class="task" style="cursor:default">
      <div class="check" style="${done ? 'background:var(--grad);border-color:transparent;color:#fff' : ''}">${svgCheck()}</div>
      <div class="t-body"><div class="t-label" style="${done && !isToday ? 'color:var(--muted2)' : ''}">${esc(i === mondayIndex ? w.name : name)}</div><div class="t-sub">${label}${isToday ? ' · <span class="tag">TODAY</span>' : ''}</div></div>
      <span class="tiny" style="color:var(--muted2)">${i === mondayIndex ? w.dur : 30} min</span>
    </div>`;
  }).join('');
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
  const sched = [
    { t: sp.drills[0].t + ' focus', s: '35 min · after school' },
    { t: 'Strength + mobility', s: '30 min · gym or home' },
    { t: sp.drills[1].n, s: '25 min · skill block' },
    { t: 'Recovery + film study', s: '20 min · low intensity' },
    { t: 'Team practice', s: '90 min · full intensity' },
    { t: 'Game day', s: 'Warm-up + compete' },
    { t: 'Reset & mobility', s: '15 min · easy' }
  ];
  $('#sportSchedule').innerHTML = sched.map((s, i) => {
    const isToday = i === mondayIndex;
    return `<div class="schedule-row ${isToday ? 'today' : ''}">
      <div class="sch-day"><b>${DAYS_SHORT[i]}</b><span>${i === mondayIndex ? 'TODAY' : ''}</span></div>
      <div class="sch-bar"><div><b>${esc(s.t)}</b><span>${esc(s.s)}</span></div><span class="mini-tag">${isToday ? 'NOW' : i < mondayIndex ? 'DONE' : 'PLAN'}</span></div>
    </div>`;
  }).join('');

  $('#goalList').innerHTML = sp.goals.map(g => `
    <div class="goal">
      <div class="goal-top"><b>${esc(g.n)}</b><span>${esc(g.label)}</span></div>
      <div class="track"><i style="width:${g.v}%"></i></div>
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
  $('#assignmentList').innerHTML = state.assignments.map(a => `
    <div class="assignment ${a.done ? 'done' : ''}">
      <button class="check" onclick="toggleAssignment('${a.id}')" style="${a.done ? 'background:var(--grad);border-color:transparent;color:#fff' : ''}">${svgCheck()}</button>
      <div class="subject-dot" style="background:${a.color}"></div>
      <div class="t-body">
        <div class="t-label">${esc(a.title)}</div>
        <div class="t-sub">${esc(a.subject)} · <span class="due ${a.dueClass}">${esc(a.due)}</span></div>
      </div>
      <button class="tiny" style="color:var(--muted2)" onclick="askCoach('Help me with ${esc(a.subject)} homework')">Ask AI</button>
    </div>`).join('');

  $('#studyPlan').innerHTML = [
    { t:'4:00 PM', n:'Algebra — quadratics review', s:'25 min · focus timer' },
    { t:'4:30 PM', n:'Flashcards — cellular energy', s:'15 min · active recall' },
    { t:'5:30 PM', n:'Training window', s:'45 min · ' + currentWorkout().name },
    { t:'7:00 PM', n:'Biology lab report outline', s:'30 min · deep work' }
  ].map((r, i) => `<div class="schedule-row" style="padding:7px 0">
      <div class="sch-day" style="width:48px"><b style="font-size:9px;color:${i === 0 ? '#8FE9D6' : 'var(--muted)'}">${esc(r.t)}</b></div>
      <div class="sch-bar" style="background:${i === 1 ? 'rgba(56,224,206,.07)' : 'rgba(255,255,255,.035)'}"><div><b>${esc(r.n)}</b><span>${esc(r.s)}</span></div></div>
    </div>`).join('');

  const cards = getCards();
  if (state.fcIndex > cards.length - 1) state.fcIndex = 0;
  const card = cards[state.fcIndex];
  $('#fcQuestion').textContent = card.q;
  $('#fcAnswer').textContent = card.a;
  $('#fcDots').innerHTML = cards.map((_, i) => `<i class="${i === state.fcIndex ? 'on' : ''}"></i>`).join('');

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

  const grades = [
    { n:'Math', v:92, g:'A−' }, { n:'Biology', v:88, g:'B+' }, { n:'History', v:85, g:'B' },
    { n:'Spanish', v:90, g:'A−' }, { n:'English', v:87, g:'B+' }
  ];
  $('#gradeList').innerHTML = grades.map(g => `
    <div class="grade-row">
      <span class="gname">${g.n}</span>
      <div class="track"><i style="width:${g.v}%"></i></div>
      <span class="gval">${g.g}</span>
    </div>`).join('');
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
  $('#statStreak').textContent = state.streak;
  $('#statWorkouts').textContent = 24 + (state.tasksDone.workout ? 1 : 0);
  $('#statBadges').textContent = BADGES.filter(b => b.earned).length;

  $('#badgeGrid').innerHTML = BADGES.map(b => `
    <div class="badge ${b.earned ? 'earned' : 'locked'}">
      <span class="b-ico">${b.icon}</span><span>${b.name}</span>
    </div>`).join('');
  $('#badgeMeta').textContent = `${BADGES.filter(b => b.earned).length} of ${BADGES.length}`;

  $('#challengeList').innerHTML = CHALLENGES.map(c => `
    <div class="challenge">
      <div class="ch-ico">${c.icon}</div>
      <div class="ch-body"><b>${c.name}</b><div class="tiny" style="margin-top:2px">${c.detail}</div>
        <div class="ch-bar"><i style="width:${c.pct}%"></i></div>
      </div>
      <span class="ch-xp">+${c.xp} XP</span>
    </div>`).join('');

  $('#profileTags').innerHTML = (state.interests.length ? state.interests : ['Strength','Discipline'])
    .map(t => `<span class="chip active">${esc(t)}</span>`).join('');
  $('#profileLevel').textContent = state.experience;
  $('#profileTime').textContent = state.time;
  $('#profileSports').textContent = state.sports.length ? state.sports.join(', ') : sportName();
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
  $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.nav === name));
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
    if (!state.quizAwarded[state.quizIndex]) {
      state.quizAwarded[state.quizIndex] = true;
      addXp(10);
    }
    toast('Correct! +10 XP', '🎯');
    confetti();
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
      addXp(20);
      toast('Focus session complete +20 XP', '🎯');
      confetti();
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
  state.weekMinutes[(nowParts().mondayIndex)] = Math.max(state.weekMinutes[(nowParts().mondayIndex)], w.dur);
  if (!already) {
    setTaskDone('workout', true, { silent:true });
    toast(`Workout complete · +40 XP · ${w.dur} min logged`, '🏆');
  } else {
    toast('Workout logged — extra volume never hurts', '🏆');
  }
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
    return `You're on a <b>${state.streak}-day streak</b>. That didn't happen by accident — it happened because you showed up on days you didn't feel like it.<br><br>
    Today doesn't need to be impressive. It needs to be <b>non-zero</b>. Do the smallest real version: one study block, one set, one glass of water.<br><br>
    The goal isn't perfection. It's proving to yourself that you don't disappear when it gets boring.`;
  }
  if (/water|hydrat|drink/.test(t)) {
    return `You're at <b>${state.water} of ${state.waterGoal} glasses</b> today. You've got ${Math.max(0, state.waterGoal - state.water)} to go — that's one glass per hour for the rest of the afternoon.<br><br>
    Pair it with your study blocks: finish a block, finish a glass. Easier than remembering out of nowhere.`;
  }
  if (/progress|level|xp|streak|badge|improving/.test(t)) {
    return `You're <b>Level ${li.level} · ${li.name}</b> with <b>${fmt(totalXp())} XP</b> and a <b>${state.streak}-day streak</b>.<br><br>
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
