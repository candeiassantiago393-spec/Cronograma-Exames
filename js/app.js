(() => {
  const DATA = window.CRONOGRAMA_DATA;
  const STORAGE_KEY = "cronograma-exames-v1";
  const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const MONTHS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];

  const DISCIPLINES = Object.keys(DATA.disciplineLabels);
  const TYPES = Object.keys(DATA.typeLabels);

  /** @type {{ tasksByDate: Record<string, any[]>, done: Record<string, boolean> }} */
  let state = loadState();
  let viewYear = 2026;
  let viewMonth = 9; // October
  let selectedDate = null;
  let editingTaskId = null;

  const els = {
    monthLabel: document.getElementById("month-label"),
    weekdayHead: document.getElementById("weekday-head"),
    grid: document.getElementById("calendar-grid"),
    legend: document.getElementById("legend"),
    sideEmpty: document.getElementById("side-empty"),
    sideContent: document.getElementById("side-content"),
    sideWeek: document.getElementById("side-week"),
    sideDate: document.getElementById("side-date"),
    taskList: document.getElementById("task-list"),
    modal: document.getElementById("task-modal"),
    form: document.getElementById("task-form"),
    modalTitle: document.getElementById("modal-title"),
    btnDelete: document.getElementById("btn-delete-task"),
    exportRoot: document.getElementById("calendar-export-root"),
  };

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

  function uid(prefix = "t") {
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
  }

  function buildDefaultTasks() {
    /** @type {Record<string, any[]>} */
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

  function loadState() {
    const defaults = { tasksByDate: null, done: {} };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { tasksByDate: buildDefaultTasks(), done: {} };
      const parsed = JSON.parse(raw);
      if (!parsed.tasksByDate || Object.keys(parsed.tasksByDate).length === 0) {
        return { tasksByDate: buildDefaultTasks(), done: parsed.done || {} };
      }
      return {
        tasksByDate: parsed.tasksByDate,
        done: parsed.done || {},
      };
    } catch {
      return { tasksByDate: buildDefaultTasks(), done: {} };
    }
  }

  function saveState() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ tasksByDate: state.tasksByDate, done: state.done }),
    );
  }

  function resetToPlan() {
    if (!confirm("Repor o plano original? Perdes edições e marcas de concluído.")) return;
    state = { tasksByDate: buildDefaultTasks(), done: {} };
    saveState();
    render();
    if (selectedDate) openDay(selectedDate);
  }

  function tasksFor(iso) {
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

  function renderLegend() {
    els.legend.innerHTML = "";
    for (const d of DISCIPLINES) {
      const chip = document.createElement("span");
      chip.className = "legend-chip";
      chip.innerHTML = `<span class="legend-dot disc-${d}"></span>${DATA.disciplineLabels[d]}`;
      els.legend.appendChild(chip);
    }
    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "btn ghost small";
    reset.textContent = "Repor plano original";
    reset.addEventListener("click", resetToPlan);
    els.legend.appendChild(reset);
  }

  function renderWeekdayHead() {
    els.weekdayHead.innerHTML = WEEKDAYS.map((w) => `<span>${w}</span>`).join("");
  }

  function renderCalendar() {
    els.monthLabel.textContent = `${MONTHS[viewMonth]} ${viewYear}`;
    els.grid.innerHTML = "";

    const first = new Date(viewYear, viewMonth, 1);
    const startOffset = (first.getDay() + 6) % 7; // Monday=0
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

      const tasks = tasksFor(iso);
      const visible = tasks.slice(0, 3);
      const more = tasks.length - visible.length;

      cell.innerHTML = `
        <div class="day-num">${date.getDate()}</div>
        <div class="day-chips">
          ${visible
            .map((task) => {
              const done = !!state.done[task.id];
              return `<div class="chip disc-${task.discipline}${done ? " done" : ""}" title="${escapeAttr(task.title)}">${escapeHtml(shortLabel(task))}</div>`;
            })
            .join("")}
          ${more > 0 ? `<div class="chip-more">+${more}</div>` : ""}
        </div>
      `;
      cell.addEventListener("click", () => openDay(iso));
      els.grid.appendChild(cell);
    }
  }

  function shortLabel(task) {
    return `${task.discipline}: ${task.title}`;
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

  function openDay(iso) {
    selectedDate = iso;
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
    els.taskList.innerHTML = "";
    if (tasks.length === 0) {
      els.taskList.innerHTML = `<li class="task-card"><p>Sem tarefas. Adiciona uma com “+ Tarefa”.</p></li>`;
    } else {
      for (const task of tasks) {
        els.taskList.appendChild(renderTaskCard(task));
      }
    }
    renderCalendar();
  }

  function renderTaskCard(task) {
    const li = document.createElement("li");
    const done = !!state.done[task.id];
    li.className = `task-card${done ? " done" : ""}`;
    li.innerHTML = `
      <div class="task-card-top">
        <input type="checkbox" ${done ? "checked" : ""} aria-label="Marcar como feita" />
        <div>
          <h4>${escapeHtml(task.title)}</h4>
          <div class="task-meta">
            <span class="tag disc-${task.discipline}" style="color:#fff">${escapeHtml(DATA.disciplineLabels[task.discipline] || task.discipline)}</span>
            <span class="tag type">${escapeHtml(DATA.typeLabels[task.type] || task.type)}</span>
            ${task.duration ? `<span class="duration">${escapeHtml(task.duration)}</span>` : ""}
          </div>
          ${task.detail ? `<p>${escapeHtml(task.detail)}</p>` : ""}
          <div class="task-actions">
            <button type="button" class="btn ghost small" data-edit>Editar</button>
          </div>
        </div>
      </div>
    `;
    li.querySelector('input[type="checkbox"]').addEventListener("change", (e) => {
      state.done[task.id] = e.target.checked;
      if (!e.target.checked) delete state.done[task.id];
      saveState();
      openDay(selectedDate);
    });
    li.querySelector("[data-edit]").addEventListener("click", () => openModal(task));
    return li;
  }

  function fillSelects() {
    const disc = els.form.elements.discipline;
    const type = els.form.elements.type;
    disc.innerHTML = DISCIPLINES.map(
      (d) => `<option value="${d}">${DATA.disciplineLabels[d]}</option>`,
    ).join("");
    type.innerHTML = TYPES.map(
      (t) => `<option value="${t}">${DATA.typeLabels[t]}</option>`,
    ).join("");
  }

  function openModal(task) {
    editingTaskId = task ? task.id : null;
    els.modalTitle.textContent = task ? "Editar tarefa" : "Nova tarefa";
    els.btnDelete.classList.toggle("hidden", !task);
    els.form.elements.title.value = task?.title || "";
    els.form.elements.detail.value = task?.detail || "";
    els.form.elements.discipline.value = task?.discipline || "FIS";
    els.form.elements.type.value = task?.type || "estudo";
    els.form.elements.date.value = task
      ? findDateOfTask(task.id) || selectedDate
      : selectedDate || toISO(new Date(viewYear, viewMonth, 1));
    els.form.elements.duration.value = task?.duration || "1h30–2h";
    els.modal.showModal();
  }

  function findDateOfTask(id) {
    for (const [iso, list] of Object.entries(state.tasksByDate)) {
      if (list.some((t) => t.id === id)) return iso;
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

  function saveTaskFromForm() {
    const title = els.form.elements.title.value.trim();
    if (!title) return;
    const date = els.form.elements.date.value;
    const payload = {
      id: editingTaskId || uid("custom"),
      title,
      detail: els.form.elements.detail.value.trim(),
      discipline: els.form.elements.discipline.value,
      type: els.form.elements.type.value,
      duration: els.form.elements.duration.value.trim() || "—",
    };

    if (editingTaskId) {
      const oldDate = findDateOfTask(editingTaskId);
      if (oldDate) {
        const existing = (state.tasksByDate[oldDate] || []).find((t) => t.id === editingTaskId);
        if (existing) {
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
  }

  async function exportMonthPng() {
    if (typeof html2canvas !== "function") {
      alert("Biblioteca de exportação não carregou. Verifica a ligação à internet.");
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
      link.download = `cronograma-${viewYear}-${String(viewMonth + 1).padStart(2, "0")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error(err);
      alert("Não foi possível exportar a imagem.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Exportar mês (PNG)";
    }
  }

  function render() {
    renderCalendar();
  }

  function bind() {
    document.getElementById("btn-prev").addEventListener("click", () => {
      viewMonth -= 1;
      if (viewMonth < 0) {
        viewMonth = 11;
        viewYear -= 1;
      }
      render();
    });
    document.getElementById("btn-next").addEventListener("click", () => {
      viewMonth += 1;
      if (viewMonth > 11) {
        viewMonth = 0;
        viewYear += 1;
      }
      render();
    });
    document.getElementById("btn-today").addEventListener("click", () => {
      const now = new Date();
      viewYear = now.getFullYear();
      viewMonth = now.getMonth();
      openDay(toISO(now));
    });
    document.getElementById("btn-export").addEventListener("click", exportMonthPng);
    document.getElementById("btn-close-panel").addEventListener("click", () => {
      selectedDate = null;
      els.sideContent.classList.add("hidden");
      els.sideEmpty.classList.remove("hidden");
      render();
    });
    document.getElementById("btn-add-task").addEventListener("click", () => openModal(null));
    els.btnDelete.addEventListener("click", () => {
      if (!editingTaskId) return;
      if (!confirm("Apagar esta tarefa?")) return;
      removeTask(editingTaskId);
      saveState();
      els.modal.close();
      openDay(selectedDate);
    });
    els.form.addEventListener("submit", (e) => {
      const submitter = e.submitter;
      if (submitter && submitter.value === "cancel") return;
      e.preventDefault();
      saveTaskFromForm();
      els.modal.close();
    });
  }

  // init
  if (!state.tasksByDate) state.tasksByDate = buildDefaultTasks();
  fillSelects();
  renderLegend();
  renderWeekdayHead();
  bind();
  render();
})();
