const $ = id => document.getElementById(id);
const supportsHighlights = typeof Highlight !== 'undefined' && typeof CSS !== 'undefined' && 'highlights' in CSS;

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const strings = {
  en: {
    pageTitle: 'An Vu TTS - SpeechSynthesis Text to Speech',
    subtitle: 'Text to speech with browser SpeechSynthesis API',
    interface: 'Interface',
    text: 'Text',
    voice: 'Voice',
    language: 'Language',
    speed: 'Speed',
    pitch: 'Pitch',
    volume: 'Volume',
    read: 'Read',
    pause: 'Pause',
    resume: 'Resume',
    stop: 'Stop',
    testVoice: 'Test voice',
    paste: 'Paste',
    openFile: 'Open file',
    download: 'Download',
    dontShowGuide: "Don't show this guide again",
    continueDownload: 'Continue',
    clear: 'Clear',
    reset: 'Reset',
    allLanguages: 'All languages',
    allPlaceholder: 'All',
    shortcut: 'Ctrl+Enter to read, Esc to stop',
    noSpeech: 'Speech synthesis is not supported',
    charCount: 'characters',
    wordCount: 'words',
    sampleText: 'This is a test of the speech synthesis voice.',
    reading: 'Reading',
    paused: 'Paused',
    recording: 'Recording',
    noVoices: 'No voice available for speech synthesis',
    speechError: 'Speech synthesis error',
    noResults: 'No results',
    guideTitle: 'Download audio guide',
    guideStep1: 'Browsers require audio permission to record SpeechSynthesis',
    guideStep2: '1. Select current tab or entire screen',
    guideStep3: '2. Enable share tab audio',
    guideStep4: '3. Audio will be recorded and saved as WAV',
    guideNote: 'Note: Audio recording requires sharing tab or screen audio (best supported on Chrome/Edge on Windows/ChromeOS).',
    close: 'Close'
  },
  vi: {
    pageTitle: 'An Vu TTS - Đọc văn bản bằng SpeechSynthesis API',
    subtitle: 'Đọc văn bản bằng SpeechSynthesis API',
    interface: 'Giao diện',
    text: 'Văn bản',
    voice: 'Giọng đọc',
    language: 'Ngôn ngữ',
    speed: 'Tốc độ',
    pitch: 'Cao độ',
    volume: 'Âm lượng',
    read: 'Đọc',
    pause: 'Tạm dừng',
    resume: 'Tiếp tục',
    stop: 'Dừng',
    testVoice: 'Đọc thử',
    paste: 'Dán',
    openFile: 'Mở tệp',
    download: 'Tải về',
    dontShowGuide: 'Không hiện lại hướng dẫn này',
    continueDownload: 'Tiếp tục',
    clear: 'Xóa',
    reset: 'Đặt lại',
    allLanguages: 'Tất cả ngôn ngữ',
    allPlaceholder: 'Tất cả',
    shortcut: 'Ctrl+Enter để đọc, Esc để dừng',
    noSpeech: 'Trình duyệt không hỗ trợ speech synthesis',
    charCount: 'ký tự',
    wordCount: 'từ',
    sampleText: 'Đây là thử nghiệm giọng đọc văn bản.',
    reading: 'Đang đọc',
    paused: 'Tạm dừng',
    recording: 'Đang ghi âm',
    noVoices: 'Không có giọng đọc nào khả dụng',
    speechError: 'Lỗi phát âm thanh',
    noResults: 'Không tìm thấy',
    guideTitle: 'Hướng dẫn tải âm thanh',
    guideStep1: 'Trình duyệt cần quyền thu âm để lưu giọng đọc từ SpeechSynthesis',
    guideStep2: '1. Chọn tab hiện tại hoặc toàn màn hình',
    guideStep3: '2. Bật công tắc chia sẻ âm thanh',
    guideStep4: '3. Trang sẽ tự ghi âm giọng đọc và lưu file WAV',
    guideNote: 'Lưu ý: Tính năng thu âm yêu cầu chia sẻ âm thanh tab hoặc toàn màn hình.',
    close: 'Đóng'
  }
};

const controls = ['rate', 'pitch', 'volume'];

let uiLang = (navigator.language || '').toLowerCase().startsWith('vi') ? 'vi' : 'en';
let voices = [];
let chunks = [];
let runId = 0;
let curUtt = null;
let baseOffset = 0;
let fullText = '';
let status = 'idle';
let wakeLock = null;
let completeCb = null;
let mediaRecorder = null;
let discardDownload = false;
let langDropdown = null;
let voiceDropdown = null;
let savedScrollTop = 0;
let fallbackNodes = null;

