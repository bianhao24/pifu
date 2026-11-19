/* ==========================================================================
   蚍蜉战队 · RoboMaster 2027 招新报名页
   --------------------------------------------------------------------------
   Forminit 接入（https://forminit.com，原 Getform）
   · FORM_CONFIG.formId：在 app.forminit.com 创建表单后得到的 Form ID。
     已配置：u6p36letnuf。更换表单时只改这一处。
   · 字段按 Forminit 规范命名为 fi-{类型}-{名称}（fi-sender-* / fi-text-* /
     fi-radio-* / fi-checkbox-*[] / fi-file-*），首次提交自动建立字段模式，
     无需在后台预制字段。
   · 提交使用官方 SDK（index.html 中已加载
     https://forminit.com/sdk/v1/forminit.js），成功以服务端返回的
     data.hashId 判定；失败时保留用户输入并给出中文提示。
   · formId 留空时页面保持演示模式（仅保存在本机浏览器）。
   字段命名规则：https://forminit.com/setup.md
   ========================================================================== */

(function () {
  "use strict";

  var FORM_CONFIG = {
    formId: "u6p36letnuf" // 在 app.forminit.com 创建的表单 ID；留空则进入演示模式
  };

  var RECRUIT_YEAR = "2027";

  var DEPARTMENTS = {
    electrical: {
      name: "电控组",
      code: "ECU-01",
      desc: "打通机器人的神经与肌肉，让电流、信号和动作精准同步。",
      tags: ["STM32", "嵌入式", "电路设计", "电机控制"],
      abilities: ["C / C++", "STM32", "PCB 设计", "电机控制", "PID 调试", "嵌入式 Linux", "传感器融合", "焊接调试"]
    },
    vision: {
      name: "视觉组",
      code: "VIS-02",
      desc: "为机器人装上眼睛，在高速对抗中锁定目标、读取赛场。",
      tags: ["OpenCV", "深度学习", "相机标定", "目标跟踪"],
      abilities: ["Python", "OpenCV", "深度学习", "目标检测", "相机标定", "多目标跟踪", "C++", "图像处理"]
    },
    mechanical: {
      name: "机械组",
      code: "MEC-03",
      desc: "从概念草图到整车落地，定义机器人的结构、强度与可靠性。",
      tags: ["SolidWorks", "结构设计", "3D 打印", "加工工艺"],
      abilities: ["SolidWorks", "结构设计", "3D 打印", "工程图", "加工工艺", "有限元分析", "传动设计", "动手装配"]
    },
    algorithm: {
      name: "算法组",
      code: "ALG-04",
      desc: "在毫秒之间完成感知、决策与路径规划，让机器人自主作战。",
      tags: ["C++", "路径规划", "SLAM", "ROS"],
      abilities: ["C++", "数据结构", "路径规划", "SLAM", "决策优化", "ROS", "Linux", "数学建模"]
    },
    operations: {
      name: "运营宣传组",
      code: "OPS-05",
      desc: "用文字、影像与策划，记录战队故事，放大每一次登场。",
      tags: ["新媒体", "视频剪辑", "平面设计", "赛事运营"],
      abilities: ["文案策划", "视频剪辑", "平面设计", "摄影", "新媒体运营", "活动执行", "商务沟通", "社群运营"]
    }
  };

  var MAX_PHOTO_BYTES = 5 * 1024 * 1024;
  var DRAFT_KEY = "pifu-rm-2027-draft-v1";
  var APPLICATIONS_KEY = "pifu-rm-2027-applications-v1";
  var DRAFT_TTL = 7 * 24 * 60 * 60 * 1000;
  var REQUIRED_TOTAL = 9;

  var $ = function (selector, context) {
    return (context || document).querySelector(selector);
  };

  var $$ = function (selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  };

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  var els = {
    header: $("#siteHeader"),
    menuToggle: $("#menuToggle"),
    mobileMenu: $("#mobileMenu"),
    scrollProgress: $("#scrollProgress"),
    backToTop: $("#backToTop"),
    year: $("#year"),

    form: $("#applicationForm"),
    name: $("#name"),
    major: $("#major"),
    phone: $("#phone"),
    email: $("#email"),
    selfIntro: $("#selfIntro"),
    advantages: $("#advantages"),
    consent: $("#consent"),
    departmentPicker: $(".department-picker"),
    abilityChips: $("#abilityChips"),
    selfIntroCount: $("#selfIntroCount"),
    advantagesCount: $("#advantagesCount"),

    asideCode: $("#asideCode"),
    asideName: $("#asideName"),
    asideDesc: $("#asideDesc"),
    asideTags: $("#asideTags"),
    progressText: $("#progressText"),
    progressBar: $("#progressBar"),
    progressTrack: $("#progressTrack"),
    progressCount: $("#progressCount"),
    resetForm: $("#resetForm"),

    photoDrop: $("#photoDrop"),
    photoInput: $("#photoInput"),
    photoPick: $("#photoPick"),
    photoReplace: $("#photoReplace"),
    photoRemove: $("#photoRemove"),
    uploadEmpty: $("#uploadEmpty"),
    uploadPreview: $("#uploadPreview"),
    photoPreview: $("#photoPreview"),
    photoName: $("#photoName"),
    photoSize: $("#photoSize"),
    photoStatus: $("#photoStatus"),

    submitBtn: $("#submitBtn"),
    submitLabel: $(".submit-label", $("#submitBtn")),
    submitLoading: $(".submit-loading", $("#submitBtn")),
    formStatus: $("#formStatus"),
    formPanel: $(".form-panel"),

    privacyOpen: $("#privacyOpen"),
    privacyDialog: $("#privacyDialog"),
    successDialog: $("#successDialog"),
    successName: $("#successName"),
    successId: $("#successId"),
    successDept: $("#successDept"),
    successTime: $("#successTime"),
    successNote: $("#successNote"),
    downloadReceipt: $("#downloadReceipt"),

    toast: $("#toast")
  };

  var errors = {
    name: $("#nameError"),
    major: $("#majorError"),
    phone: $("#phoneError"),
    email: $("#emailError"),
    selfIntro: $("#selfIntroError"),
    advantages: $("#advantagesError"),
    department: $("#departmentError"),
    photo: $("#photoError"),
    consent: $("#consentError")
  };

  var fields = {
    name: els.name,
    major: els.major,
    phone: els.phone,
    email: els.email,
    selfIntro: els.selfIntro,
    advantages: els.advantages
  };

  var state = {
    activeDept: null,
    abilities: new Set(),
    photo: null,
    photoBusy: false,
    submitting: false,
    submitted: false,
    lastRecord: null,
    photoRequestId: 0
  };

  var saveTimer = null;
  var toastTimer = null;
  var scrollTicking = false;
  var menuOpen = false;

  init();

  function init() {
    document.body.classList.add("js-ready");

    if (els.year) {
      els.year.textContent = RECRUIT_YEAR;
    }

    bindHeader();
    bindReveal();
    bindDepartments();
    bindForm();
    bindPhoto();
    bindDialogs();

    fields.name.setAttribute("aria-required", "true");
    fields.major.setAttribute("aria-required", "true");
    fields.phone.setAttribute("aria-required", "true");
    fields.email.setAttribute("aria-required", "true");
    fields.selfIntro.setAttribute("aria-required", "true");
    fields.advantages.setAttribute("aria-required", "true");
    els.consent.setAttribute("aria-required", "true");
    els.photoInput.setAttribute("aria-required", "true");
    els.departmentPicker.setAttribute("aria-required", "true");

    renderAbilityChips(null);
    updateCounters();
    updateProgress();
    restoreDraft();
    updateScrollUI();

    window.setTimeout(function () {
      if (!reduceMotion.matches) {
        document.body.classList.add("is-loaded");
      }
    }, 60);
  }

  /* ------------------------------------------------------------------------
     Header, navigation & global UI
     ------------------------------------------------------------------------ */

  function bindHeader() {
    if (!els.menuToggle || !els.mobileMenu) {
      return;
    }

    els.menuToggle.addEventListener("click", function () {
      setMenu(!menuOpen, true);
    });

    $$("a", els.mobileMenu).forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false, false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menuOpen) {
        setMenu(false, true);
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900 && menuOpen) {
        setMenu(false, false);
      }
    });

    window.addEventListener(
      "scroll",
      function () {
        if (!scrollTicking) {
          scrollTicking = true;
          window.requestAnimationFrame(updateScrollUI);
        }
      },
      { passive: true }
    );

    if (els.backToTop) {
      els.backToTop.addEventListener("click", function () {
        window.scrollTo({
          top: 0,
          behavior: reduceMotion.matches ? "auto" : "smooth"
        });
      });
    }
  }

  function setMenu(open, focusTarget) {
    menuOpen = open;
    els.menuToggle.setAttribute("aria-expanded", String(open));
    els.menuToggle.setAttribute("aria-label", open ? "关闭导航菜单" : "打开导航菜单");
    els.mobileMenu.hidden = !open;
    els.header.classList.toggle("is-menu-open", open);
    document.body.classList.toggle("menu-open", open);

    if (open && focusTarget) {
      window.setTimeout(function () {
        var firstLink = $("a", els.mobileMenu);
        if (firstLink) {
          firstLink.focus();
        }
      }, 40);
    }

    if (!open && focusTarget) {
      els.menuToggle.focus();
    }
  }

  function updateScrollUI() {
    var scrollY = window.scrollY || window.pageYOffset;
    var height = document.documentElement.scrollHeight - window.innerHeight;
    var progress = height > 0 ? Math.min(100, Math.max(0, (scrollY / height) * 100)) : 0;

    if (els.header) {
      els.header.classList.toggle("is-scrolled", scrollY > 16);
    }

    if (els.scrollProgress) {
      els.scrollProgress.style.width = progress.toFixed(2) + "%";
    }

    if (els.backToTop) {
      els.backToTop.classList.toggle("is-visible", scrollY > 760);
    }

    updateActiveNav(scrollY);
    scrollTicking = false;
  }

  function updateActiveNav(scrollY) {
    var links = $$(".site-nav a");
    var probe = scrollY + window.innerHeight * 0.35;
    var active = "";

    links.forEach(function (link) {
      var hash = link.getAttribute("href");
      var section = hash ? $(hash) : null;
      if (section && section.offsetTop <= probe) {
        active = hash;
      }
    });

    links.forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("href") === active);
    });
  }

  function bindReveal() {
    var reveals = $$(".reveal");

    if (!("IntersectionObserver" in window) || reduceMotion.matches) {
      reveals.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -5% 0px"
      }
    );

    reveals.forEach(function (el) {
      var siblings = [];
      if (el.parentElement) {
        siblings = Array.prototype.filter.call(el.parentElement.children, function (child) {
          return child.classList.contains("reveal");
        });
      }
      var index = Math.max(0, siblings.indexOf(el));
      el.style.transitionDelay = Math.min(index * 60, 240) + "ms";
      observer.observe(el);
    });
  }

  function showToast(message, duration) {
    if (!els.toast) {
      return;
    }

    window.clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");

    toastTimer = window.setTimeout(function () {
      els.toast.classList.remove("is-visible");
    }, duration || 3000);
  }

  /* ------------------------------------------------------------------------
     Departments
     ------------------------------------------------------------------------ */

  function bindDepartments() {
    $$("[data-dept-card]").forEach(function (card) {
      card.addEventListener("click", function () {
        applyDepartment(card.getAttribute("data-dept-card"), true);
        scrollToForm();
      });
    });

    $$('input[name="department"]').forEach(function (radio) {
      radio.addEventListener("change", function () {
        if (radio.checked) {
          applyDepartment(radio.value, true);
        }
      });
    });
  }

  function applyDepartment(key, persist, options) {
    var info = DEPARTMENTS[key];

    if (!info) {
      return;
    }

    var changed = state.activeDept !== key;
    var allowed = new Set(info.abilities);

    state.activeDept = key;

    if (changed) {
      Array.from(state.abilities).forEach(function (ability) {
        if (!allowed.has(ability)) {
          state.abilities.delete(ability);
        }
      });
    }

    $$('input[name="department"]').forEach(function (radio) {
      radio.checked = radio.value === key;
    });

    $$(".picker-option").forEach(function (option) {
      var radio = $('input[name="department"]', option);
      option.classList.toggle("is-selected", Boolean(radio && radio.checked));
    });

    $$("[data-dept-card]").forEach(function (card) {
      var active = card.getAttribute("data-dept-card") === key;
      card.setAttribute("aria-pressed", String(active));
      var actionText = $(".dept-action > span", card);
      if (actionText) {
        actionText.textContent = active ? "已选择 · 前往报名" : "报考该组";
      }
    });

    els.asideCode.textContent = "UNIT // " + info.code;
    els.asideName.textContent = info.name;
    els.asideDesc.textContent = info.desc;
    els.asideName.classList.add("is-active");

    els.asideTags.replaceChildren();
    info.tags.forEach(function (tag) {
      var chip = document.createElement("span");
      chip.textContent = tag;
      els.asideTags.appendChild(chip);
    });

    renderAbilityChips(key);
    clearDepartmentError();
    updateProgress();

    if (persist !== false) {
      scheduleSave();
    }

    if (options && options.announce) {
      showToast("已选择面试部门：" + info.name);
    }
  }

  function resetDepartmentUI() {
    state.activeDept = null;
    state.abilities.clear();

    $$('input[name="department"]').forEach(function (radio) {
      radio.checked = false;
    });

    $$(".picker-option").forEach(function (option) {
      option.classList.remove("is-selected");
    });

    $$("[data-dept-card]").forEach(function (card) {
      card.setAttribute("aria-pressed", "false");
      var actionText = $(".dept-action > span", card);
      if (actionText) {
        actionText.textContent = "报考该组";
      }
    });

    els.asideCode.textContent = "UNIT // ----";
    els.asideName.textContent = "等待选择";
    els.asideName.classList.remove("is-active");
    els.asideDesc.textContent = "从五大方向中选择你最想加入的一组，这里会同步显示你的作战单元。";
    els.asideTags.replaceChildren();
    renderAbilityChips(null);
  }

  function scrollToForm() {
    var applySection = $("#apply");
    if (!applySection) {
      return;
    }

    applySection.scrollIntoView({
      behavior: reduceMotion.matches ? "auto" : "smooth",
      block: "start"
    });

    if (els.formPanel) {
      els.formPanel.classList.remove("is-highlighted");
      void els.formPanel.offsetWidth;
      els.formPanel.classList.add("is-highlighted");
      window.setTimeout(function () {
        els.formPanel.classList.remove("is-highlighted");
      }, 1700);
    }

    if (window.matchMedia("(min-width: 901px)").matches) {
      window.setTimeout(function () {
        els.name.focus({ preventScroll: true });
      }, 520);
    }
  }

  function renderAbilityChips(key) {
    var container = els.abilityChips;
    if (!container) {
      return;
    }

    container.replaceChildren();

    if (!key || !DEPARTMENTS[key]) {
      var placeholder = document.createElement("p");
      placeholder.className = "ability-placeholder";
      placeholder.textContent = "选择面试部门后，会显示对应的能力标签。";
      container.appendChild(placeholder);
      return;
    }

    DEPARTMENTS[key].abilities.forEach(function (ability) {
      var chip = document.createElement("button");
      var active = state.abilities.has(ability);
      chip.type = "button";
      chip.className = "ability-chip" + (active ? " is-active" : "");
      chip.setAttribute("data-ability", ability);
      chip.setAttribute("aria-pressed", String(active));
      chip.textContent = ability;
      container.appendChild(chip);
    });
  }

  /* ------------------------------------------------------------------------
     Form interactions
     ------------------------------------------------------------------------ */

  function bindForm() {
    Object.keys(fields).forEach(function (key) {
      var input = fields[key];

      input.addEventListener("input", function () {
        updateCounters();
        updateProgress();
        clearFormStatus();
        scheduleSave();

        if (input.getAttribute("aria-invalid") === "true") {
          validateField(key);
        }
      });

      input.addEventListener("blur", function () {
        if (input.value.trim()) {
          validateField(key);
        }
      });
    });

    els.consent.addEventListener("change", function () {
      updateProgress();
      clearFormStatus();
      if (els.consent.checked) {
        clearConsentError();
      }
    });

    els.abilityChips.addEventListener("click", function (event) {
      var chip = event.target.closest(".ability-chip");
      if (!chip) {
        return;
      }

      var ability = chip.getAttribute("data-ability");
      if (!ability) {
        return;
      }

      if (state.abilities.has(ability)) {
        state.abilities.delete(ability);
      } else {
        state.abilities.add(ability);
      }

      var selected = state.abilities.has(ability);
      chip.classList.toggle("is-active", selected);
      chip.setAttribute("aria-pressed", String(selected));
      scheduleSave();
    });

    els.form.addEventListener("submit", handleSubmit);
    els.resetForm.addEventListener("click", resetForm);

    els.privacyOpen.addEventListener("click", function () {
      openDialog(els.privacyDialog);
    });

    els.downloadReceipt.addEventListener("click", downloadReceipt);
  }

  function updateCounters() {
    els.selfIntroCount.textContent = els.selfIntro.value.length + " / 600";
    els.advantagesCount.textContent = els.advantages.value.length + " / 300";
  }

  function getCompletionState() {
    var phone = normalizePhone(els.phone.value);
    return {
      name: els.name.value.trim().length >= 2,
      major: els.major.value.trim().length >= 2,
      phone: /^1[3-9]\d{9}$/.test(phone),
      email: isValidEmail(els.email.value.trim()),
      department: Boolean(state.activeDept && DEPARTMENTS[state.activeDept]),
      selfIntro: els.selfIntro.value.trim().length >= 20,
      advantages: els.advantages.value.trim().length >= 10,
      photo: Boolean(state.photo),
      consent: els.consent.checked
    };
  }

  function updateProgress() {
    var completion = getCompletionState();
    var count = Object.keys(completion).filter(function (key) {
      return completion[key];
    }).length;
    var percent = Math.round((count / REQUIRED_TOTAL) * 100);

    els.progressText.textContent = percent + "%";
    els.progressBar.style.width = percent + "%";
    els.progressCount.textContent = count + " / " + REQUIRED_TOTAL + " 项必填内容";
    els.progressTrack.setAttribute("aria-valuenow", String(percent));
  }

  function validateField(key) {
    var value = fields[key] ? fields[key].value.trim() : "";
    var message = "";

    if (key === "name") {
      if (!value) {
        message = "请填写你的姓名。";
      } else if (value.length < 2) {
        message = "姓名至少需要 2 个字符。";
      }
    }

    if (key === "major") {
      if (!value) {
        message = "请填写你的专业。";
      } else if (value.length < 2) {
        message = "专业名称至少需要 2 个字符。";
      }
    }

    if (key === "phone") {
      if (!value) {
        message = "请填写手机号码。";
      } else if (!/^1[3-9]\d{9}$/.test(normalizePhone(value))) {
        message = "请输入有效的 11 位手机号码。";
      }
    }

    if (key === "email") {
      if (!value) {
        message = "请填写邮箱地址。";
      } else if (!isValidEmail(value)) {
        message = "请输入有效的邮箱地址，例如 name@example.com。";
      }
    }

    if (key === "selfIntro") {
      if (!value) {
        message = "请填写自我介绍。";
      } else if (value.length < 20) {
        message = "自我介绍至少写 20 个字，让我们更好地认识你。";
      }
    }

    if (key === "advantages") {
      if (!value) {
        message = "请填写你的优势。";
      } else if (value.length < 10) {
        message = "请用至少 10 个字描述你的优势。";
      }
    }

    setFieldError(key, message);
    return !message;
  }

  function validateDepartment() {
    if (!state.activeDept || !DEPARTMENTS[state.activeDept]) {
      setDepartmentError("请选择一个面试部门。");
      return false;
    }

    clearDepartmentError();
    return true;
  }

  function validatePhoto() {
    if (!state.photo) {
      setPhotoError("请上传一张个人照片。");
      return false;
    }

    clearPhotoError();
    return true;
  }

  function validateConsent() {
    if (!els.consent.checked) {
      setConsentError("请阅读并同意个人信息使用说明。");
      return false;
    }

    clearConsentError();
    return true;
  }

  function validateAll() {
    var firstInvalid = null;
    var keys = ["name", "major", "phone", "email", "selfIntro", "advantages"];

    keys.forEach(function (key) {
      var valid = validateField(key);
      if (!valid && !firstInvalid) {
        firstInvalid = fields[key];
      }
    });

    if (!validateDepartment() && !firstInvalid) {
      firstInvalid = $('input[name="department"]');
    }

    if (!validatePhoto() && !firstInvalid) {
      firstInvalid = els.photoBusy ? els.photoDrop : els.photoPick;
    }

    if (!validateConsent() && !firstInvalid) {
      firstInvalid = els.consent;
    }

    return firstInvalid;
  }

  function setFieldError(key, message) {
    var error = errors[key];
    var input = fields[key];

    if (!error || !input) {
      return;
    }

    error.textContent = message;

    if (message) {
      input.setAttribute("aria-invalid", "true");
    } else {
      input.removeAttribute("aria-invalid");
    }
  }

  function setDepartmentError(message) {
    errors.department.textContent = message;
    els.departmentPicker.classList.toggle("has-error", Boolean(message));

    if (message) {
      els.departmentPicker.setAttribute("aria-invalid", "true");
    } else {
      els.departmentPicker.removeAttribute("aria-invalid");
    }
  }

  function clearDepartmentError() {
    setDepartmentError("");
  }

  function setPhotoError(message) {
    errors.photo.textContent = message;
    els.photoDrop.classList.toggle("is-invalid", Boolean(message));
  }

  function clearPhotoError() {
    setPhotoError("");
  }

  function setConsentError(message) {
    errors.consent.textContent = message;

    if (message) {
      els.consent.setAttribute("aria-invalid", "true");
    } else {
      els.consent.removeAttribute("aria-invalid");
    }
  }

  function clearConsentError() {
    setConsentError("");
  }

  function clearFormStatus() {
    els.formStatus.textContent = "";
    els.formStatus.classList.remove("success");
  }

  function clearAllErrors() {
    Object.keys(errors).forEach(function (key) {
      if (errors[key]) {
        errors[key].textContent = "";
      }
    });

    Object.keys(fields).forEach(function (key) {
      fields[key].removeAttribute("aria-invalid");
    });

    els.departmentPicker.classList.remove("has-error");
    els.departmentPicker.removeAttribute("aria-invalid");
    els.photoDrop.classList.remove("is-invalid");
    els.consent.removeAttribute("aria-invalid");
    clearFormStatus();
  }

  function focusFirstInvalid(target) {
    if (!target) {
      return;
    }

    var scrollTarget = target;

    if (target.matches && target.matches('input[name="department"]')) {
      scrollTarget = target.closest(".picker-option");
    } else if (target === els.photoPick) {
      scrollTarget = els.photoDrop;
    } else if (target === els.consent) {
      scrollTarget = target.closest(".consent-block");
    }

    try {
      target.focus({ preventScroll: true });
    } catch (error) {
      target.focus();
    }

    if (scrollTarget && scrollTarget.scrollIntoView) {
      scrollTarget.scrollIntoView({
        behavior: reduceMotion.matches ? "auto" : "smooth",
        block: "center"
      });
    }
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  }

  function normalizePhone(value) {
    return String(value).replace(/[\s\-()]/g, "").replace(/^\+?86/, "");
  }

  /* ------------------------------------------------------------------------
     Photo upload
     ------------------------------------------------------------------------ */

  function bindPhoto() {
    els.photoPick.addEventListener("click", function () {
      els.photoInput.click();
    });

    els.photoReplace.addEventListener("click", function () {
      els.photoInput.click();
    });

    els.photoRemove.addEventListener("click", function () {
      clearPhoto();
      showToast("照片已移除。");
    });

    els.photoInput.addEventListener("change", function () {
      var file = els.photoInput.files && els.photoInput.files[0];
      if (file) {
        handlePhotoFile(file);
      }
      els.photoInput.value = "";
    });

    els.photoDrop.addEventListener("click", function (event) {
      if (event.target.closest("button") || state.photo) {
        return;
      }
      els.photoInput.click();
    });

    ["dragenter", "dragover"].forEach(function (type) {
      els.photoDrop.addEventListener(type, function (event) {
        event.preventDefault();
        event.stopPropagation();
        els.photoDrop.classList.add("is-dragging");
      });
    });

    els.photoDrop.addEventListener("dragleave", function (event) {
      if (!els.photoDrop.contains(event.relatedTarget)) {
        els.photoDrop.classList.remove("is-dragging");
      }
    });

    els.photoDrop.addEventListener("drop", function (event) {
      event.preventDefault();
      event.stopPropagation();
      els.photoDrop.classList.remove("is-dragging");

      var files = event.dataTransfer && event.dataTransfer.files;
      if (files && files[0]) {
        handlePhotoFile(files[0]);
      }
    });
  }

  function handlePhotoFile(file) {
    clearPhotoError();

    var validType = ["image/jpeg", "image/png", "image/webp"].indexOf(file.type) !== -1;
    var validExtension = /\.(jpe?g|png|webp)$/i.test(file.name);

    if (!validType && !validExtension) {
      setPhotoError("仅支持 JPG、PNG 或 WebP 格式的图片。");
      els.photoStatus.textContent = "照片格式不支持。";
      return;
    }

    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("照片大小不能超过 5MB，请压缩后再上传。");
      els.photoStatus.textContent = "照片文件过大。";
      return;
    }

    if (state.photoBusy) {
      showToast("上一张照片还在处理中，请稍候。");
      return;
    }

    var requestId = ++state.photoRequestId;
    state.photoBusy = true;
    setPhotoBusy(true);
    els.photoStatus.textContent = "正在处理照片，请稍候。";

    compressPhoto(file)
      .then(function (prepared) {
        if (requestId !== state.photoRequestId) {
          URL.revokeObjectURL(prepared.previewUrl);
          return;
        }

        if (state.photo && state.photo.url) {
          URL.revokeObjectURL(state.photo.url);
        }

        state.photo = {
          file: prepared.file,
          url: prepared.previewUrl,
          originalName: file.name,
          width: prepared.width,
          height: prepared.height
        };

        els.photoPreview.src = prepared.previewUrl;
        els.photoName.textContent = file.name;
        els.photoSize.textContent =
          formatBytes(prepared.file.size) + " · " + prepared.width + " × " + prepared.height;
        els.uploadEmpty.hidden = true;
        els.uploadPreview.hidden = false;
        els.photoStatus.textContent = "照片上传成功。";
        clearPhotoError();
        updateProgress();
        showToast("照片已上传并完成优化。");
      })
      .catch(function () {
        if (requestId === state.photoRequestId) {
          setPhotoError("照片读取失败，请更换一张图片后重试。");
          els.photoStatus.textContent = "照片处理失败。";
        }
      })
      .finally(function () {
        if (requestId === state.photoRequestId) {
          state.photoBusy = false;
          setPhotoBusy(false);
        }
      });
  }

  function compressPhoto(file) {
    return new Promise(function (resolve, reject) {
      var objectUrl = URL.createObjectURL(file);
      var image = new Image();

      image.onload = function () {
        var width = image.naturalWidth || image.width;
        var height = image.naturalHeight || image.height;

        if (!width || !height) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Invalid image size"));
          return;
        }

        var scale = Math.min(1, 1400 / Math.max(width, height));
        var targetWidth = Math.max(1, Math.round(width * scale));
        var targetHeight = Math.max(1, Math.round(height * scale));
        var canvas = document.createElement("canvas");
        var context;

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        context = canvas.getContext("2d");

        if (!context) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Canvas is not supported"));
          return;
        }

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.fillStyle = "#0a1018";
        context.fillRect(0, 0, targetWidth, targetHeight);
        context.drawImage(image, 0, 0, targetWidth, targetHeight);

        canvas.toBlob(
          function (blob) {
            URL.revokeObjectURL(objectUrl);

            if (!blob) {
              reject(new Error("Image compression failed"));
              return;
            }

            var compressedFile = new File([blob], "portrait.jpg", {
              type: "image/jpeg",
              lastModified: Date.now()
            });

            resolve({
              file: compressedFile,
              previewUrl: URL.createObjectURL(compressedFile),
              width: targetWidth,
              height: targetHeight
            });
          },
          "image/jpeg",
          0.88
        );
      };

      image.onerror = function () {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Image decode failed"));
      };

      image.src = objectUrl;
    });
  }

  function setPhotoBusy(busy) {
    els.photoDrop.classList.toggle("is-processing", busy);

    if (els.photoPick) {
      els.photoPick.disabled = busy;
      els.photoPick.textContent = busy ? "处理中…" : "选择照片";
    }

    if (els.photoReplace) {
      els.photoReplace.disabled = busy;
      els.photoReplace.textContent = busy ? "处理中…" : "更换照片";
    }
  }

  function clearPhoto() {
    state.photoRequestId += 1;
    state.photoBusy = false;
    setPhotoBusy(false);

    if (state.photo && state.photo.url) {
      URL.revokeObjectURL(state.photo.url);
    }

    state.photo = null;
    els.photoPreview.removeAttribute("src");
    els.photoInput.value = "";
    els.uploadPreview.hidden = true;
    els.uploadEmpty.hidden = false;
    els.photoStatus.textContent = "照片已移除。";
    els.photoDrop.classList.remove("is-dragging", "is-processing");
    clearPhotoError();
    updateProgress();
  }

  function formatBytes(bytes) {
    if (bytes < 1024) {
      return bytes + " B";
    }
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(0) + " KB";
    }
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  }

  /* ------------------------------------------------------------------------
     Draft persistence
     ------------------------------------------------------------------------ */

  function collectDraft() {
    return {
      name: els.name.value,
      major: els.major.value,
      phone: els.phone.value,
      email: els.email.value,
      selfIntro: els.selfIntro.value,
      advantages: els.advantages.value,
      department: state.activeDept || "",
      abilities: Array.from(state.abilities),
      savedAt: Date.now()
    };
  }

  function scheduleSave() {
    if (state.submitted) {
      return;
    }

    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(saveDraftNow, 450);
  }

  function saveDraftNow() {
    if (state.submitted) {
      return;
    }

    var draft = collectDraft();
    var hasContent =
      draft.name.trim() ||
      draft.major.trim() ||
      draft.phone.trim() ||
      draft.email.trim() ||
      draft.selfIntro.trim() ||
      draft.advantages.trim() ||
      draft.department ||
      draft.abilities.length;

    try {
      if (hasContent) {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } else {
        window.localStorage.removeItem(DRAFT_KEY);
      }
    } catch (error) {
      /* localStorage can be unavailable; the form still works without drafts. */
    }
  }

  function clearDraft() {
    window.clearTimeout(saveTimer);
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      /* no-op */
    }
  }

  function restoreDraft() {
    var draft;

    try {
      draft = JSON.parse(window.localStorage.getItem(DRAFT_KEY) || "null");
    } catch (error) {
      draft = null;
    }

    if (!draft || typeof draft !== "object") {
      return;
    }

    if (!draft.savedAt || Date.now() - draft.savedAt > DRAFT_TTL) {
      clearDraft();
      return;
    }

    var restored = false;

    ["name", "major", "phone", "email", "selfIntro", "advantages"].forEach(function (key) {
      if (typeof draft[key] === "string" && draft[key]) {
        fields[key].value = draft[key].slice(0, fields[key].maxLength || 1000);
        restored = true;
      }
    });

    updateCounters();

    if (draft.department && DEPARTMENTS[draft.department]) {
      if (Array.isArray(draft.abilities)) {
        state.abilities = new Set(
          draft.abilities.filter(function (ability) {
            return typeof ability === "string";
          })
        );
      }

      $$('input[name="department"]').forEach(function (radio) {
        radio.checked = radio.value === draft.department;
      });

      applyDepartment(draft.department, false);
      restored = true;
    }

    updateProgress();

    if (restored) {
      window.setTimeout(function () {
        showToast("已恢复上次未提交的报名草稿。", 3600);
      }, 900);
    }
  }

  /* ------------------------------------------------------------------------
     Submission
     ------------------------------------------------------------------------ */

  function handleSubmit(event) {
    event.preventDefault();

    if (state.submitting) {
      return;
    }

    if (state.submitted) {
      showToast("本次报名已提交。如需重新填写，请使用“清空表单”。");
      return;
    }

    if (state.photoBusy) {
      showToast("照片正在处理中，请稍候再提交。");
      return;
    }

    clearFormStatus();
    var firstInvalid = validateAll();

    if (firstInvalid) {
      els.formStatus.textContent = "请检查标记的必填项后再提交。";
      focusFirstInvalid(firstInvalid);
      showToast("还有必填项未完成，请检查表单。");
      return;
    }

    var info = DEPARTMENTS[state.activeDept];
    if (!info) {
      return;
    }

    var submittedAt = new Date();
    var record = {
      id: generateApplicationId(submittedAt),
      name: els.name.value.trim(),
      major: els.major.value.trim(),
      phone: normalizePhone(els.phone.value),
      email: els.email.value.trim(),
      departmentKey: state.activeDept,
      department: info.name,
      departmentCode: info.code,
      selfIntro: els.selfIntro.value.trim(),
      advantages: els.advantages.value.trim(),
      abilities: Array.from(state.abilities),
      consent: els.consent.checked,
      photoName: state.photo ? state.photo.originalName : "",
      submittedAt: submittedAt.toISOString(),
      submittedAtLabel: formatDateTime(submittedAt),
      source: "pifu-2027-web"
    };

    setSubmitting(true);
    els.formStatus.textContent = "";

    sendApplication(record)
      .then(function (finalRecord) {
        state.submitted = true;
        state.lastRecord = finalRecord;
        clearDraft();
        fillSuccessDialog(finalRecord);
        setSubmitting(false);
        lockSubmitAfterSuccess();
        updateProgress();
        openDialog(els.successDialog);
        els.formStatus.textContent = "报名信息已提交，感谢你的加入意向。";
        els.formStatus.classList.add("success");
      })
      .catch(function (error) {
        setSubmitting(false);
        var message = submissionErrorText(error);
        els.formStatus.textContent = message;
        els.formStatus.classList.remove("success");
        showToast(message, 3800);
        if (window.console && window.console.error) {
          window.console.error("Forminit submission failed:", error);
        }
      });
  }

  function sendApplication(record) {
    var formId = String(FORM_CONFIG.formId || "").trim();

    if (!formId) {
      return new Promise(function (resolve) {
        window.setTimeout(function () {
          saveDemoApplication(record);
          resolve(record);
        }, 850);
      });
    }

    return submitToForminit(formId, record);
  }

  function submitToForminit(formId, record) {
    if (typeof window.Forminit !== "function") {
      return Promise.reject(
        new SubmissionError(
          "SDK_MISSING",
          "",
          "表单服务脚本加载失败，请检查网络后刷新页面重试。"
        )
      );
    }

    if (state.photo && state.photo.file && state.photo.file.size > 24 * 1024 * 1024) {
      return Promise.reject(
        new SubmissionError("FILE_TOO_LARGE", "", "照片文件过大（超过 24MB），请更换照片后重试。")
      );
    }

    var payload = buildForminitPayload(record);
    var client;
    try {
      client = new window.Forminit();
    } catch (error) {
      return Promise.reject(error);
    }

    return client.submit(formId, payload).then(
      function (result) {
        var data = result && result.data;
        var error = result && result.error;

        if (error) {
          throw new SubmissionError(
            error.error || error.code || "SUBMISSION_REJECTED",
            error.fieldName || "",
            error.message || ""
          );
        }

        if (!data || typeof data.hashId !== "string") {
          throw new SubmissionError("MISSING_HASH_ID", "", "表单后台未确认收到档案，请稍后重试。");
        }

        return Object.assign({}, record, {
          serverResponse: data,
          serverHashId: data.hashId,
          serverDate: typeof data.date === "string" ? data.date : ""
        });
      },
      function (transportError) {
        throw new SubmissionError("NETWORK_ERROR", "", String((transportError && transportError.message) || transportError));
      }
    );
  }

  function SubmissionError(errorCode, fieldName, message) {
    this.errorCode = errorCode;
    this.fieldName = fieldName;
    this.message = message;
  }

  // 每个 Forminit 会校验的字段，给出一条中文提示
  var FIELD_ERRORS = {
    "sender.email": "请输入有效的邮箱地址。",
    "sender.fullName": "姓名只能包含汉字、字母、空格、连字符、句点和撇号。"
  };

  function submissionErrorText(error) {
    if (!error) {
      return "提交失败，请稍后重试。";
    }

    var field = error.fieldName || ((/['"]([^'"]+)['"]/.exec(error.message || "") || [])[1] || "");
    if (field && FIELD_ERRORS[field]) {
      return FIELD_ERRORS[field];
    }

    if (error.errorCode === "TOO_MANY_REQUESTS") {
      return "提交过于频繁，请等待几秒后再试。";
    }

    if (error.errorCode === "NETWORK_ERROR") {
      return "网络异常，提交未成功，请检查网络后重试。";
    }

    if (error.errorCode === "SDK_MISSING") {
      return "表单服务脚本加载失败，请检查网络后刷新页面重试。";
    }

    return "提交失败，请检查网络后重试，或稍后通过战队官方渠道联系我们。";
  }

  function buildForminitPayload(record) {
    var fd = new FormData();

    // 蜜罐字段：保持为空即通过反垃圾检查（Forminit 保留名，不加 fi- 前缀）
    fd.append("_gotcha", "");

    // 姓名的弯引号（’‘）会被 Forminit 拒绝，统一转成直撇号
    fd.append("fi-sender-fullName", String(record.name || "").replace(/[\u2018\u2019]/g, "'"));
    fd.append("fi-sender-email", String(record.email || ""));
    fd.append("fi-text-major", String(record.major || ""));
    fd.append("fi-text-phone", String(record.phone || ""));
    fd.append("fi-radio-department", String(record.department || ""));
    fd.append("fi-text-selfIntro", String(record.selfIntro || ""));
    fd.append("fi-text-advantages", String(record.advantages || ""));
    fd.append("fi-text-source", String(record.source || ""));

    if (record.abilities && record.abilities.length) {
      record.abilities.forEach(function (ability) {
        fd.append("fi-checkbox-abilities[]", String(ability));
      });
    }

    if (record.consent) {
      fd.append("fi-checkbox-consent", "yes");
    }

    if (state.photo) {
      fd.append("fi-file-photo", state.photo.file, "portrait.jpg");
    }

    return fd;
  }

  function saveDemoApplication(record) {
    try {
      var stored = JSON.parse(window.localStorage.getItem(APPLICATIONS_KEY) || "[]");
      var list = Array.isArray(stored) ? stored : [];
      list.unshift(record);
      window.localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(list.slice(0, 20)));
    } catch (error) {
      /* The visible success state still works if storage is unavailable. */
    }
  }

  function setSubmitting(submitting) {
    state.submitting = submitting;
    els.submitBtn.disabled = submitting;
    els.submitLabel.hidden = submitting;
    els.submitLoading.hidden = !submitting;

    if (!submitting) {
      els.submitLabel.textContent = "提交报名";
    }
  }

  function lockSubmitAfterSuccess() {
    els.submitBtn.disabled = true;
    els.submitLabel.hidden = false;
    els.submitLoading.hidden = true;
    els.submitLabel.textContent = "本次报名已提交";
  }

  function fillSuccessDialog(record) {
    els.successName.textContent = record.name;

    // 优先显示表单后台返回的提交编号（Forminit 的 hashId），否则显示前端编号
    if (record.serverHashId && String(record.serverHashId).trim()) {
      els.successId.textContent = String(record.serverHashId).trim();
    } else {
      els.successId.textContent = record.id;
    }

    els.successDept.textContent = record.department;

    if (record.serverDate && String(record.serverDate).trim()) {
      els.successTime.textContent = String(record.serverDate).trim();
    } else {
      els.successTime.textContent =
        record.submittedAtLabel || formatDateTime(new Date(record.submittedAt));
    }

    if (FORM_CONFIG.formId) {
      els.successNote.classList.remove("is-demo");
      els.successNote.textContent =
        "报名档案已存入战队表单后台，面试安排将通过电话或邮箱通知，请保持通讯畅通。";
    } else {
      els.successNote.classList.add("is-demo");
      els.successNote.textContent =
        "当前为前端演示模式：报名信息仅保存在本机浏览器，尚未发送至战队服务器。配置表单 ID 后即可正式收集。";
    }
  }

  function generateApplicationId(date) {
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");
    var random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return "PF-" + RECRUIT_YEAR + "-" + month + day + "-" + random;
  }

  function formatDateTime(date) {
    try {
      return new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).format(date);
    } catch (error) {
      return date.toLocaleString();
    }
  }

  function downloadReceipt() {
    if (!state.lastRecord) {
      return;
    }

    var exportRecord = Object.assign({}, state.lastRecord, {
      exportedAt: new Date().toISOString(),
      photoIncluded: false,
      exportNote: "报名回执备份，不包含照片文件。"
    });

    var blob = new Blob([JSON.stringify(exportRecord, null, 2)], {
      type: "application/json;charset=utf-8"
    });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    var safeName = String(exportRecord.name || "报名").replace(/[\\/:*?"<>|]/g, "_");

    link.href = url;
    link.download = "蚍蜉战队报名备份-" + safeName + "-" + exportRecord.id + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1500);
  }

  /* ------------------------------------------------------------------------
     Reset
     ------------------------------------------------------------------------ */

  function resetForm() {
    var hasContent =
      Object.keys(fields).some(function (key) {
        return fields[key].value.trim();
      }) ||
      Boolean(state.activeDept) ||
      Boolean(state.photo) ||
      state.abilities.size > 0 ||
      els.consent.checked;

    if (hasContent && !window.confirm("确定要清空当前填写的报名信息吗？")) {
      return;
    }

    els.form.reset();
    clearPhoto();
    resetDepartmentUI();
    state.submitted = false;
    state.lastRecord = null;
    state.abilities.clear();
    clearAllErrors();
    updateCounters();
    updateProgress();
    clearDraft();

    els.submitBtn.disabled = false;
    els.submitLabel.hidden = false;
    els.submitLabel.textContent = "提交报名";
    els.submitLoading.hidden = true;

    if (els.successDialog.open) {
      closeDialog(els.successDialog);
    }

    showToast("报名表已清空，可以重新填写。");
    window.setTimeout(function () {
      els.name.focus({ preventScroll: true });
    }, 40);
  }

  /* ------------------------------------------------------------------------
     Dialogs
     ------------------------------------------------------------------------ */

  function bindDialogs() {
    $$("[data-close-dialog]").forEach(function (button) {
      button.addEventListener("click", function () {
        var dialog = button.closest("dialog");
        closeDialog(dialog);
      });
    });

    [els.privacyDialog, els.successDialog].forEach(function (dialog) {
      if (!dialog) {
        return;
      }

      dialog.addEventListener("click", function (event) {
        if (event.target === dialog) {
          closeDialog(dialog);
        }
      });

      dialog.addEventListener("close", function () {
        syncModalState();
      });
    });

    if (els.successDialog) {
      els.successDialog.addEventListener("close", function () {
        if (state.submitted && els.resetForm) {
          els.resetForm.focus({ preventScroll: true });
        }
      });
    }
  }

  function openDialog(dialog) {
    if (!dialog || dialog.open) {
      return;
    }

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }

    syncModalState();
  }

  function closeDialog(dialog) {
    if (!dialog) {
      return;
    }

    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }

    syncModalState();
  }

  function syncModalState() {
    var hasOpenDialog =
      (els.privacyDialog && els.privacyDialog.open) ||
      (els.successDialog && els.successDialog.open);
    document.body.classList.toggle("modal-open", Boolean(hasOpenDialog));
  }
})();
