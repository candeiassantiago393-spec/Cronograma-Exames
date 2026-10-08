(() => {
  const DATA = window.CRONOGRAMA_DATA;
  const CURRENT_PLAN_VERSION = DATA.planVersion || 1;
  const IAVE = window.IAVE_EXAMS || [];
  const SIMS = window.SIMULACRO_SLOTS || [];
  const STORAGE_KEY = "cronograma-exames-v2";
  const STORAGE_PREV_KEY = "cronograma-exames-v2-prev";
  const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const MONTHS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  const BUILTIN_IDS = ["FIS", "MAT", "PORT", "QUI", "FQ", "PREP"];
  const TYPES = Object.keys(DATA.typeLabels);
  const DIFFICULTY_LABELS = {
    facil: "Fácil",
    medio: "Médio",
    dificil: "Difícil",
  };
  const SUBJECT_COLORS = [
    "#7eb8de", // azul
    "#7dcb9e", // verde
    "#e8a78a", // pêssego
    "#6dbfb5", // teal
    "#c9a0dc", // lilás
    "#f0c96a", // amarelo areia
    "#f2a0b8", // rosa
    "#9aa8c4", // azul-cinza
    "#b5d46a", // lima
    "#e8b060", // âmbar
    "#a8d8d0", // menta
    "#d4a574", // terracotta suave
  ];

  const DEFAULT_PERSONAL_CATEGORIES = [
    { id: "beleza", label: "Beleza", color: "#f2a0b8" },
    { id: "trabalho", label: "Trabalho", color: "#9aa8c4" },
    { id: "treinos", label: "Treinos", color: "#7dcb9e" },
    { id: "eventos", label: "Eventos", color: "#e8b060" },
  ];

  let state = loadState();
  let viewMode = window.matchMedia("(max-width: 900px)").matches ? "week" : "month";
  let viewYear = 2026;
  let viewMonth = 9;
  let weekAnchor = parseISO("2026-10-05");
  let selectedDate = null;
  let editingTaskId = null;
  let activeTab = "calendar";
  let discFilter = new Set(allDisciplineIds());
  let scopeFilter = "both"; // study | personal | both
  let personalCatFilter = "ALL";
  let iaveSubjectFilter = "ALL";
  let errorDiscFilter = "ALL";
  let dragTaskId = null;
  let selectedSubjectColor = SUBJECT_COLORS[0];
  let selectedCatColor = SUBJECT_COLORS[6];
  let modalScopeDefault = "study";

  const els = {
    monthLabel: document.getElementById("month-label"),
    weekdayHead: document.getElementById("weekday-head"),
    grid: document.getElementById("calendar-grid"),
    legend: document.getElementById("legend"),
    legendRow: document.getElementById("legend-row"),
    scopeFilters: document.getElementById("scope-filters"),
    sideEmpty: document.getElementById("side-empty"),
    sideContent: document.getElementById("side-content"),
    sideWeek: document.getElementById("side-week"),
    sideDate: document.getElementById("side-date"),
    sideProgress: document.getElementById("side-progress"),
    taskList: document.getElementById("task-list"),
    modal: document.getElementById("task-modal"),
    form: document.getElementById("task-form"),
    modalTitle: document.getElementById("modal-title"),
    btnDelete: document.getElementById("btn-delete-task"),
    exportRoot: document.getElementById("calendar-export-root"),
    errorModal: document.getElementById("error-modal"),
    errorForm: document.getElementById("error-form"),
    errorsList: document.getElementById("errors-list"),
    errorFilters: document.getElementById("error-filters"),
    simsList: document.getElementById("sims-list"),
    simsChart: document.getElementById("sims-chart"),
    iaveList: document.getElementById("iave-list"),
    iaveFilters: document.getElementById("iave-filters"),
    iaveProgress: document.getElementById("iave-progress"),
    subjectModal: document.getElementById("subject-modal"),
    subjectForm: document.getElementById("subject-form"),
    subjectList: document.getElementById("subject-list"),
    colorSwatches: document.getElementById("color-swatches"),
    categoryModal: document.getElementById("category-modal"),
    categoryForm: document.getElementById("category-form"),
    categoryList: document.getElementById("category-list"),
    catColorSwatches: document.getElementById("cat-color-swatches"),
    iaveModal: document.getElementById("iave-modal"),
    iaveForm: document.getElementById("iave-form"),
    iaveModalTitle: document.getElementById("iave-modal-title"),
    btnDeleteIave: document.getElementById("btn-delete-iave"),
    personalList: document.getElementById("personal-list"),
    personalCatFilters: document.getElementById("personal-cat-filters"),
    storageBanner: document.getElementById("storage-banner"),
  };

  let editingIaveId = null;

  function allDisciplineIds() {
    const custom = (state?.customSubjects || []).map((s) => s.id);
    return [...BUILTIN_IDS, ...custom];
  }

  function disciplineLabel(id) {
    if (DATA.disciplineLabels[id]) return DATA.disciplineLabels[id];
    const custom = (state.customSubjects || []).find((s) => s.id === id);
    return custom?.label || id;
  }

  function disciplineColor(id) {
    if (state.subjectColors?.[id]) return state.subjectColors[id];
    const custom = (state.customSubjects || []).find((s) => s.id === id);
    if (custom?.color) return custom.color;
    const builtin = {
      FIS: "#7eb8de",
      MAT: "#7dcb9e",
      PORT: "#e8a78a",
      QUI: "#6dbfb5",
      FQ: "#9aa8c4",
      PREP: "#c4b5a5",
    };
    return builtin[id] || "#57534e";
  }

  function discClass(id) {
    return BUILTIN_IDS.includes(id) ? `disc-${id}` : "chip-custom";
  }

  function discInlineStyle(id) {
    return `background:${disciplineColor(id)}`;
  }

  function setDisciplineColor(id, color) {
    if (BUILTIN_IDS.includes(id)) {
      if (!state.subjectColors) state.subjectColors = {};
      state.subjectColors[id] = color;
    } else {
      const custom = (state.customSubjects || []).find((s) => s.id === id);
      if (custom) custom.color = color;
    }
    saveState();
    renderSubjectList();
    fillSelects();
    renderAll();
    if (selectedDate) openDay(selectedDate);
  }

  function parseISO(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function toISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function addDays(date, n) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setDate(d.getDate() + n);
    return d;
  }

  function startOfWeek(date) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dow = (d.getDay() + 6) % 7;
    return addDays(d, -dow);
  }

  function uid(prefix = "t") {
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
  }

  function buildDefaultTasks() {
    const map = {};
    for (const prep of DATA.prepDays) {
      map[prep.date] = prep.tasks.map((task, i) => ({
        ...task,
        id: `prep_${prep.date}_${i}`,
      }));
    }
    const start = parseISO(DATA.week1Start);
    for (const week of DATA.weeks) {
      for (let dow = 0; dow < 7; dow++) {
        const date = addDays(start, (week.week - 1) * 7 + dow);
        const iso = toISO(date);
        const dayTasks = week.days[dow] || [];
        map[iso] = dayTasks.map((task, i) => ({
          ...task,
          id: `w${week.week}_d${dow}_${i}`,
          week: week.week,
          phase: week.phase,
        }));
      }
    }
    return map;
  }

  function isGeneratedTask(task) {
    const id = task?.id || "";
    return /^w\d+_d\d+_\d+$/.test(id) || /^prep_/.test(id);
  }

  /** Tarefas que o utilizador criou/editou (pessoais + estudo custom). */
  function isUserTask(task) {
    if (!task) return false;
    if (isPersonal(task)) return true;
    if (!isGeneratedTask(task)) return true;
    return false;
  }

  /** Plano oficial novo + mantém todas as tarefas que tu adicionaste. */
  function mergePlanKeepingUserTasks(oldMap) {
    const next = buildDefaultTasks();
    for (const [iso, list] of Object.entries(oldMap || {})) {
      const keep = (list || []).filter(isUserTask);
      if (!keep.length) continue;
      if (!next[iso]) next[iso] = [];
      const seen = new Set(next[iso].map((t) => t.id));
      for (const t of keep) {
        if (seen.has(t.id)) continue;
        next[iso].push(t);
        seen.add(t.id);
      }
    }
    return next;
  }

  function readStoredPlan(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function pruneDoneToExisting(tasksByDate, done) {
    const ids = new Set();
    for (const list of Object.values(tasksByDate || {})) {
      for (const t of list || []) ids.add(t.id);
    }
    const next = {};
    for (const [id, val] of Object.entries(done || {})) {
      if (ids.has(id)) next[id] = val;
    }
    return next;
  }

  function emptyStateExtras() {
    return {
      errors: [],
      simScores: {},
      iaveDone: {},
      customSubjects: [],
      subjectColors: {},
      iaveCustom: [],
      iaveOverrides: {},
      personalCategories: DEFAULT_PERSONAL_CATEGORIES.map((c) => ({ ...c })),
    };
  }

  function normalizePersonalCategories(list) {
    if (Array.isArray(list) && list.length) {
      return list
        .filter((c) => c && c.id && c.label)
        .map((c) => ({
          id: String(c.id),
          label: String(c.label).slice(0, 40),
          color: c.color || SUBJECT_COLORS[0],
        }));
    }
    return DEFAULT_PERSONAL_CATEGORIES.map((c) => ({ ...c }));
  }

  function stripDescansoFromPlan(tasksByDate) {
    for (const iso of Object.keys(tasksByDate || {})) {
      tasksByDate[iso] = (tasksByDate[iso] || []).filter(
        (t) => t.discipline !== "DESC" && t.type !== "descanso",
      );
      if (!tasksByDate[iso].length) delete tasksByDate[iso];
    }
    return tasksByDate;
  }

  /** Remove Auto da Barca (não é AE do secundário) de planos já guardados. */
  function stripBarcaFromPlan(tasksByDate) {
    for (const iso of Object.keys(tasksByDate || {})) {
      tasksByDate[iso] = (tasksByDate[iso] || []).filter(
        (t) => !/auto da barca/i.test(t.title || "") && !/barca do inferno/i.test(t.title || ""),
      );
      if (!tasksByDate[iso].length) delete tasksByDate[iso];
    }
    return tasksByDate;
  }

  function hydrateFromParsed(parsed, notice = null) {
    const tasksByDate =
      parsed.tasksByDate && Object.keys(parsed.tasksByDate).length
        ? stripBarcaFromPlan(stripDescansoFromPlan(parsed.tasksByDate))
        : buildDefaultTasks();
    return {
      tasksByDate,
      done: parsed.done || {},
      planVersion: parsed.planVersion || CURRENT_PLAN_VERSION,
      recoveredFromV1: true,
      notice,
      errors: parsed.errors || [],
      simScores: parsed.simScores || {},
      iaveDone: parsed.iaveDone || {},
      customSubjects: parsed.customSubjects || [],
      subjectColors: parsed.subjectColors || {},
      iaveCustom: parsed.iaveCustom || [],
      iaveOverrides: parsed.iaveOverrides || {},
      personalCategories: normalizePersonalCategories(parsed.personalCategories),
    };
  }

  function loadState() {
    try {
      // Sempre o estado actual. PREV / v1 NUNCA entram sozinhos no load
      // (isso fazia reaparecer tarefas já apagadas). PREV só via «Desfazer save».
      const current = readStoredPlan(STORAGE_KEY);
      if (current?.tasksByDate && Object.keys(current.tasksByDate).length) {
        return hydrateFromParsed(current);
      }
      const legacy = readStoredPlan("cronograma-exames-v1");
      if (legacy?.tasksByDate && Object.keys(legacy.tasksByDate).length) {
        return hydrateFromParsed(legacy);
      }
      return {
        tasksByDate: buildDefaultTasks(),
        done: {},
        planVersion: CURRENT_PLAN_VERSION,
        recoveredFromV1: true,
        ...emptyStateExtras(),
      };
    } catch {
      return {
        tasksByDate: buildDefaultTasks(),
        done: {},
        planVersion: CURRENT_PLAN_VERSION,
        recoveredFromV1: true,
        ...emptyStateExtras(),
      };
    }
  }

  function serializeState() {
    return JSON.stringify({
      tasksByDate: state.tasksByDate,
      done: state.done,
      planVersion: state.planVersion || CURRENT_PLAN_VERSION,
      recoveredFromV1: true,
      errors: state.errors,
      simScores: state.simScores,
      iaveDone: state.iaveDone,
      customSubjects: state.customSubjects || [],
      subjectColors: state.subjectColors || {},
      iaveCustom: state.iaveCustom || [],
      iaveOverrides: state.iaveOverrides || {},
      personalCategories: state.personalCategories || [],
    });
  }

  let saveStatusTimer = null;

  function flashSaved() {
    const el = document.getElementById("save-status");
    if (!el) return;
    el.textContent = "Guardado ✓";
    el.classList.add("flash");
    clearTimeout(saveStatusTimer);
    saveStatusTimer = setTimeout(() => {
      el.textContent = "Guarda sozinho neste browser";
      el.classList.remove("flash");
    }, 1600);
  }

  function saveState() {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (existing) {
        const incoming = serializeState();
        // Só arquiva se o estado actual for diferente (evita sobrescrever o "bom" com o "mau" duas vezes)
        if (existing !== incoming) {
          localStorage.setItem(STORAGE_PREV_KEY, existing);
        }
      }
    } catch {
      /* ignore quota */
    }
    try {
      localStorage.setItem(STORAGE_KEY, serializeState());
      flashSaved();
    } catch (err) {
      console.error(err);
      const el = document.getElementById("save-status");
      if (el) {
        el.textContent = "Erro ao guardar — espaço do browser cheio?";
        el.classList.remove("flash");
      }
      alert("Não foi possível guardar. O browser pode ter o armazenamento bloqueado ou cheio.");
    }
  }

  function resetToPlan() {
    if (
      !confirm(
        "Repor o plano oficial de estudo? Mantém as tarefas que tu adicionaste (pessoais e estudo), Caderno de Erros, notas e IAVE.",
      )
    ) {
      return;
    }
    state.tasksByDate = mergePlanKeepingUserTasks(state.tasksByDate);
    state.done = pruneDoneToExisting(state.tasksByDate, state.done);
    state.planVersion = CURRENT_PLAN_VERSION;
    saveState();
    renderAll();
    if (selectedDate) openDay(selectedDate);
  }

  function restorePreviousSave() {
    const prev = readStoredPlan(STORAGE_PREV_KEY);
    if (!prev?.tasksByDate) {
      alert("Não há cópia anterior guardada neste browser.");
      return;
    }
    if (
      !confirm(
        `Restaurar a cópia anterior?\n\n${countAllTasks(prev.tasksByDate)} tarefas · ${(prev.customSubjects || []).length} matérias extra`,
      )
    ) {
      return;
    }
    const stats = applyBackupData(prev);
    alert(`Cópia anterior restaurada: ${stats.total} tarefas, ${stats.customs} matérias extra.`);
  }

  function isPersonal(task) {
    return task?.scope === "personal";
  }

  function personalCategories() {
    return state.personalCategories || [];
  }

  function findPersonalCategory(id) {
    return personalCategories().find((c) => c.id === id);
  }

  function personalCategoryLabel(cat) {
    return findPersonalCategory(cat)?.label || cat || "Pessoal";
  }

  function personalCategoryColor(cat) {
    return findPersonalCategory(cat)?.color || "#c9a0dc";
  }

  function defaultPersonalCategoryId() {
    return personalCategories()[0]?.id || "eventos";
  }

  function taskChipColor(task) {
    if (isPersonal(task)) return personalCategoryColor(task.category);
    return disciplineColor(task.discipline);
  }

  function shortLabel(task) {
    if (isPersonal(task)) {
      return `${personalCategoryLabel(task.category)}: ${task.title}`;
    }
    const prefix = BUILTIN_IDS.includes(task.discipline)
      ? task.discipline
      : disciplineLabel(task.discipline);
    return `${prefix}: ${task.title}`;
  }

  function tasksFor(iso) {
    return (state.tasksByDate[iso] || []).filter((t) => {
      const personal = isPersonal(t);
      if (scopeFilter === "study" && personal) return false;
      if (scopeFilter === "personal" && !personal) return false;
      if (personal) {
        if (personalCatFilter !== "ALL" && (t.category || "eventos") !== personalCatFilter) {
          return false;
        }
        return true;
      }
      return discFilter.has(t.discipline);
    });
  }

  function passFilter(task) {
    return taskMatchesFilters(task);
  }

  function taskMatchesFilters(task) {
    const personal = isPersonal(task);
    if (scopeFilter === "study" && personal) return false;
    if (scopeFilter === "personal" && !personal) return false;
    if (personal) {
      return personalCatFilter === "ALL" || (task.category || "eventos") === personalCatFilter;
    }
    return discFilter.has(task.discipline);
  }

  function allTasksFor(iso) {
    return state.tasksByDate[iso] || [];
  }

  function weekInfoFor(iso) {
    const start = parseISO(DATA.week1Start);
    const d = parseISO(iso);
    const diff = Math.floor((d - start) / 86400000);
    if (diff < 0) return { week: null, phase: "Preparação (1–4 out)" };
    const week = Math.floor(diff / 7) + 1;
    if (week > 32) return { week: null, phase: "" };
    const meta = DATA.weeks.find((w) => w.week === week);
    return { week, phase: meta ? meta.phase : `Semana ${week}` };
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function escapeAttr(str) {
    return escapeHtml(str).replaceAll("'", "&#39;");
  }

  function findDateOfTask(id) {
    for (const [iso, list] of Object.entries(state.tasksByDate)) {
      if (list.some((t) => t.id === id)) return iso;
    }
    return null;
  }

  function findTask(id) {
    for (const list of Object.values(state.tasksByDate)) {
      const found = list.find((t) => t.id === id);
      if (found) return found;
    }
    return null;
  }

  function removeTask(id) {
    for (const iso of Object.keys(state.tasksByDate)) {
      state.tasksByDate[iso] = state.tasksByDate[iso].filter((t) => t.id !== id);
      if (state.tasksByDate[iso].length === 0) delete state.tasksByDate[iso];
    }
    delete state.done[id];
  }

  function moveTask(taskId, toDate) {
    const from = findDateOfTask(taskId);
    if (!from || from === toDate) return;
    const task = (state.tasksByDate[from] || []).find((t) => t.id === taskId);
    if (!task) return;
    state.tasksByDate[from] = state.tasksByDate[from].filter((t) => t.id !== taskId);
    if (state.tasksByDate[from].length === 0) delete state.tasksByDate[from];
    if (!state.tasksByDate[toDate]) state.tasksByDate[toDate] = [];
    state.tasksByDate[toDate].push(task);
    saveState();
  }

  function reorderTask(taskId, direction) {
    const iso = findDateOfTask(taskId);
    if (!iso) return false;
    const list = state.tasksByDate[iso];
    if (!list) return false;
    const idx = list.findIndex((t) => t.id === taskId);
    const newIdx = idx + direction;
    if (idx < 0 || newIdx < 0 || newIdx >= list.length) return false;
    const [item] = list.splice(idx, 1);
    list.splice(newIdx, 0, item);
    saveState();
    return true;
  }

  function reorderTaskBefore(taskId, beforeTaskId) {
    const iso = findDateOfTask(taskId);
    const iso2 = findDateOfTask(beforeTaskId);
    if (!iso || iso !== iso2 || taskId === beforeTaskId) return false;
    const list = state.tasksByDate[iso];
    const fromIdx = list.findIndex((t) => t.id === taskId);
    let toIdx = list.findIndex((t) => t.id === beforeTaskId);
    if (fromIdx < 0 || toIdx < 0) return false;
    const [item] = list.splice(fromIdx, 1);
    if (fromIdx < toIdx) toIdx -= 1;
    list.splice(toIdx, 0, item);
    saveState();
    return true;
  }

  function passFilter(task) {
    return taskMatchesFilters(task);
  }

  /* ——— Legend / filters ——— */
  function updateScopeUi() {
    const personalOnly = scopeFilter === "personal";
    document.querySelectorAll(".study-tab").forEach((el) => {
      el.classList.toggle("hidden", personalOnly);
    });
    if (els.legendRow) {
      els.legendRow.classList.toggle("hidden", personalOnly || activeTab !== "calendar");
    }
    document.getElementById("btn-manage-subjects")?.classList.toggle(
      "hidden",
      personalOnly || activeTab !== "calendar",
    );
    if (personalOnly && ["errors", "sims", "iave"].includes(activeTab)) {
      switchTab("calendar");
    }
  }

  function renderScopeFilters() {
    if (!els.scopeFilters) return;
    els.scopeFilters.innerHTML = "";
    const options = [
      { id: "study", label: "Estudos" },
      { id: "personal", label: "Pessoal" },
      { id: "both", label: "Ambos" },
    ];
    for (const opt of options) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `legend-chip filter-chip scope-chip${scopeFilter === opt.id ? " active" : ""}`;
      btn.textContent = opt.label;
      btn.addEventListener("click", () => {
        scopeFilter = opt.id;
        updateScopeUi();
        renderAll();
        if (selectedDate) openDay(selectedDate);
      });
      els.scopeFilters.appendChild(btn);
    }
  }

  function renderLegend() {
    renderScopeFilters();
    updateScopeUi();
    const ids = allDisciplineIds();
    els.legend.innerHTML = "";
    if (scopeFilter === "personal") return;

    const allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.className = `legend-chip filter-chip${discFilter.size === ids.length ? " active" : ""}`;
    allBtn.textContent = "Todas";
    allBtn.addEventListener("click", () => {
      discFilter = new Set(allDisciplineIds());
      renderAll();
      if (selectedDate) openDay(selectedDate);
    });
    els.legend.appendChild(allBtn);

    for (const d of ids) {
      const chip = document.createElement("button");
      chip.type = "button";
      const on = discFilter.has(d);
      chip.className = `legend-chip filter-chip${on ? " active" : " dim"}`;
      const style = discInlineStyle(d);
      chip.innerHTML = `<span class="legend-dot ${discClass(d)}" style="${style}"></span>${escapeHtml(disciplineLabel(d))}`;
      chip.addEventListener("click", () => {
        const all = allDisciplineIds();
        if (discFilter.size === all.length) {
          discFilter = new Set([d]);
        } else if (discFilter.has(d)) {
          discFilter.delete(d);
          if (discFilter.size === 0) discFilter = new Set(all);
        } else {
          discFilter.add(d);
        }
        renderAll();
        if (selectedDate) openDay(selectedDate);
      });
      els.legend.appendChild(chip);
    }

    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "btn ghost small";
    reset.textContent = "Repor plano original";
    reset.addEventListener("click", resetToPlan);
    els.legend.appendChild(reset);
  }

  /* ——— Calendar render ——— */
  function updateNavLabel() {
    if (viewMode === "month") {
      els.monthLabel.textContent = `${MONTHS[viewMonth]} ${viewYear}`;
    } else {
      const start = startOfWeek(weekAnchor);
      const end = addDays(start, 6);
      els.monthLabel.textContent = `${start.getDate()}–${end.getDate()} ${MONTHS[end.getMonth()]} ${end.getFullYear()}`;
    }
  }

  function bindDropTarget(cell, iso) {
    cell.addEventListener("dragover", (e) => {
      e.preventDefault();
      cell.classList.add("drop-target");
    });
    cell.addEventListener("dragleave", () => cell.classList.remove("drop-target"));
    cell.addEventListener("drop", (e) => {
      e.preventDefault();
      cell.classList.remove("drop-target");
      const id = e.dataTransfer.getData("text/task-id") || dragTaskId;
      if (!id) return;
      moveTask(id, iso);
      openDay(iso);
      renderCalendar();
    });
  }

  function makeChipEl(task) {
    const done = !!state.done[task.id];
    const el = document.createElement("div");
    el.className = `chip ${isPersonal(task) ? "chip-custom" : discClass(task.discipline)}${done ? " done" : ""}`;
    el.style.background = taskChipColor(task);
    el.draggable = true;
    el.title = `${task.title}${task.difficulty ? ` · ${DIFFICULTY_LABELS[task.difficulty]}` : ""} (arrasta para outro dia)`;
    el.textContent = shortLabel(task);
    if (task.difficulty === "dificil") el.classList.add("chip-hard");
    if (task.difficulty === "facil") el.classList.add("chip-easy");
    el.addEventListener("dragstart", (e) => {
      dragTaskId = task.id;
      e.dataTransfer.setData("text/task-id", task.id);
      e.dataTransfer.effectAllowed = "move";
      el.classList.add("dragging");
      e.stopPropagation();
    });
    el.addEventListener("dragend", () => {
      dragTaskId = null;
      el.classList.remove("dragging");
    });
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      openDay(findDateOfTask(task.id));
    });
    return el;
  }

  function renderMonthGrid() {
    els.grid.className = "calendar-grid";
    els.grid.innerHTML = "";
    const first = new Date(viewYear, viewMonth, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const gridStart = addDays(first, -startOffset);

    for (let i = 0; i < 42; i++) {
      const date = addDays(gridStart, i);
      const iso = toISO(date);
      const outside = date.getMonth() !== viewMonth;
      const cell = document.createElement("article");
      cell.className = "day-cell";
      if (outside) cell.classList.add("outside");
      if (iso === toISO(new Date())) cell.classList.add("today");
      if (iso === selectedDate) cell.classList.add("selected");
      cell.dataset.date = iso;

      const num = document.createElement("div");
      num.className = "day-num";
      num.textContent = String(date.getDate());
      cell.appendChild(num);

      const chipsWrap = document.createElement("div");
      chipsWrap.className = "day-chips";
      const tasks = tasksFor(iso);
      const visible = tasks.slice(0, viewMode === "week" ? 8 : 3);
      visible.forEach((t) => chipsWrap.appendChild(makeChipEl(t)));
      if (tasks.length > visible.length) {
        const more = document.createElement("div");
        more.className = "chip-more";
        more.textContent = `+${tasks.length - visible.length}`;
        chipsWrap.appendChild(more);
      }
      cell.appendChild(chipsWrap);
      cell.addEventListener("click", () => openDay(iso));
      bindDropTarget(cell, iso);
      els.grid.appendChild(cell);
    }
  }

  function renderWeekGrid() {
    els.grid.className = "calendar-grid week-grid";
    els.grid.innerHTML = "";
    const start = startOfWeek(weekAnchor);
    viewYear = start.getFullYear();
    viewMonth = start.getMonth();

    for (let i = 0; i < 7; i++) {
      const date = addDays(start, i);
      const iso = toISO(date);
      const cell = document.createElement("article");
      cell.className = "day-cell week-cell";
      if (iso === toISO(new Date())) cell.classList.add("today");
      if (iso === selectedDate) cell.classList.add("selected");
      cell.dataset.date = iso;

      const num = document.createElement("div");
      num.className = "day-num";
      num.textContent = `${WEEKDAYS[i]} ${date.getDate()}`;
      cell.appendChild(num);

      const chipsWrap = document.createElement("div");
      chipsWrap.className = "day-chips";
      tasksFor(iso).forEach((t) => chipsWrap.appendChild(makeChipEl(t)));
      cell.appendChild(chipsWrap);
      cell.addEventListener("click", () => openDay(iso));
      bindDropTarget(cell, iso);
      els.grid.appendChild(cell);
    }
  }

  function renderCalendar() {
    updateNavLabel();
    els.weekdayHead.innerHTML = WEEKDAYS.map((w) => `<span>${w}</span>`).join("");
    els.weekdayHead.classList.toggle("hidden", viewMode === "week");
    if (viewMode === "month") renderMonthGrid();
    else renderWeekGrid();
  }

  /* ——— Day panel ——— */
  function openDay(iso) {
    if (!iso) return;
    selectedDate = iso;
    if (viewMode === "week") weekAnchor = parseISO(iso);
    const info = weekInfoFor(iso);
    const d = parseISO(iso);
    els.sideEmpty.classList.add("hidden");
    els.sideContent.classList.remove("hidden");
    els.sideWeek.textContent = info.week
      ? `Semana ${info.week} · ${info.phase}`
      : info.phase || "Fora do plano";
    els.sideDate.textContent = d.toLocaleDateString("pt-PT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const tasks = tasksFor(iso);
    const all = allTasksFor(iso).filter(passFilter);
    const doneCount = all.filter((t) => state.done[t.id]).length;
    els.sideProgress.textContent = all.length ? `${doneCount}/${all.length} feitas` : "";

    els.taskList.innerHTML = "";
    if (tasks.length === 0) {
      els.taskList.innerHTML = `<li class="task-card"><p>Sem tarefas neste filtro. Adiciona com “+ Tarefa” ou muda o filtro.</p></li>`;
    } else {
      for (const task of tasks) els.taskList.appendChild(renderTaskCard(task));
    }
    renderCalendar();
  }

  function renderTaskCard(task) {
    const li = document.createElement("li");
    const done = !!state.done[task.id];
    const iso = findDateOfTask(task.id);
    const fullList = iso ? allTasksFor(iso) : [];
    const idx = fullList.findIndex((t) => t.id === task.id);
    li.className = `task-card${done ? " done" : ""}`;
    li.dataset.taskId = task.id;
    li.draggable = true;
    li.addEventListener("dragstart", (e) => {
      dragTaskId = task.id;
      e.dataTransfer.setData("text/task-id", task.id);
      e.dataTransfer.effectAllowed = "move";
      li.classList.add("dragging");
    });
    li.addEventListener("dragend", () => {
      dragTaskId = null;
      li.classList.remove("dragging");
    });
    li.addEventListener("dragover", (e) => {
      e.preventDefault();
      li.classList.add("drop-before");
    });
    li.addEventListener("dragleave", () => li.classList.remove("drop-before"));
    li.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      li.classList.remove("drop-before");
      const id = e.dataTransfer.getData("text/task-id") || dragTaskId;
      if (!id || id === task.id) return;
      const fromDate = findDateOfTask(id);
      const toDate = findDateOfTask(task.id);
      if (fromDate && toDate && fromDate === toDate) {
        reorderTaskBefore(id, task.id);
      } else if (toDate) {
        moveTask(id, toDate);
        reorderTaskBefore(id, task.id);
      }
      openDay(toDate || selectedDate);
      renderCalendar();
    });

    li.innerHTML = `
      <div class="task-card-top">
        <div class="reorder-btns">
          <button type="button" class="icon-btn reorder-btn" data-up aria-label="Subir" ${idx <= 0 ? "disabled" : ""}>↑</button>
          <button type="button" class="icon-btn reorder-btn" data-down aria-label="Descer" ${idx < 0 || idx >= fullList.length - 1 ? "disabled" : ""}>↓</button>
        </div>
        <input type="checkbox" ${done ? "checked" : ""} aria-label="Marcar como feita" />
        <div>
          <h4>${escapeHtml(task.title)}</h4>
          <div class="task-meta">
            ${
              isPersonal(task)
                ? `<span class="tag chip-custom" style="color:#1c1917;background:${personalCategoryColor(task.category)}">${escapeHtml(personalCategoryLabel(task.category))}</span>
                   <span class="tag type">Pessoal</span>`
                : `<span class="tag ${discClass(task.discipline)}" style="color:#1c1917;${discInlineStyle(task.discipline)}">${escapeHtml(disciplineLabel(task.discipline))}</span>
                   <span class="tag type">${escapeHtml(DATA.typeLabels[task.type] || task.type)}</span>
                   ${task.difficulty ? `<span class="tag diff-${task.difficulty}">${escapeHtml(DIFFICULTY_LABELS[task.difficulty] || task.difficulty)}</span>` : ""}`
            }
            ${task.duration ? `<span class="duration">${escapeHtml(task.duration)}</span>` : ""}
          </div>
          ${task.detail ? `<p>${escapeHtml(task.detail)}</p>` : ""}
          <div class="task-actions">
            <button type="button" class="btn ghost small" data-edit>Editar</button>
            ${isPersonal(task) ? "" : `<button type="button" class="btn ghost small" data-error>Registar erro</button>`}
          </div>
        </div>
      </div>
    `;
    li.querySelector('input[type="checkbox"]').addEventListener("change", (e) => {
      if (e.target.checked) state.done[task.id] = true;
      else delete state.done[task.id];
      saveState();
      openDay(selectedDate);
    });
    li.querySelector("[data-edit]").addEventListener("click", () => openModal(task));
    const errBtn = li.querySelector("[data-error]");
    if (errBtn) errBtn.addEventListener("click", () => openErrorModal(task));
    li.querySelector("[data-up]").addEventListener("click", (e) => {
      e.stopPropagation();
      if (reorderTask(task.id, -1)) {
        openDay(selectedDate);
        renderCalendar();
      }
    });
    li.querySelector("[data-down]").addEventListener("click", (e) => {
      e.stopPropagation();
      if (reorderTask(task.id, 1)) {
        openDay(selectedDate);
        renderCalendar();
      }
    });
    return li;
  }

  /* ——— Task modal ——— */
  function fillSelects() {
    const ids = allDisciplineIds();
    for (const form of [els.form, els.errorForm]) {
      const disc = form.elements.discipline;
      const current = disc.value;
      disc.innerHTML = ids.map(
        (d) => `<option value="${d}">${escapeHtml(disciplineLabel(d))}</option>`,
      ).join("");
      if (ids.includes(current)) disc.value = current;
    }
    els.form.elements.type.innerHTML = TYPES.map(
      (t) => `<option value="${t}">${DATA.typeLabels[t]}</option>`,
    ).join("");
    fillCategorySelect();
  }

  function fillCategorySelect(preferred) {
    const sel = els.form.elements.category;
    if (!sel) return;
    const cats = personalCategories();
    const current = preferred || sel.value;
    sel.innerHTML = cats
      .map((c) => `<option value="${escapeAttr(c.id)}">${escapeHtml(c.label)}</option>`)
      .join("");
    if (cats.some((c) => c.id === current)) sel.value = current;
    else if (cats.length) sel.value = cats[0].id;
  }

  function setModalScopeFields(scope) {
    const personal = scope === "personal";
    document.querySelectorAll(".study-only-fields").forEach((el) => {
      el.classList.toggle("hidden", personal);
    });
    document.querySelectorAll(".personal-only-fields").forEach((el) => {
      el.classList.toggle("hidden", !personal);
    });
    els.form.elements.scope.value = scope;
  }

  function openModal(task, forceScope) {
    editingTaskId = task ? task.id : null;
    const scope = task ? (isPersonal(task) ? "personal" : "study") : forceScope || modalScopeDefault;
    els.modalTitle.textContent = task
      ? scope === "personal"
        ? "Editar pessoal"
        : "Editar tarefa"
      : scope === "personal"
        ? "Nova tarefa pessoal"
        : "Nova tarefa de estudo";
    els.btnDelete.classList.toggle("hidden", !task);
    setModalScopeFields(scope);
    els.form.elements.title.value = task?.title || "";
    els.form.elements.detail.value = task?.detail || "";
    els.form.elements.discipline.value = task?.discipline || "FIS";
    els.form.elements.type.value = task?.type || "estudo";
    fillCategorySelect(task?.category || defaultPersonalCategoryId());
    els.form.elements.category.value = task?.category || defaultPersonalCategoryId();
    els.form.elements.date.value = task
      ? findDateOfTask(task.id) || selectedDate
      : selectedDate || toISO(new Date(viewYear, viewMonth, 1));
    els.form.elements.duration.value =
      task?.duration || (scope === "personal" ? "1h" : "1h30–2h");
    els.form.elements.difficulty.value = task?.difficulty || "";
    els.modal.showModal();
  }

  function saveTaskFromForm() {
    const title = els.form.elements.title.value.trim();
    if (!title) return;
    const date = els.form.elements.date.value;
    const scope = els.form.elements.scope.value === "personal" ? "personal" : "study";
    const payload =
      scope === "personal"
        ? {
            id: editingTaskId || uid("pers"),
            scope: "personal",
            title,
            detail: els.form.elements.detail.value.trim(),
            category: els.form.elements.category.value || defaultPersonalCategoryId(),
            duration: els.form.elements.duration.value.trim() || "—",
            discipline: "PES",
            type: "pessoal",
          }
        : {
            id: editingTaskId || uid("custom"),
            scope: "study",
            title,
            detail: els.form.elements.detail.value.trim(),
            discipline: els.form.elements.discipline.value,
            type: els.form.elements.type.value,
            duration: els.form.elements.duration.value.trim() || "—",
            difficulty: els.form.elements.difficulty.value || "",
          };
    if (editingTaskId) {
      const oldDate = findDateOfTask(editingTaskId);
      if (oldDate) {
        const existing = allTasksFor(oldDate).find((t) => t.id === editingTaskId);
        if (existing && scope === "study") {
          payload.week = existing.week;
          payload.phase = existing.phase;
        }
        removeTask(editingTaskId);
      }
    }
    if (!state.tasksByDate[date]) state.tasksByDate[date] = [];
    state.tasksByDate[date].push(payload);
    saveState();
    openDay(date);
    if (activeTab === "personal") renderPersonalPanel();
  }

  /* ——— Caderno de Erros ——— */
  function openErrorModal(task) {
    const f = els.errorForm;
    f.elements.discipline.value = task?.discipline || "FIS";
    f.elements.date.value = selectedDate || toISO(new Date());
    f.elements.topic.value = task?.title || "";
    f.elements.notes.value = "";
    f.elements.schedule.checked = true;
    f.dataset.taskId = task?.id || "";
    els.errorModal.showModal();
  }

  function saveErrorFromForm() {
    const f = els.errorForm;
    const topic = f.elements.topic.value.trim();
    if (!topic) return;
    const entry = {
      id: uid("err"),
      discipline: f.elements.discipline.value,
      date: f.elements.date.value,
      topic,
      notes: f.elements.notes.value.trim(),
      taskId: f.dataset.taskId || null,
      createdAt: new Date().toISOString(),
    };
    state.errors.unshift(entry);

    if (f.elements.schedule.checked) {
      const reinforceDate = toISO(addDays(parseISO(entry.date), 3));
      if (!state.tasksByDate[reinforceDate]) state.tasksByDate[reinforceDate] = [];
      state.tasksByDate[reinforceDate].push({
        id: uid("reinforce"),
        discipline: entry.discipline,
        type: "exercicios",
        title: `Reforço: ${entry.topic}`,
        detail: `Do Caderno de Erros (${entry.date}). ${entry.notes || ""}`.trim(),
        duration: "1h–1h30",
      });
    }
    saveState();
    renderErrors();
    renderCalendar();
  }

  function renderErrors() {
    if (els.errorFilters) {
      els.errorFilters.innerHTML = "";
      const keys = ["ALL", ...allDisciplineIds()];
      for (const key of keys) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `btn small${errorDiscFilter === key ? " primary" : " ghost"}`;
        btn.textContent = key === "ALL" ? "Todas" : disciplineLabel(key);
        btn.addEventListener("click", () => {
          errorDiscFilter = key;
          renderErrors();
        });
        els.errorFilters.appendChild(btn);
      }
    }

    const list = els.errorsList;
    list.innerHTML = "";
    const filtered = (state.errors || []).filter(
      (err) => errorDiscFilter === "ALL" || err.discipline === errorDiscFilter,
    );
    if (!state.errors.length) {
      list.innerHTML = `<div class="empty-hint">Ainda sem erros registados. No calendário, abre uma tarefa e clica “Registar erro”.</div>`;
      return;
    }
    if (!filtered.length) {
      list.innerHTML = `<div class="empty-hint">Nenhum erro nesta disciplina.</div>`;
      return;
    }
    for (const err of filtered) {
      const card = document.createElement("article");
      card.className = "tool-card";
      card.innerHTML = `
        <div class="tool-card-top">
          <span class="tag ${discClass(err.discipline)}" style="color:#1c1917;${discInlineStyle(err.discipline)}">${escapeHtml(disciplineLabel(err.discipline))}</span>
          <span class="duration">${escapeHtml(err.date)}</span>
        </div>
        <h3>${escapeHtml(err.topic)}</h3>
        ${err.notes ? `<p>${escapeHtml(err.notes)}</p>` : ""}
        <div class="task-actions">
          <button type="button" class="btn ghost small" data-goto>Ir ao dia</button>
          <button type="button" class="btn danger ghost small" data-del>Apagar</button>
        </div>
      `;
      card.querySelector("[data-goto]").addEventListener("click", () => {
        switchTab("calendar");
        const d = parseISO(err.date);
        viewYear = d.getFullYear();
        viewMonth = d.getMonth();
        weekAnchor = d;
        openDay(err.date);
      });
      card.querySelector("[data-del]").addEventListener("click", () => {
        if (!confirm("Apagar este registo?")) return;
        state.errors = state.errors.filter((e) => e.id !== err.id);
        saveState();
        renderErrors();
      });
      list.appendChild(card);
    }
  }

  /* ——— Simulacros ——— */
  function renderSims() {
    els.simsList.innerHTML = "";
    const bySubject = { FQ: [], MAT: [], PORT: [] };
    for (const slot of SIMS) {
      const score = state.simScores[slot.id];
      bySubject[slot.subject]?.push({ ...slot, score });

      const card = document.createElement("article");
      card.className = "tool-card";
      const pct = score != null && score !== "" ? Math.round((Number(score) / slot.max) * 100) : null;
      card.innerHTML = `
        <div class="tool-card-top">
          <span class="tag disc-${slot.subject === "FQ" ? "FQ" : slot.subject}" style="color:#1c1917">${escapeHtml(slot.subject)}</span>
          <span class="duration">Semana ${slot.week}</span>
        </div>
        <h3>${escapeHtml(slot.label)}</h3>
        <label class="score-label">Nota (0–${slot.max})
          <input type="number" min="0" max="${slot.max}" step="1" value="${score ?? ""}" data-sim="${slot.id}" />
        </label>
        ${pct != null ? `<p class="score-pct">${pct}%</p>` : `<p class="duration">Ainda sem nota</p>`}
      `;
      card.querySelector("input").addEventListener("change", (e) => {
        const v = e.target.value;
        if (v === "") delete state.simScores[slot.id];
        else state.simScores[slot.id] = Math.min(slot.max, Math.max(0, Number(v)));
        saveState();
        renderSims();
      });
      els.simsList.appendChild(card);
    }

    // summary comparison
    const rounds = [
      { key: "sim1", label: "Simulacro 1" },
      { key: "sim2", label: "Simulacro 2" },
      { key: "simf", label: "Final" },
    ];
    const subjects = ["FQ", "MAT", "PORT"];
    let html = `<div class="sims-table-wrap"><table class="sims-table"><thead><tr><th>Prova</th>${subjects.map((s) => `<th>${s}</th>`).join("")}</tr></thead><tbody>`;
    for (const r of rounds) {
      html += `<tr><td>${r.label}</td>`;
      for (const s of subjects) {
        const id = `${r.key}-${s.toLowerCase()}`;
        const sc = state.simScores[id];
        html += `<td>${sc != null ? sc : "—"}</td>`;
      }
      html += `</tr>`;
    }
    html += `</tbody></table></div>`;
    els.simsChart.innerHTML = html;
  }

  /* ——— IAVE ——— */
  function normalizeUrl(value) {
    const v = (value || "").trim();
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;
    return `https://${v}`;
  }

  function getAllIaveExams() {
    const builtins = IAVE.filter((e) => e.id !== "iave-hub").map((e) => {
      const ov = (state.iaveOverrides || {})[e.id] || {};
      return {
        ...e,
        label: ov.label ?? e.label,
        url: ov.url ?? e.url ?? "",
        correctionUrl: ov.correctionUrl ?? e.correctionUrl ?? "",
        year: ov.year ?? e.year,
        phase: ov.phase ?? e.phase,
        subject: ov.subject ?? e.subject,
        custom: false,
      };
    });
    const customs = (state.iaveCustom || []).map((e) => ({ ...e, custom: true }));
    return [...builtins, ...customs].sort((a, b) => {
      const ya = Number(b.year) || 0;
      const yb = Number(a.year) || 0;
      if (ya !== yb) return ya - yb;
      return String(a.label).localeCompare(String(b.label), "pt");
    });
  }

  function findIaveExam(id) {
    return getAllIaveExams().find((e) => e.id === id) || null;
  }

  function openIaveModal(exam) {
    editingIaveId = exam?.id || null;
    const f = els.iaveForm;
    els.iaveModalTitle.textContent = exam ? "Editar exame IAVE" : "Novo exame IAVE";
    els.btnDeleteIave.classList.toggle("hidden", !(exam && exam.custom));
    f.elements.label.value = exam?.label || "";
    f.elements.subject.value = exam?.subject || "MAT";
    f.elements.year.value = exam?.year ?? "";
    f.elements.phase.value = exam?.phase || "";
    f.elements.url.value = exam?.url || "";
    f.elements.correctionUrl.value = exam?.correctionUrl || "";
    els.iaveModal.showModal();
  }

  function saveIaveFromForm() {
    const f = els.iaveForm;
    const label = f.elements.label.value.trim();
    if (!label) return;
    const payload = {
      label,
      subject: f.elements.subject.value,
      year: f.elements.year.value ? Number(f.elements.year.value) : null,
      phase: f.elements.phase.value.trim(),
      url: normalizeUrl(f.elements.url.value),
      correctionUrl: normalizeUrl(f.elements.correctionUrl.value),
    };

    if (editingIaveId) {
      const existing = findIaveExam(editingIaveId);
      if (existing?.custom) {
        state.iaveCustom = (state.iaveCustom || []).map((e) =>
          e.id === editingIaveId ? { ...e, ...payload } : e,
        );
      } else {
        if (!state.iaveOverrides) state.iaveOverrides = {};
        state.iaveOverrides[editingIaveId] = {
          ...(state.iaveOverrides[editingIaveId] || {}),
          ...payload,
        };
      }
    } else {
      if (!state.iaveCustom) state.iaveCustom = [];
      state.iaveCustom.push({ id: uid("iave"), ...payload });
    }
    saveState();
    renderIave();
  }

  function deleteIaveExam() {
    if (!editingIaveId) return;
    const exam = findIaveExam(editingIaveId);
    if (!exam?.custom) return;
    if (!confirm(`Apagar “${exam.label}”?`)) return;
    state.iaveCustom = (state.iaveCustom || []).filter((e) => e.id !== editingIaveId);
    delete state.iaveDone[editingIaveId];
    saveState();
    els.iaveModal.close();
    renderIave();
  }

  function renderIave() {
    els.iaveFilters.innerHTML = "";
    for (const key of ["ALL", "FQ", "MAT", "PORT"]) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `btn small${iaveSubjectFilter === key ? " primary" : " ghost"}`;
      btn.textContent = key === "ALL" ? "Todas" : key;
      btn.addEventListener("click", () => {
        iaveSubjectFilter = key;
        renderIave();
      });
      els.iaveFilters.appendChild(btn);
    }

    const exams = getAllIaveExams().filter(
      (e) => iaveSubjectFilter === "ALL" || e.subject === iaveSubjectFilter,
    );
    const doneCount = exams.filter((e) => state.iaveDone[e.id]).length;
    els.iaveProgress.textContent = `${doneCount}/${exams.length} feitos`;

    els.iaveList.innerHTML = "";
    const hub = IAVE.find((e) => e.id === "iave-hub");
    if (hub) {
      const hubCard = document.createElement("article");
      hubCard.className = "tool-card";
      hubCard.innerHTML = `<h3>Portal IAVE</h3><p>Abre o site oficial para copiar o link do enunciado e da correção.</p><a class="btn primary small" href="${hub.url}" target="_blank" rel="noopener">Abrir iave.pt</a>`;
      els.iaveList.appendChild(hubCard);
    }

    for (const exam of exams) {
      const done = !!state.iaveDone[exam.id];
      const hasExam = !!exam.url;
      const hasCorr = !!exam.correctionUrl;
      const card = document.createElement("article");
      card.className = `tool-card${done ? " done-exam" : ""}`;
      card.innerHTML = `
        <div class="tool-card-top">
          <span class="tag disc-${exam.subject}" style="color:#1c1917">${exam.subject}</span>
          <span class="duration">${escapeHtml([exam.phase, exam.year].filter(Boolean).join(" · "))}</span>
        </div>
        <h3>${escapeHtml(exam.label)}</h3>
        ${!hasExam && !hasCorr ? `<p>Sem links — edita e cola o enunciado e a correção.</p>` : ""}
        <div class="task-actions">
          <label class="check-row tight">
            <input type="checkbox" ${done ? "checked" : ""} />
            Já resolvi
          </label>
          <button type="button" class="btn ghost small" data-edit>Editar / links</button>
        </div>
        <div class="iave-links">
          ${
            hasExam
              ? `<a class="btn primary small" href="${escapeAttr(exam.url)}" target="_blank" rel="noopener">Abrir exame</a>`
              : `<button type="button" class="btn ghost small" disabled>Sem link do exame</button>`
          }
          ${
            hasCorr
              ? `<a class="btn ghost small" href="${escapeAttr(exam.correctionUrl)}" target="_blank" rel="noopener">Abrir correção</a>`
              : `<button type="button" class="btn ghost small" disabled>Sem link da correção</button>`
          }
        </div>
      `;
      card.querySelector('input[type="checkbox"]').addEventListener("change", (e) => {
        if (e.target.checked) state.iaveDone[exam.id] = true;
        else delete state.iaveDone[exam.id];
        saveState();
        renderIave();
      });
      card.querySelector("[data-edit]").addEventListener("click", () => openIaveModal(exam));
      els.iaveList.appendChild(card);
    }
  }

  /* ——— Tabs / nav ——— */
  function renderSubjectSwatches() {
    els.colorSwatches.innerHTML = "";
    for (const color of SUBJECT_COLORS) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `color-swatch${selectedSubjectColor === color ? " selected" : ""}`;
      btn.style.background = color;
      btn.setAttribute("aria-label", color);
      btn.addEventListener("click", () => {
        selectedSubjectColor = color;
        els.subjectForm.elements.color.value = color;
        renderSubjectSwatches();
      });
      els.colorSwatches.appendChild(btn);
    }
    els.subjectForm.elements.color.value = selectedSubjectColor;
  }

  function renderSubjectList() {
    const list = els.subjectList;
    list.innerHTML = "";
    const ids = allDisciplineIds();

    for (const id of ids) {
      const isCustom = !BUILTIN_IDS.includes(id);
      const currentColor = disciplineColor(id);
      const row = document.createElement("div");
      row.className = "subject-row";

      const left = document.createElement("div");
      left.className = "subject-row-left";
      const dot = document.createElement("span");
      dot.className = "legend-dot";
      dot.style.background = currentColor;
      left.appendChild(dot);

      if (isCustom) {
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 40;
        input.value = disciplineLabel(id);
        input.title = "Renomear";
        input.addEventListener("change", () => {
          const next = input.value.trim();
          if (!next) {
            input.value = disciplineLabel(id);
            return;
          }
          const duplicate = (state.customSubjects || []).some(
            (s) => s.id !== id && s.label.toLowerCase() === next.toLowerCase(),
          );
          if (duplicate) {
            alert("Já existe uma matéria com esse nome.");
            input.value = disciplineLabel(id);
            return;
          }
          const custom = state.customSubjects.find((s) => s.id === id);
          if (custom) custom.label = next;
          saveState();
          fillSelects();
          renderAll();
        });
        left.appendChild(input);
      } else {
        const name = document.createElement("span");
        name.textContent = disciplineLabel(id);
        left.appendChild(name);
      }

      const colors = document.createElement("div");
      colors.className = "subject-row-colors";
      for (const color of SUBJECT_COLORS) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `color-swatch${currentColor === color ? " selected" : ""}`;
        btn.style.background = color;
        btn.title = "Alterar cor";
        btn.addEventListener("click", () => setDisciplineColor(id, color));
        colors.appendChild(btn);
      }

      const actions = document.createElement("div");
      actions.className = "subject-row-actions";
      if (isCustom) {
        const del = document.createElement("button");
        del.type = "button";
        del.className = "btn danger ghost small";
        del.textContent = "Apagar";
        del.addEventListener("click", () => {
          const used = Object.values(state.tasksByDate).some((tasks) =>
            tasks.some((t) => t.discipline === id),
          );
          const label = disciplineLabel(id);
          const msg = used
            ? `Apagar “${label}”? As tarefas existentes passam para Preparação.`
            : `Apagar “${label}”?`;
          if (!confirm(msg)) return;
          if (used) {
            for (const iso of Object.keys(state.tasksByDate)) {
              for (const t of state.tasksByDate[iso]) {
                if (t.discipline === id) t.discipline = "PREP";
              }
            }
          }
          state.customSubjects = state.customSubjects.filter((s) => s.id !== id);
          discFilter.delete(id);
          if (discFilter.size === 0) discFilter = new Set(allDisciplineIds());
          saveState();
          fillSelects();
          renderSubjectList();
          renderAll();
        });
        actions.appendChild(del);
      } else {
        const reset = document.createElement("button");
        reset.type = "button";
        reset.className = "btn ghost small";
        reset.textContent = "Cor original";
        reset.title = "Repor cor padrão";
        reset.addEventListener("click", () => {
          if (state.subjectColors) delete state.subjectColors[id];
          saveState();
          renderSubjectList();
          renderAll();
          if (selectedDate) openDay(selectedDate);
        });
        actions.appendChild(reset);
      }

      row.appendChild(left);
      row.appendChild(colors);
      row.appendChild(actions);
      list.appendChild(row);
    }
  }

  function openSubjectModal() {
    els.subjectForm.elements.label.value = "";
    selectedSubjectColor = SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)];
    renderSubjectSwatches();
    renderSubjectList();
    els.subjectModal.showModal();
  }

  function saveSubjectFromForm() {
    const label = els.subjectForm.elements.label.value.trim();
    if (!label) {
      alert("Escreve o nome da nova matéria.");
      return;
    }
    const color = els.subjectForm.elements.color.value || selectedSubjectColor;
    const exists = (state.customSubjects || []).some(
      (s) => s.label.toLowerCase() === label.toLowerCase(),
    );
    if (exists) {
      alert("Já existe uma matéria com esse nome.");
      return;
    }
    const id = uid("mat");
    if (!state.customSubjects) state.customSubjects = [];
    state.customSubjects.push({ id, label, color });
    discFilter.add(id);
    saveState();
    fillSelects();
    els.subjectForm.elements.label.value = "";
    renderSubjectList();
    renderAll();
  }

  function buildBackupPayload() {
    return {
      version: 2,
      exportedAt: new Date().toISOString(),
      data: {
        tasksByDate: state.tasksByDate,
        done: state.done,
        errors: state.errors,
        simScores: state.simScores,
        iaveDone: state.iaveDone,
        customSubjects: state.customSubjects || [],
        subjectColors: state.subjectColors || {},
        iaveCustom: state.iaveCustom || [],
        iaveOverrides: state.iaveOverrides || {},
        personalCategories: state.personalCategories || [],
        planVersion: state.planVersion || CURRENT_PLAN_VERSION,
        recoveredFromV1: true,
      },
    };
  }

  function countAllTasks(tasksByDate = state.tasksByDate) {
    let n = 0;
    for (const list of Object.values(tasksByDate || {})) n += (list || []).length;
    return n;
  }

  function countUserTasks(tasksByDate = state.tasksByDate) {
    let n = 0;
    for (const list of Object.values(tasksByDate || {})) {
      for (const t of list || []) if (isUserTask(t)) n += 1;
    }
    return n;
  }

  async function copyBackupToClipboard() {
    const payload = buildBackupPayload();
    const text = JSON.stringify(payload, null, 2);
    const total = countAllTasks(payload.data.tasksByDate);
    const customs = (payload.data.customSubjects || []).length;
    const doneN = Object.keys(payload.data.done || {}).length;
    try {
      await navigator.clipboard.writeText(text);
      alert(
        `Backup do estado actual copiado (${total} tarefas, ${customs} matérias extra, ${doneN} concluídas).\n\nSó precisas disto para mudar de telemóvel/PC — no dia-a-dia não é preciso.`,
      );
      return true;
    } catch {
      // fallback: prompt select-all
      prompt("Copia todo este texto (Ctrl+A, Ctrl+C) e no GitHub usa «Colar backup»:", text);
      return false;
    }
  }

  function exportBackup() {
    const payload = buildBackupPayload();
    const total = countAllTasks(payload.data.tasksByDate);
    const customs = (payload.data.customSubjects || []).length;
    const doneN = Object.keys(payload.data.done || {}).length;
    // file:// muitas vezes bloqueia o download — preferir clipboard
    if (location.protocol === "file:") {
      copyBackupToClipboard();
      return;
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    link.download = `cronograma-exames-backup-${stamp}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
    alert(
      `Backup do estado actual guardado (${total} tarefas, ${customs} matérias extra, ${doneN} concluídas).\n\nSó para migrar entre dispositivos — no dia-a-dia as tarefas já gravam sozinhas.`,
    );
  }

  function renderStorageBanner() {
    const box = els.storageBanner;
    if (!box) return;
    const dismissed = localStorage.getItem("cronograma-storage-tip") === "1";

    // Só avisa no file:// — no GitHub tudo grava sozinho, sem insistir em Backup.
    if (location.protocol !== "file:" || dismissed) {
      box.classList.add("hidden");
      box.innerHTML = "";
      return;
    }

    box.classList.remove("hidden");
    box.innerHTML = `
      <p><strong>Não uses este ficheiro local.</strong> Abre
      <a href="https://candeiassantiago393-spec.github.io/Cronograma-Exames/" target="_blank" rel="noopener">o link do GitHub</a>
      e trabalha só lá — as tarefas gravam sozinhas. Backup (menu Dados) só se mudares de telemóvel/PC.</p>
      <div class="banner-actions">
        <button type="button" class="btn ghost small" data-banner-dismiss>Entendi</button>
      </div>`;
    box.querySelector("[data-banner-dismiss]")?.addEventListener("click", () => {
      localStorage.setItem("cronograma-storage-tip", "1");
      box.classList.add("hidden");
    });
  }

  function applyBackupData(data) {
    // Restauração exacta — não substitui pelo plano oficial.
    const tasksByDate = stripBarcaFromPlan(
      stripDescansoFromPlan(JSON.parse(JSON.stringify(data.tasksByDate))),
    );
    const total = countAllTasks(tasksByDate);
    if (total === 0) {
      throw new Error("Backup sem tarefas");
    }
    state = {
      tasksByDate,
      done: data.done || {},
      planVersion: data.planVersion || CURRENT_PLAN_VERSION,
      recoveredFromV1: true,
      errors: data.errors || [],
      simScores: data.simScores || {},
      iaveDone: data.iaveDone || {},
      customSubjects: data.customSubjects || [],
      subjectColors: data.subjectColors || {},
      iaveCustom: data.iaveCustom || [],
      iaveOverrides: data.iaveOverrides || {},
      personalCategories: normalizePersonalCategories(data.personalCategories),
    };
    discFilter = new Set(allDisciplineIds());
    personalCatFilter = "ALL";
    localStorage.setItem("cronograma-storage-tip", "1");
    saveState();
    fillSelects();
    renderAll();
    if (selectedDate) openDay(selectedDate);
    return {
      total,
      customs: (state.customSubjects || []).length,
      doneN: Object.keys(state.done || {}).length,
    };
  }

  function importBackupFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const data = parsed.data || parsed;
        if (!data.tasksByDate || typeof data.tasksByDate !== "object") {
          throw new Error("Ficheiro inválido");
        }
        const previewTotal = countAllTasks(data.tasksByDate);
        const previewCustoms = (data.customSubjects || []).length;
        if (
          !confirm(
            `Restaurar este backup?\n\n${previewTotal} tarefas · ${previewCustoms} matérias extra\n\nSubstitui o calendário actual neste browser.`,
          )
        ) {
          return;
        }
        const stats = applyBackupData(data);
        alert(
          `Restaurado: ${stats.total} tarefas, ${stats.customs} matérias extra, ${stats.doneN} concluídas.\n\nUsa só este link daqui para a frente.`,
        );
      } catch (err) {
        console.error(err);
        alert(
          "Não foi possível restaurar. Confirma que escolheste o JSON do Backup feito na aba file:// (a que tem Mat-aulas / Biologia).",
        );
      }
    };
    reader.readAsText(file);
  }

  function openPasteRestore() {
    const raw = prompt(
      "Cola aqui o conteúdo completo do ficheiro de backup (JSON), se o Restaurar por ficheiro falhar:",
    );
    if (raw == null || !raw.trim()) return;
    try {
      const parsed = JSON.parse(raw.trim());
      const data = parsed.data || parsed;
      if (!data.tasksByDate) throw new Error("inválido");
      const previewTotal = countAllTasks(data.tasksByDate);
      if (
        !confirm(
          `Restaurar JSON colado?\n\n${previewTotal} tarefas · ${(data.customSubjects || []).length} matérias extra`,
        )
      ) {
        return;
      }
      const stats = applyBackupData(data);
      alert(`Restaurado: ${stats.total} tarefas, ${stats.customs} matérias extra.`);
    } catch (err) {
      console.error(err);
      alert("JSON inválido. Abre o .json no Bloco de notas, copia tudo e tenta de novo.");
    }
  }

  function renderCatSwatches() {
    if (!els.catColorSwatches || !els.categoryForm) return;
    els.catColorSwatches.innerHTML = "";
    for (const color of SUBJECT_COLORS) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `color-swatch${selectedCatColor === color ? " selected" : ""}`;
      btn.style.background = color;
      btn.setAttribute("aria-label", color);
      btn.addEventListener("click", () => {
        selectedCatColor = color;
        els.categoryForm.elements.color.value = color;
        renderCatSwatches();
      });
      els.catColorSwatches.appendChild(btn);
    }
    els.categoryForm.elements.color.value = selectedCatColor;
  }

  function setPersonalCategoryColor(id, color) {
    const cat = findPersonalCategory(id);
    if (!cat) return;
    cat.color = color;
    saveState();
    fillCategorySelect();
    renderCategoryList();
    renderAll();
    if (selectedDate) openDay(selectedDate);
  }

  function renderCategoryList() {
    if (!els.categoryList) return;
    els.categoryList.innerHTML = "";
    for (const cat of personalCategories()) {
      const row = document.createElement("div");
      row.className = "subject-row";

      const left = document.createElement("div");
      left.className = "subject-row-left";
      const dot = document.createElement("span");
      dot.className = "legend-dot";
      dot.style.background = cat.color;
      left.appendChild(dot);

      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 40;
      input.value = cat.label;
      input.title = "Renomear";
      input.addEventListener("change", () => {
        const next = input.value.trim();
        if (!next) {
          input.value = cat.label;
          return;
        }
        const duplicate = personalCategories().some(
          (c) => c.id !== cat.id && c.label.toLowerCase() === next.toLowerCase(),
        );
        if (duplicate) {
          alert("Já existe uma categoria com esse nome.");
          input.value = cat.label;
          return;
        }
        cat.label = next;
        saveState();
        fillCategorySelect();
        renderAll();
      });
      left.appendChild(input);

      const colors = document.createElement("div");
      colors.className = "subject-row-colors";
      for (const color of SUBJECT_COLORS) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `color-swatch${cat.color === color ? " selected" : ""}`;
        btn.style.background = color;
        btn.title = "Alterar cor";
        btn.addEventListener("click", () => setPersonalCategoryColor(cat.id, color));
        colors.appendChild(btn);
      }

      const actions = document.createElement("div");
      actions.className = "subject-row-actions";
      const del = document.createElement("button");
      del.type = "button";
      del.className = "btn danger ghost small";
      del.textContent = "Apagar";
      del.disabled = personalCategories().length <= 1;
      del.title = personalCategories().length <= 1 ? "Mantém pelo menos uma categoria" : "Apagar";
      del.addEventListener("click", () => {
        if (personalCategories().length <= 1) return;
        const used = Object.values(state.tasksByDate).some((tasks) =>
          tasks.some((t) => isPersonal(t) && t.category === cat.id),
        );
        const fallback = personalCategories().find((c) => c.id !== cat.id);
        const msg = used
          ? `Apagar “${cat.label}”? As tarefas passam para “${fallback.label}”.`
          : `Apagar “${cat.label}”?`;
        if (!confirm(msg)) return;
        if (used && fallback) {
          for (const iso of Object.keys(state.tasksByDate)) {
            for (const t of state.tasksByDate[iso]) {
              if (isPersonal(t) && t.category === cat.id) t.category = fallback.id;
            }
          }
        }
        state.personalCategories = personalCategories().filter((c) => c.id !== cat.id);
        if (personalCatFilter === cat.id) personalCatFilter = "ALL";
        saveState();
        fillCategorySelect();
        renderCategoryList();
        renderAll();
      });
      actions.appendChild(del);

      row.appendChild(left);
      row.appendChild(colors);
      row.appendChild(actions);
      els.categoryList.appendChild(row);
    }
  }

  function openCategoryModal() {
    if (!els.categoryModal) return;
    els.categoryForm.elements.label.value = "";
    selectedCatColor = SUBJECT_COLORS[Math.floor(Math.random() * SUBJECT_COLORS.length)];
    renderCatSwatches();
    renderCategoryList();
    els.categoryModal.showModal();
  }

  function saveCategoryFromForm() {
    const label = els.categoryForm.elements.label.value.trim();
    if (!label) {
      alert("Escreve o nome da nova categoria.");
      return;
    }
    const color = els.categoryForm.elements.color.value || selectedCatColor;
    const exists = personalCategories().some(
      (c) => c.label.toLowerCase() === label.toLowerCase(),
    );
    if (exists) {
      alert("Já existe uma categoria com esse nome.");
      return;
    }
    if (!state.personalCategories) state.personalCategories = [];
    state.personalCategories.push({ id: uid("cat"), label, color });
    saveState();
    fillCategorySelect();
    els.categoryForm.elements.label.value = "";
    renderCategoryList();
    renderAll();
  }

  function renderPersonalPanel() {
    if (!els.personalList) return;
    if (els.personalCatFilters) {
      els.personalCatFilters.innerHTML = "";
      const keys = ["ALL", ...personalCategories().map((c) => c.id)];
      for (const key of keys) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `btn small${personalCatFilter === key ? " primary" : " ghost"}`;
        btn.textContent = key === "ALL" ? "Todas" : personalCategoryLabel(key);
        btn.addEventListener("click", () => {
          personalCatFilter = key;
          renderPersonalPanel();
          renderCalendar();
          if (selectedDate) openDay(selectedDate);
        });
        els.personalCatFilters.appendChild(btn);
      }
    }

    const items = [];
    for (const [iso, list] of Object.entries(state.tasksByDate)) {
      for (const task of list) {
        if (!isPersonal(task)) continue;
        if (personalCatFilter !== "ALL" && (task.category || defaultPersonalCategoryId()) !== personalCatFilter) continue;
        items.push({ iso, task });
      }
    }
    items.sort((a, b) => a.iso.localeCompare(b.iso));

    els.personalList.innerHTML = "";
    if (!items.length) {
      els.personalList.innerHTML = `<div class="empty-hint">Ainda sem tarefas pessoais. Usa “+ Pessoal” no calendário ou aqui.</div>`;
      return;
    }
    for (const { iso, task } of items) {
      const done = !!state.done[task.id];
      const card = document.createElement("article");
      card.className = `tool-card${done ? " done-exam" : ""}`;
      card.innerHTML = `
        <div class="tool-card-top">
          <span class="tag chip-custom" style="color:#1c1917;background:${personalCategoryColor(task.category)}">${escapeHtml(personalCategoryLabel(task.category))}</span>
          <span class="duration">${escapeHtml(iso)}</span>
        </div>
        <h3>${escapeHtml(task.title)}</h3>
        ${task.detail ? `<p>${escapeHtml(task.detail)}</p>` : ""}
        <div class="task-actions">
          <button type="button" class="btn ghost small" data-goto>Ir ao dia</button>
          <button type="button" class="btn ghost small" data-edit>Editar</button>
        </div>
      `;
      card.querySelector("[data-goto]").addEventListener("click", () => {
        switchTab("calendar");
        const d = parseISO(iso);
        viewYear = d.getFullYear();
        viewMonth = d.getMonth();
        weekAnchor = d;
        openDay(iso);
      });
      card.querySelector("[data-edit]").addEventListener("click", () => openModal(task, "personal"));
      els.personalList.appendChild(card);
    }
  }

  function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll(".tab").forEach((b) => {
      b.classList.toggle("active", b.dataset.tab === tab);
    });
    document.getElementById("panel-calendar").classList.toggle("hidden", tab !== "calendar");
    document.getElementById("panel-personal")?.classList.toggle("hidden", tab !== "personal");
    document.getElementById("panel-errors").classList.toggle("hidden", tab !== "errors");
    document.getElementById("panel-sims").classList.toggle("hidden", tab !== "sims");
    document.getElementById("panel-iave").classList.toggle("hidden", tab !== "iave");
    const onCal = tab === "calendar";
    els.scopeFilters?.classList.toggle("hidden", !onCal && tab !== "personal");
    updateScopeUi();
    if (tab === "calendar") {
      els.legend.classList.toggle("hidden", scopeFilter === "personal");
      els.legendRow?.classList.toggle("hidden", scopeFilter === "personal");
    } else {
      els.legend.classList.add("hidden");
      els.legendRow?.classList.add("hidden");
    }
    if (tab === "personal") renderPersonalPanel();
    if (tab === "errors") renderErrors();
    if (tab === "sims") renderSims();
    if (tab === "iave") renderIave();
  }

  async function exportPng() {
    if (typeof html2canvas !== "function") {
      alert("Biblioteca de exportação não carregou.");
      return;
    }
    const btn = document.getElementById("btn-export");
    btn.disabled = true;
    btn.textContent = "A gerar…";
    try {
      const canvas = await html2canvas(els.exportRoot, {
        backgroundColor: "#fffcf7",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      const tag = viewMode === "week" ? "semana" : `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
      link.download = `cronograma-${tag}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error(err);
      alert("Não foi possível exportar.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Exportar (PNG)";
    }
  }

  function renderAll() {
    renderLegend();
    renderCalendar();
    renderStorageBanner();
    if (activeTab === "personal") renderPersonalPanel();
    if (activeTab === "errors") renderErrors();
    if (activeTab === "sims") renderSims();
    if (activeTab === "iave") renderIave();
  }

  function bind() {
    document.querySelectorAll(".tab").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });
    document.querySelectorAll(".view-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        viewMode = btn.dataset.view;
        document.querySelectorAll(".view-btn").forEach((b) => b.classList.toggle("active", b === btn));
        if (viewMode === "week" && selectedDate) weekAnchor = parseISO(selectedDate);
        renderCalendar();
      });
    });

    document.getElementById("btn-prev").addEventListener("click", () => {
      if (viewMode === "month") {
        viewMonth -= 1;
        if (viewMonth < 0) {
          viewMonth = 11;
          viewYear -= 1;
        }
      } else {
        weekAnchor = addDays(weekAnchor, -7);
      }
      renderCalendar();
    });
    document.getElementById("btn-next").addEventListener("click", () => {
      if (viewMode === "month") {
        viewMonth += 1;
        if (viewMonth > 11) {
          viewMonth = 0;
          viewYear += 1;
        }
      } else {
        weekAnchor = addDays(weekAnchor, 7);
      }
      renderCalendar();
    });
    document.getElementById("btn-today").addEventListener("click", () => {
      const now = new Date();
      viewYear = now.getFullYear();
      viewMonth = now.getMonth();
      weekAnchor = now;
      switchTab("calendar");
      openDay(toISO(now));
    });
    document.getElementById("btn-export").addEventListener("click", exportPng);
    document.getElementById("btn-backup").addEventListener("click", exportBackup);
    document.getElementById("btn-restore").addEventListener("click", () => {
      document.getElementById("restore-file").click();
    });
    document.getElementById("btn-paste-restore")?.addEventListener("click", openPasteRestore);
    document.getElementById("btn-undo-save")?.addEventListener("click", restorePreviousSave);
    document.getElementById("restore-file").addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      importBackupFile(file);
      e.target.value = "";
    });
    document.getElementById("btn-close-panel").addEventListener("click", () => {
      selectedDate = null;
      els.sideContent.classList.add("hidden");
      els.sideEmpty.classList.remove("hidden");
      renderCalendar();
    });
    document.getElementById("btn-add-task").addEventListener("click", () => {
      modalScopeDefault = "study";
      openModal(null, "study");
    });
    document.getElementById("btn-add-personal")?.addEventListener("click", () => {
      modalScopeDefault = "personal";
      openModal(null, "personal");
    });
    document.getElementById("btn-add-personal-tab")?.addEventListener("click", () => {
      modalScopeDefault = "personal";
      openModal(null, "personal");
    });
    document.getElementById("btn-manage-categories")?.addEventListener("click", openCategoryModal);
    document.getElementById("btn-add-error").addEventListener("click", () => openErrorModal(null));
    document.getElementById("btn-manage-subjects").addEventListener("click", openSubjectModal);
    document.getElementById("btn-add-iave").addEventListener("click", () => openIaveModal(null));
    els.btnDeleteIave.addEventListener("click", deleteIaveExam);

    els.btnDelete.addEventListener("click", () => {
      if (!editingTaskId) return;
      if (!confirm("Apagar esta tarefa?")) return;
      removeTask(editingTaskId);
      saveState();
      els.modal.close();
      openDay(selectedDate);
    });
    els.form.addEventListener("submit", (e) => {
      if (e.submitter && e.submitter.value === "cancel") return;
      e.preventDefault();
      saveTaskFromForm();
      els.modal.close();
    });
    els.errorForm.addEventListener("submit", (e) => {
      if (e.submitter && e.submitter.value === "cancel") return;
      e.preventDefault();
      saveErrorFromForm();
      els.errorModal.close();
    });
    els.subjectForm.addEventListener("submit", (e) => {
      if (e.submitter && e.submitter.value === "cancel") return;
      e.preventDefault();
      saveSubjectFromForm();
    });
    els.categoryForm?.addEventListener("submit", (e) => {
      if (e.submitter && e.submitter.value === "cancel") return;
      e.preventDefault();
      saveCategoryFromForm();
    });
    els.iaveForm.addEventListener("submit", (e) => {
      if (e.submitter && e.submitter.value === "cancel") return;
      e.preventDefault();
      saveIaveFromForm();
      els.iaveModal.close();
    });
  }

  // init — não grava no load; não recupera PREV automaticamente.
  delete state.notice;
  fillSelects();
  document.querySelectorAll(".view-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.view === viewMode);
  });
  bind();
  renderAll();
})();