const appState = {
  langFilter: '',
  voiceURI: ''
};

function load() {
  let settings = {};
  let text = '';
  try {
    settings = JSON.parse(localStorage.getItem('anvu_tts_data') || '{}');
  } catch { }
  try {
    text = localStorage.getItem('anvu_tts_text') ?? settings.text ?? '';
  } catch { }
  return { ...settings, text };
}

let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem('anvu_tts_text', $('text').value);
    } catch { }
    try {
      const data = {
        uiLang,
        langFilter: appState.langFilter,
        voiceURI: appState.voiceURI
      };
      controls.forEach(id => data[id] = Number($(id).value));
      localStorage.setItem('anvu_tts_data', JSON.stringify(data));
    } catch { }
  }, 300);
}

function updateCounts() {
  const val = $('text').value;
  const chars = val.length;
  const words = val.trim() ? val.trim().split(/\s+/).length : 0;
  $('count').textContent = `${chars} ${strings[uiLang].charCount}, ${words} ${strings[uiLang].wordCount}`;
}

function syncInputs() {
  $('lang-input').value = appState.langFilter || '';
  const v = getSelectedVoice();
  $('voice-input').value = v ? `${v.name} - ${v.lang}` : '';
}

function applyLang(lang) {
  uiLang = lang;
  document.documentElement.lang = lang;
  $('ui-lang').value = lang;
  document.title = strings[lang].pageTitle;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    if (strings[lang]?.[k]) el.textContent = strings[lang][k];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const k = el.getAttribute('data-i18n-placeholder');
    if (strings[lang]?.[k]) el.placeholder = strings[lang][k];
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const k = el.getAttribute('data-i18n-aria');
    if (strings[lang]?.[k]) el.setAttribute('aria-label', strings[lang][k]);
  });

  if (status !== 'idle') {
    $('status').textContent = strings[lang][status] || status;
  }

  updateCounts();
  syncInputs();
  if (voices.length) {
    if ($('lang-menu').hidden) langDropdown?.render();
    if ($('voice-menu').hidden) voiceDropdown?.render();
  }
  save();
}

function setStatus(s) {
  status = s;
  const isBusy = s !== 'idle';
  $('btn-read').disabled = isBusy;
  $('btn-pause').disabled = s !== 'reading' && s !== 'recording';
  $('btn-resume').disabled = s !== 'paused';
  $('btn-stop').disabled = !isBusy;
  $('btn-download').disabled = isBusy;
  $('btn-paste').disabled = isBusy;
  $('btn-open').disabled = isBusy;
  $('btn-test').disabled = isBusy;
  $('status').textContent = isBusy ? (strings[uiLang][s] || s) : '';
}

function setupFallbackViewer(text) {
  const v = $('viewer');
  v.textContent = '';
  const before = document.createTextNode(text);
  const mark = document.createElement('mark');
  mark.id = 'reading-mark';
  const word = document.createTextNode('');
  mark.appendChild(word);
  const after = document.createTextNode('');
  v.append(before, mark, after);
  fallbackNodes = { before, mark, word, after };
}

function showViewer(show) {
  const t = $('text');
  const v = $('viewer');
  if (show) {
    savedScrollTop = t.scrollTop;
    v.style.height = `${t.offsetHeight}px`;
    if (supportsHighlights) {
      v.textContent = t.value;
    } else {
      setupFallbackViewer(t.value);
    }
    t.style.display = 'none';
    t.setAttribute('aria-hidden', 'true');
    v.style.display = 'block';
    v.removeAttribute('aria-hidden');
    v.scrollTop = savedScrollTop;
  } else {
    v.style.display = 'none';
    v.setAttribute('aria-hidden', 'true');
    t.style.display = 'block';
    t.removeAttribute('aria-hidden');
    t.scrollTop = v.scrollTop || savedScrollTop;
    fallbackNodes = null;
    if (supportsHighlights) CSS.highlights.delete('reading');
  }
}

function highlightWord(start, len) {
  const viewer = $('viewer');
  if (supportsHighlights) {
    const textNode = viewer.firstChild;
    if (textNode) {
      try {
        const maxLen = textNode.length;
        const safeStart = Math.min(start, maxLen);
        const safeEnd = Math.min(start + len, maxLen);
        const range = new Range();
        range.setStart(textNode, safeStart);
        range.setEnd(textNode, safeEnd);
        CSS.highlights.set('reading', new Highlight(range));
        const rRect = range.getBoundingClientRect();
        const vRect = viewer.getBoundingClientRect();
        if (rRect.top < vRect.top || rRect.bottom > vRect.bottom) {
          viewer.scrollTop += (rRect.top - vRect.top) - (vRect.height / 2);
        }
      } catch (err) {}
    }
  } else if (fallbackNodes) {
    fallbackNodes.before.nodeValue = fullText.slice(0, start);
    fallbackNodes.word.nodeValue = fullText.slice(start, start + len);
    fallbackNodes.after.nodeValue = fullText.slice(start + len);
    const m = fallbackNodes.mark;
    if (m) {
      viewer.scrollTop = m.offsetTop - viewer.offsetTop - (viewer.clientHeight / 2);
    }
  }
}

function splitChunks(text, max = 200) {
  const list = [];
  let s = 0;
  const puncts = [
    '. ', '! ', '? ', '; ',
    '。\n', '！\n', '？\n', '；\n',
    '。', '！', '？', '；',
    '.\n', '!\n', '?\n', ';\n',
    '\n\n', '\n',
    ', ', '，'
  ];
  while (s < text.length) {
    if (text.length - s <= max) {
      list.push({ text: text.slice(s), start: s });
      break;
    }
    const slice = text.slice(s, s + max);
    let b = -1;
    for (const p of puncts) {
      const idx = slice.lastIndexOf(p);
      if (idx >= max * 0.3) {
        b = idx + p.length;
        break;
      }
    }
    if (b === -1) {
      const sp = slice.lastIndexOf(' ');
      b = sp !== -1 ? sp + 1 : max;
    }
    list.push({ text: text.slice(s, s + b), start: s });
    s += b;
  }
  return list;
}

function getFilteredVoices() {
  if (!appState.langFilter) return voices;
  const target = appState.langFilter.toLowerCase();
  return voices.filter(v => v.lang.toLowerCase() === target);
}

function pickVoice(list) {
  if (!list.length) return null;
  return list.find(v => v.lang.toLowerCase().startsWith(uiLang)) ||
    list.find(v => v.default) ||
    list[0];
}

function getSelectedVoice() {
  if (appState.voiceURI) {
    const v = voices.find(x => x.voiceURI === appState.voiceURI);
    if (v) return v;
  }
  const filtered = getFilteredVoices();
  const v = pickVoice(filtered) || pickVoice(voices);
  if (v) appState.voiceURI = v.voiceURI;
  return v;
}

function getLangItems(q) {
  const langs = [...new Set(voices.map(v => v.lang))].sort();
  const allItem = {
    label: strings[uiLang].allLanguages,
    value: '',
    selected: !appState.langFilter
  };
  const list = langs.map(l => ({
    label: l,
    value: l,
    selected: appState.langFilter.toLowerCase() === l.toLowerCase()
  }));
  const full = [allItem, ...list];
  if (!q) return full;
  return full.filter(it => it.label.toLowerCase().includes(q));
}

function getVoiceItems(q) {
  const list = getFilteredVoices();
  const filtered = q ? list.filter(v => {
    const n = v.name.toLowerCase();
    const l = v.lang.toLowerCase();
    return n.includes(q) || l.includes(q) || `${n} - ${l}`.includes(q);
  }) : list;

  return filtered.map(v => ({
    label: `${v.name} - ${v.lang}`,
    value: v.voiceURI,
    selected: appState.voiceURI === v.voiceURI
  }));
}

function setupDropdown(inputId, menuId, getItems, onSelect) {
  const inp = $(inputId);
  const menu = $(menuId);
  let activeIdx = -1;
  let currentItems = [];

  function pick(idx) {
    const targetIdx = idx >= 0 ? idx : 0;
    if (currentItems[targetIdx]) {
      onSelect(currentItems[targetIdx]);
      close();
    }
  }

  function move(delta) {
    const list = menu.querySelectorAll('.drop-item:not(.empty)');
    if (!list.length) return;
    if (menu.hidden) {
      open();
      return;
    }
    activeIdx = (activeIdx + delta + list.length) % list.length;
    list.forEach((el, i) => {
      const isActive = i === activeIdx;
      el.classList.toggle('active', isActive);
      if (isActive) inp.setAttribute('aria-activedescendant', el.id);
    });
    list[activeIdx]?.scrollIntoView({ block: 'nearest' });
  }

  function render(query = '') {
    activeIdx = -1;
    inp.removeAttribute('aria-activedescendant');
    const q = query.toLowerCase().trim();
    currentItems = getItems(q);
    if (!currentItems.length) {
      menu.innerHTML = `<div class="drop-item empty">${strings[uiLang].noResults}</div>`;
      return;
    }
    menu.innerHTML = currentItems.map((it, i) => {
      const sel = it.selected ? ' selected' : '';
      const optId = `${menuId}-opt-${i}`;
      return `<div id="${optId}" class="drop-item${sel}" role="option" aria-selected="${it.selected}">${escapeHtml(it.label)}</div>`;
    }).join('');
  }

  menu.onmousedown = e => {
    const el = e.target.closest('.drop-item:not(.empty)');
    if (!el) return;
    e.preventDefault();
    const idx = [...menu.children].indexOf(el);
    if (idx >= 0) pick(idx);
  };

  function open() {
    menu.hidden = false;
    inp.setAttribute('aria-expanded', 'true');
    render('');
    inp.select();
    setTimeout(() => {
      menu.querySelector('.selected')?.scrollIntoView({ block: 'nearest' });
    }, 0);
  }

  function close() {
    if (menu.hidden) return;
    menu.hidden = true;
    inp.setAttribute('aria-expanded', 'false');
    inp.removeAttribute('aria-activedescendant');
    activeIdx = -1;
    syncInputs();
  }

  inp.onclick = () => { if (menu.hidden) open(); };
  inp.onfocus = () => { if (menu.hidden) open(); };
  inp.oninput = () => {
    menu.hidden = false;
    inp.setAttribute('aria-expanded', 'true');
    render(inp.value);
  };

  inp.onkeydown = e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      move(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      move(-1);
    } else if (e.key === 'Enter') {
      if (!menu.hidden && currentItems.length) {
        e.preventDefault();
        pick(activeIdx);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  };

  const onDoc = e => {
    if (!inp.contains(e.target) && !menu.contains(e.target)) close();
  };
  document.addEventListener('click', onDoc);
  document.addEventListener('focusin', onDoc);

  return { render, close };
}

function loadVoices() {
  voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length) return;
  $('no-speech').hidden = true;

  if (!langDropdown) {
    langDropdown = setupDropdown('lang-input', 'lang-menu', getLangItems, it => {
      appState.langFilter = it.value;
      const list = getFilteredVoices();
      const chosen = pickVoice(list) || pickVoice(voices);
      if (chosen) appState.voiceURI = chosen.voiceURI;
      syncInputs();
      if ($('voice-menu').hidden) voiceDropdown?.render();
      save();
    });

    voiceDropdown = setupDropdown('voice-input', 'voice-menu', getVoiceItems, it => {
      appState.voiceURI = it.value;
      const v = voices.find(x => x.voiceURI === it.value);
      if (v) {
        appState.langFilter = v.lang;
      }
      syncInputs();
      if ($('lang-menu').hidden) langDropdown?.render();
      save();
    });
  }

  const currentVoice = voices.find(v => v.voiceURI === appState.voiceURI);
  if (!currentVoice) {
    const list = getFilteredVoices();
    const fallback = pickVoice(list) || pickVoice(voices);
    if (fallback) appState.voiceURI = fallback.voiceURI;
  }

  syncInputs();
  if ($('lang-menu').hidden) langDropdown?.render();
  if ($('voice-menu').hidden) voiceDropdown?.render();
}

function makeUtterance(text) {
  const u = new SpeechSynthesisUtterance(text);
  const v = getSelectedVoice();
  if (v) u.voice = v;
  u.rate = Number($('rate').value) || 1;
  u.pitch = Number($('pitch').value);
  u.volume = Number($('volume').value);
  return u;
}

function playChunk(idx, id = runId) {
  if (id !== runId || status === 'idle') return;
  if (idx >= chunks.length) {
    $('progress').value = $('progress').max;
    stop();
    return;
  }
  const c = chunks[idx];
  if (!c.text.trim()) return playChunk(idx + 1, id);
  $('progress').value = c.start;

  const u = curUtt = makeUtterance(c.text);

  u.onboundary = e => {
    if (id !== runId || (e.name && e.name !== 'word')) return;
    const gIdx = baseOffset + c.start + e.charIndex;
    const len = e.charLength || fullText.slice(gIdx).match(/^\S+/)?.[0]?.length || 1;
    highlightWord(gIdx, len);
    $('progress').value = c.start + e.charIndex + len;
  };

  u.onend = () => playChunk(idx + 1, id);

  u.onerror = e => {
    if (id !== runId || e.error === 'canceled' || e.error === 'interrupted') return;
    if (e.error === 'not-allowed') {
      stop();
      $('status').textContent = strings[uiLang].speechError;
      return;
    }
    playChunk(idx + 1, id);
  };

  window.speechSynthesis.speak(u);
}

function read(onDone) {
  if (!('speechSynthesis' in window)) return;
  fullText = $('text').value;
  if (!fullText.trim()) return;

  const selStart = $('text').selectionStart;
  const selEnd = $('text').selectionEnd;
  const hasSel = selEnd > selStart;
  const target = hasSel ? fullText.slice(selStart, selEnd) : fullText;
  baseOffset = hasSel ? selStart : 0;

  chunks = splitChunks(target, 200);
  if (!chunks.length) return;

  completeCb = onDone || null;
  if (status !== 'recording') setStatus('reading');
  showViewer(true);
  $('progress').max = target.length;
  $('progress').value = 0;

  navigator.wakeLock?.request('screen')
    .then(l => status === 'idle' ? l.release() : (wakeLock = l)).catch(() => { });

  runId++;
  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();
  playChunk(0, runId);
}

function pause() {
  window.speechSynthesis.pause();
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.pause();
  }
  setStatus('paused');
}

function resume() {
  window.speechSynthesis.resume();
  if (mediaRecorder && mediaRecorder.state === 'paused') {
    mediaRecorder.resume();
  }
  setStatus(completeCb ? 'recording' : 'reading');
}

function stop() {
  runId++;
  curUtt = null;
  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();
  if (wakeLock) {
    wakeLock.release().catch(() => { });
    wakeLock = null;
  }
  setStatus('idle');
  showViewer(false);
  $('progress').value = 0;
  if (completeCb) {
    const cb = completeCb;
    completeCb = null;
    cb();
  }
}

function testVoice() {
  const v = getSelectedVoice();
  if (!v) {
    $('status').textContent = strings[uiLang].noVoices;
    return;
  }
  const txt = v.lang.toLowerCase().startsWith('vi') ? strings.vi.sampleText : strings.en.sampleText;
  const u = makeUtterance(txt);
  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();
  window.speechSynthesis.speak(u);
}

function audioBufferToWav(buffer) {
  const numCh = buffer.numberOfChannels;
  const rate = buffer.sampleRate;
  const samples = buffer.length;
  const block = numCh * 2;
  const dataSize = samples * block;
  const total = 44 + dataSize;
  const ab = new ArrayBuffer(total);
  const v = new DataView(ab);

  const writeStr = (o, s) => {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  v.setUint32(4, total - 8, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, numCh, true);
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * block, true);
  v.setUint16(32, block, true);
  v.setUint16(34, 16, true);
  writeStr(36, 'data');
  v.setUint32(40, dataSize, true);

  const channels = [];
  for (let c = 0; c < numCh; c++) channels.push(buffer.getChannelData(c));

  let o = 44;
  for (let i = 0; i < samples; i++) {
    for (let c = 0; c < numCh; c++) {
      const s = Math.max(-1, Math.min(1, channels[c][i]));
      v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      o += 2;
    }
  }
  return new Blob([ab], { type: 'audio/wav' });
}

async function startCaptureAndDownload() {
  if (status !== 'idle') return;
  if (!$('text').value.trim()) return;

  if (!navigator.mediaDevices?.getDisplayMedia) {
    $('guide-dialog').showModal();
    return;
  }

  let stream = null;
  try {
    stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
  } catch {
    return;
  }

  const audioTrack = stream.getAudioTracks()?.[0];
  if (!audioTrack) {
    stream.getTracks().forEach(t => t.stop());
    $('guide-dialog').showModal();
    return;
  }

  audioTrack.onended = () => {
    if (status !== 'idle') {
      discardDownload = true;
      stop();
    }
  };

  const audioStream = new MediaStream([audioTrack]);
  const rec = mediaRecorder = new MediaRecorder(audioStream);
  const data = [];
  discardDownload = false;

  rec.ondataavailable = e => {
    if (e.data?.size > 0) data.push(e.data);
  };
  rec.onstop = async () => {
    stream.getTracks().forEach(t => t.stop());
    if (mediaRecorder === rec) mediaRecorder = null;
    if (discardDownload || !data.length) return;
    const blob = new Blob(data, { type: rec.mimeType || 'audio/webm' });
    const ab = await blob.arrayBuffer();
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuf = await ctx.decodeAudioData(ab).catch(() => null);
    const wavBlob = audioBuf ? audioBufferToWav(audioBuf) : blob;
    const ext = audioBuf ? 'wav' : (rec.mimeType?.includes('mp4') ? 'mp4' : 'webm');
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speech.${ext}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    if (ctx.state !== 'closed') ctx.close();
  };

  mediaRecorder.start();
  setStatus('recording');
  read(() => {
    setTimeout(() => {
      if (rec.state !== 'inactive') {
        rec.stop();
      }
    }, 500);
  });
}

function handleDownloadClick() {
  if (status !== 'idle') return;
  if (!$('text').value.trim()) {
    $('text').focus();
    return;
  }
  let hideGuide = false;
  try {
    hideGuide = localStorage.getItem('anvu_tts_hide_guide') === '1';
  } catch { }

  if (hideGuide) {
    startCaptureAndDownload();
  } else {
    $('guide-dialog').showModal();
  }
}

$('ui-lang').onchange = e => applyLang(e.target.value);
$('text').oninput = () => {
  updateCounts();
  save();
};

$('btn-paste').onclick = () => {
  if (!navigator.clipboard?.readText) {
    $('text').focus();
    return;
  }
  navigator.clipboard.readText().then(t => {
    if (t) {
      $('text').value = t;
      updateCounts();
      save();
    }
  }).catch(() => $('text').focus());
};

$('btn-open').onclick = () => $('file-input').click();
$('file-input').onchange = e => {
  const f = e.target.files?.[0];
  if (f) {
    if (f.size > 2e6) {
      e.target.value = '';
      return;
    }
    const r = new FileReader();
    r.onload = ev => {
      $('text').value = ev.target.result;
      updateCounts();
      save();
    };
    r.readAsText(f);
  }
  e.target.value = '';
};

$('btn-download').onclick = handleDownloadClick;

$('btn-clear').onclick = () => {
  if (status === 'recording') discardDownload = true;
  if (status !== 'idle') stop();
  $('text').value = '';
  updateCounts();
  save();
  $('text').focus();
};

$('btn-read').onclick = () => read();
$('btn-pause').onclick = pause;
$('btn-resume').onclick = resume;
$('btn-stop').onclick = () => {
  if (status === 'recording') discardDownload = true;
  stop();
};
$('btn-test').onclick = testVoice;

$('btn-close-guide').onclick = () => $('guide-dialog').close();
$('btn-confirm-download').onclick = () => {
  if ($('guide-dont-show').checked) {
    try {
      localStorage.setItem('anvu_tts_hide_guide', '1');
    } catch { }
  }
  $('guide-dialog').close();
  startCaptureAndDownload();
};
$('guide-dialog').onclick = e => {
  const r = e.currentTarget.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
    e.currentTarget.close();
  }
};

controls.forEach(id => {
  const range = $(id);
  const num = $(`${id}-num`);
  range.oninput = () => {
    num.value = range.value;
    save();
  };
  num.oninput = () => {
    range.value = num.value;
    save();
  };
  num.onchange = () => {
    num.value = range.value;
    save();
  };
});

$('btn-reset').onclick = () => {
  controls.forEach(id => {
    $(id).value = 1;
    $(`${id}-num`).value = 1;
  });
  save();
};

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    if (status === 'idle') read();
  } else if (e.key === 'Escape') {
    window.speechSynthesis?.cancel();
    if (status === 'recording') discardDownload = true;
    if (status !== 'idle') stop();
  }
});

window.addEventListener('pagehide', () => {
  window.speechSynthesis?.cancel();
});

const saved = load();
if (saved.text) $('text').value = saved.text;
if (saved.uiLang && strings[saved.uiLang]) uiLang = saved.uiLang;
if (saved.langFilter) appState.langFilter = saved.langFilter;
if (saved.voiceURI) appState.voiceURI = saved.voiceURI;

controls.forEach(id => {
  const val = saved[id] ?? 1;
  $(id).value = val;
  $(`${id}-num`).value = $(id).value;
});

applyLang(uiLang);

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();
  setTimeout(() => {
    if (!voices.length) {
      $('no-speech').textContent = strings[uiLang].noVoices;
      $('no-speech').hidden = false;
    }
  }, 1500);
} else {
  $('no-speech').hidden = false;
  $('btn-read').disabled = true;
  $('btn-test').disabled = true;
  $('btn-download').disabled = true;
}
