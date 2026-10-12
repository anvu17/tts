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

const STORAGE_KEYS = {
  SETTINGS: 'anvu_tts_data',
  HIDE_GUIDE: 'anvu_tts_hide_guide'
};

const CONTROL_IDS = ['rate', 'pitch', 'volume'];

const PUNCTUATION_DELIMITERS = [
  '. ', '! ', '? ', '; ',
  '。\n', '！\n', '？\n', '；\n',
  '。', '！', '？', '；',
  '.\n', '!\n', '?\n', ';\n',
  '\n\n', '\n',
  ', ', '，'
];

const supportsCustomHighlights =
  typeof Highlight !== 'undefined' &&
  typeof CSS !== 'undefined' &&
  'highlights' in CSS;

const appState = {
  uiLanguage: 'en',
  languageFilter: '',
  selectedVoiceURI: '',
  status: 'idle',
  voices: [],
  chunks: [],
  playbackRunId: 0,
  currentUtterance: null,
  selectionBaseOffset: 0,
  fullText: '',
  wakeLockSentinel: null,
  onCompleteCallback: null,
  activeMediaRecorder: null,
  shouldDiscardDownload: false,
  savedScrollPosition: 0,
  fallbackHighlightNodes: null,
  languageDropdown: null,
  voiceDropdown: null
};

function getDOMElements() {
  const getById = id => document.getElementById(id);
  return {
    text: getById('text'),
    viewer: getById('viewer'),
    count: getById('count'),
    progress: getById('progress'),
    btnRead: getById('btn-read'),
    btnPause: getById('btn-pause'),
    btnResume: getById('btn-resume'),
    btnStop: getById('btn-stop'),
    btnDownload: getById('btn-download'),
    btnPaste: getById('btn-paste'),
    btnOpen: getById('btn-open'),
    btnClear: getById('btn-clear'),
    fileInput: getById('file-input'),
    uiLang: getById('ui-lang'),
    noSpeech: getById('no-speech'),
    status: getById('status'),
    langInput: getById('lang-input'),
    langMenu: getById('lang-menu'),
    voiceInput: getById('voice-input'),
    voiceMenu: getById('voice-menu'),
    btnTest: getById('btn-test'),
    rate: getById('rate'),
    rateNum: getById('rate-num'),
    pitch: getById('pitch'),
    pitchNum: getById('pitch-num'),
    volume: getById('volume'),
    volumeNum: getById('volume-num'),
    btnReset: getById('btn-reset'),
    guideDialog: getById('guide-dialog'),
    guideDontShow: getById('guide-dont-show'),
    btnCloseGuide: getById('btn-close-guide'),
    btnConfirmDownload: getById('btn-confirm-download')
  };
}

const elements = getDOMElements();

function getInitialLanguage() {
  const systemLocale = (typeof navigator !== 'undefined' ? navigator.language : 'en') || '';
  return systemLocale.toLowerCase().startsWith('vi') ? 'vi' : 'en';
}

function calculateWordAndCharCounts(text = '') {
  const characterCount = text.length;
  const trimmedText = text.trim();
  const wordCount = trimmedText ? trimmedText.split(/\s+/).length : 0;
  return { characterCount, wordCount };
}

function formatCountText(characterCount, wordCount, language = 'en') {
  const langStrings = strings[language] || strings.en;
  return `${characterCount} ${langStrings.charCount}, ${wordCount} ${langStrings.wordCount}`;
}

function escapeHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function applyTranslationsToDOM(language, currentStatus = 'idle') {
  const validLanguage = strings[language] ? language : 'en';
  const langStrings = strings[validLanguage];

  document.documentElement.lang = validLanguage;
  document.title = langStrings.pageTitle;

  if (elements.uiLang) {
    elements.uiLang.value = validLanguage;
  }

  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (langStrings[key]) {
      element.textContent = langStrings[key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (langStrings[key]) {
      element.placeholder = langStrings[key];
    }
  });

  document.querySelectorAll('[data-i18n-aria]').forEach(element => {
    const key = element.getAttribute('data-i18n-aria');
    if (langStrings[key]) {
      element.setAttribute('aria-label', langStrings[key]);
    }
  });

  if (elements.status && currentStatus !== 'idle') {
    elements.status.textContent = langStrings[currentStatus] || currentStatus;
  }
}

function loadSavedSettings() {
  try {
    localStorage.removeItem('anvu_tts_text');
  } catch { }
  try {
    const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (rawSettings) return JSON.parse(rawSettings) || {};
  } catch { }
  return {};
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch { }
}

function isGuideHidden() {
  try {
    return localStorage.getItem(STORAGE_KEYS.HIDE_GUIDE) === '1';
  } catch {
    return false;
  }
}

function setGuideHidden(shouldHide) {
  try {
    if (shouldHide) {
      localStorage.setItem(STORAGE_KEYS.HIDE_GUIDE, '1');
    } else {
      localStorage.removeItem(STORAGE_KEYS.HIDE_GUIDE);
    }
  } catch { }
}

function createDebouncedSaver(callback, delayMs = 300) {
  let timerId = null;
  return function debouncedSave(...args) {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      timerId = null;
      callback(...args);
    }, delayMs);
  };
}

function updateUIStatus(status) {
  const isBusy = status !== 'idle';
  elements.btnRead.disabled = isBusy;
  elements.btnPause.disabled = status !== 'reading' && status !== 'recording';
  elements.btnResume.disabled = status !== 'paused';
  elements.btnStop.disabled = !isBusy;
  elements.btnDownload.disabled = isBusy;
  elements.btnPaste.disabled = isBusy;
  elements.btnOpen.disabled = isBusy;
  elements.btnTest.disabled = isBusy;

  const currentStrings = strings[appState.uiLanguage] || strings.en;
  elements.status.textContent = isBusy ? (currentStrings[status] || status) : '';
}

function setStatus(newStatus) {
  appState.status = newStatus;
  updateUIStatus(newStatus);
}

function getVoiceSettings() {
  return {
    rate: Number(elements.rate.value) || 1,
    pitch: Number(elements.pitch.value),
    volume: Number(elements.volume.value)
  };
}

function updateCounts() {
  const currentText = elements.text.value;
  const { characterCount, wordCount } = calculateWordAndCharCounts(currentText);
  elements.count.textContent = formatCountText(characterCount, wordCount, appState.uiLanguage);
}

function syncInputs() {
  elements.langInput.value = appState.languageFilter || '';
  const selectedVoice = getSelectedVoice(appState.voices, appState);
  elements.voiceInput.value = selectedVoice
    ? `${selectedVoice.name} - ${selectedVoice.lang}`
    : '';
}

const debouncedSaveSettings = createDebouncedSaver(() => {
  const settingsToPersist = {
    uiLang: appState.uiLanguage,
    langFilter: appState.languageFilter,
    voiceURI: appState.selectedVoiceURI
  };
  CONTROL_IDS.forEach(controlId => {
    settingsToPersist[controlId] = Number(elements[controlId].value);
  });
  saveSettings(settingsToPersist);
}, 300);

function applyLanguage(targetLanguage) {
  appState.uiLanguage = targetLanguage;
  applyTranslationsToDOM(targetLanguage, appState.status);
  updateCounts();
  syncInputs();

  if (appState.voices.length) {
    if (elements.langMenu.hidden) appState.languageDropdown?.render();
    if (elements.voiceMenu.hidden) appState.voiceDropdown?.render();
  }

  debouncedSaveSettings();
}

function setupFallbackViewer(fullText) {
  elements.viewer.textContent = '';
  const textBeforeMark = document.createTextNode(fullText);
  const markElement = document.createElement('mark');
  markElement.id = 'reading-mark';
  const highlightedWordNode = document.createTextNode('');
  markElement.appendChild(highlightedWordNode);
  const textAfterMark = document.createTextNode('');

  elements.viewer.append(textBeforeMark, markElement, textAfterMark);
  appState.fallbackHighlightNodes = {
    before: textBeforeMark,
    mark: markElement,
    word: highlightedWordNode,
    after: textAfterMark
  };
}

function toggleViewerVisibility(shouldShow) {
  if (shouldShow) {
    appState.savedScrollPosition = elements.text.scrollTop;
    elements.viewer.style.height = `${elements.text.offsetHeight}px`;

    if (supportsCustomHighlights) {
      elements.viewer.textContent = elements.text.value;
    } else {
      setupFallbackViewer(elements.text.value);
    }

    elements.text.style.display = 'none';
    elements.text.setAttribute('aria-hidden', 'true');
    elements.viewer.style.display = 'block';
    elements.viewer.removeAttribute('aria-hidden');
    elements.viewer.scrollTop = appState.savedScrollPosition;
  } else {
    elements.viewer.style.display = 'none';
    elements.viewer.setAttribute('aria-hidden', 'true');
    elements.text.style.display = 'block';
    elements.text.removeAttribute('aria-hidden');
    elements.text.scrollTop = elements.viewer.scrollTop || appState.savedScrollPosition;

    appState.fallbackHighlightNodes = null;
    if (supportsCustomHighlights) {
      CSS.highlights.delete('reading');
    }
  }
}

function highlightWordInViewer(startIndex, wordLength, fullText) {
  if (supportsCustomHighlights) {
    const textNode = elements.viewer.firstChild;
    if (textNode) {
      try {
        const maximumLength = textNode.length;
        const safeStartIndex = Math.min(startIndex, maximumLength);
        const safeEndIndex = Math.min(startIndex + wordLength, maximumLength);

        const highlightRange = new Range();
        highlightRange.setStart(textNode, safeStartIndex);
        highlightRange.setEnd(textNode, safeEndIndex);

        CSS.highlights.set('reading', new Highlight(highlightRange));

        const rangeBoundingRect = highlightRange.getBoundingClientRect();
        const viewerBoundingRect = elements.viewer.getBoundingClientRect();

        if (
          rangeBoundingRect.top < viewerBoundingRect.top ||
          rangeBoundingRect.bottom > viewerBoundingRect.bottom
        ) {
          elements.viewer.scrollTop +=
            (rangeBoundingRect.top - viewerBoundingRect.top) - (viewerBoundingRect.height / 2);
        }
      } catch { }
    }
  } else if (appState.fallbackHighlightNodes) {
    const { before, word, after, mark } = appState.fallbackHighlightNodes;
    before.nodeValue = fullText.slice(0, startIndex);
    word.nodeValue = fullText.slice(startIndex, startIndex + wordLength);
    after.nodeValue = fullText.slice(startIndex + wordLength);

    if (mark) {
      elements.viewer.scrollTop =
        mark.offsetTop - elements.viewer.offsetTop - (elements.viewer.clientHeight / 2);
    }
  }
}

function splitTextIntoChunks(text, maxChunkLength = 200) {
  const chunkList = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    if (text.length - startIndex <= maxChunkLength) {
      chunkList.push({ text: text.slice(startIndex), start: startIndex });
      break;
    }

    const currentSlice = text.slice(startIndex, startIndex + maxChunkLength);
    let breakIndex = -1;

    for (const punctuation of PUNCTUATION_DELIMITERS) {
      const punctuationIndex = currentSlice.lastIndexOf(punctuation);
      if (punctuationIndex >= maxChunkLength * 0.3) {
        breakIndex = punctuationIndex + punctuation.length;
        break;
      }
    }

    if (breakIndex === -1) {
      const lastSpaceIndex = currentSlice.lastIndexOf(' ');
      breakIndex = lastSpaceIndex !== -1 ? lastSpaceIndex + 1 : maxChunkLength;
    }

    chunkList.push({
      text: text.slice(startIndex, startIndex + breakIndex),
      start: startIndex
    });
    startIndex += breakIndex;
  }

  return chunkList;
}

function filterVoicesByLanguage(voices, languageFilter) {
  if (!languageFilter) return voices;
  const targetLanguage = languageFilter.toLowerCase();
  return voices.filter(voice => voice.lang.toLowerCase() === targetLanguage);
}

function pickDefaultVoice(voiceList, currentUiLanguage = 'en') {
  if (!voiceList.length) return null;
  return (
    voiceList.find(voice => voice.lang.toLowerCase().startsWith(currentUiLanguage)) ||
    voiceList.find(voice => voice.default) ||
    voiceList[0] ||
    null
  );
}

function resolveDefaultVoice(voices, state) {
  const filteredVoices = filterVoicesByLanguage(voices, state.languageFilter);
  return pickDefaultVoice(filteredVoices, state.uiLanguage) || pickDefaultVoice(voices, state.uiLanguage);
}

function getSelectedVoice(voices, state) {
  if (state.selectedVoiceURI) {
    const matchedVoice = voices.find(voice => voice.voiceURI === state.selectedVoiceURI);
    if (matchedVoice) return matchedVoice;
  }

  const fallbackVoice = resolveDefaultVoice(voices, state);
  if (fallbackVoice) {
    state.selectedVoiceURI = fallbackVoice.voiceURI;
  }

  return fallbackVoice;
}

function createSpeechUtterance(text, voice, rate = 1, pitch = 1, volume = 1) {
  const utterance = new SpeechSynthesisUtterance(text);
  if (voice) {
    utterance.voice = voice;
  }
  utterance.rate = Number(rate) || 1;
  utterance.pitch = Number(pitch);
  utterance.volume = Number(volume);
  return utterance;
}

function resetSpeechEngine() {
  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();
}

function playChunk(chunkIndex, runId) {
  if (runId !== appState.playbackRunId || appState.status === 'idle') {
    return;
  }

  if (chunkIndex >= appState.chunks.length) {
    if (elements.progress) {
      elements.progress.value = elements.progress.max;
    }
    stopReading();
    return;
  }

  const currentChunk = appState.chunks[chunkIndex];
  if (!currentChunk.text.trim()) {
    playChunk(chunkIndex + 1, runId);
    return;
  }

  if (elements.progress) {
    elements.progress.value = currentChunk.start;
  }

  const selectedVoice = getSelectedVoice(appState.voices, appState);
  const { rate, pitch, volume } = getVoiceSettings();
  const utterance = (appState.currentUtterance = createSpeechUtterance(
    currentChunk.text,
    selectedVoice,
    rate,
    pitch,
    volume
  ));

  utterance.onboundary = event => {
    if (runId !== appState.playbackRunId || (event.name && event.name !== 'word')) {
      return;
    }
    const globalCharIndex = appState.selectionBaseOffset + currentChunk.start + event.charIndex;
    const wordLength =
      event.charLength ||
      appState.fullText.slice(globalCharIndex).match(/^\S+/)?.[0]?.length ||
      1;

    highlightWordInViewer(globalCharIndex, wordLength, appState.fullText);

    if (elements.progress) {
      elements.progress.value = currentChunk.start + event.charIndex + wordLength;
    }
  };

  utterance.onend = () => {
    playChunk(chunkIndex + 1, runId);
  };

  utterance.onerror = event => {
    if (
      runId !== appState.playbackRunId ||
      event.error === 'canceled' ||
      event.error === 'interrupted'
    ) {
      return;
    }
    if (event.error === 'not-allowed') {
      stopReading();
      if (elements.status) {
        elements.status.textContent = strings[appState.uiLanguage].speechError;
      }
      return;
    }
    playChunk(chunkIndex + 1, runId);
  };

  window.speechSynthesis.speak(utterance);
}

function startReading(onDone) {
  if (!('speechSynthesis' in window)) return;

  const fullTextValue = elements.text.value;
  appState.fullText = fullTextValue;
  if (!fullTextValue.trim()) return;

  const selectionStart = elements.text.selectionStart;
  const selectionEnd = elements.text.selectionEnd;
  const hasSelection = selectionEnd > selectionStart;
  const targetText = hasSelection ? fullTextValue.slice(selectionStart, selectionEnd) : fullTextValue;
  appState.selectionBaseOffset = hasSelection ? selectionStart : 0;

  appState.chunks = splitTextIntoChunks(targetText, 200);
  if (!appState.chunks.length) return;

  appState.onCompleteCallback = onDone || null;

  if (appState.status !== 'recording') {
    setStatus('reading');
  }

  toggleViewerVisibility(true);
  if (elements.progress) {
    elements.progress.max = targetText.length;
    elements.progress.value = 0;
  }

  if (navigator.wakeLock?.request) {
    navigator.wakeLock
      .request('screen')
      .then(lock => {
        if (appState.status === 'idle') {
          lock.release().catch(() => { });
        } else {
          appState.wakeLockSentinel = lock;
        }
      })
      .catch(() => { });
  }

  appState.playbackRunId++;
  const currentRunId = appState.playbackRunId;

  resetSpeechEngine();
  playChunk(0, currentRunId);
}

function pauseReading() {
  window.speechSynthesis.pause();
  if (appState.activeMediaRecorder && appState.activeMediaRecorder.state === 'recording') {
    appState.activeMediaRecorder.pause();
  }
  setStatus('paused');
}

function resumeReading() {
  window.speechSynthesis.resume();
  if (appState.activeMediaRecorder && appState.activeMediaRecorder.state === 'paused') {
    appState.activeMediaRecorder.resume();
  }
  setStatus(appState.onCompleteCallback ? 'recording' : 'reading');
}

function stopReading() {
  appState.playbackRunId++;
  appState.currentUtterance = null;

  resetSpeechEngine();

  if (appState.wakeLockSentinel) {
    appState.wakeLockSentinel.release().catch(() => { });
    appState.wakeLockSentinel = null;
  }

  setStatus('idle');
  toggleViewerVisibility(false);
  if (elements.progress) {
    elements.progress.value = 0;
  }

  if (appState.onCompleteCallback) {
    const callback = appState.onCompleteCallback;
    appState.onCompleteCallback = null;
    callback();
  }
}

function testVoice() {
  const selectedVoice = getSelectedVoice(appState.voices, appState);
  if (!selectedVoice) {
    if (elements.status) {
      elements.status.textContent = strings[appState.uiLanguage].noVoices;
    }
    return;
  }

  const sampleText = selectedVoice.lang.toLowerCase().startsWith('vi')
    ? strings.vi.sampleText
    : strings.en.sampleText;

  const { rate, pitch, volume } = getVoiceSettings();
  const utterance = createSpeechUtterance(sampleText, selectedVoice, rate, pitch, volume);

  resetSpeechEngine();
  window.speechSynthesis.speak(utterance);
}

function audioBufferToWavBlob(audioBuffer) {
  const channelCount = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const sampleCount = audioBuffer.length;
  const bytesPerBlock = channelCount * 2;
  const dataByteSize = sampleCount * bytesPerBlock;
  const totalByteSize = 44 + dataByteSize;
  const arrayBuffer = new ArrayBuffer(totalByteSize);
  const dataView = new DataView(arrayBuffer);

  const writeAsciiString = (byteOffset, asciiString) => {
    for (let index = 0; index < asciiString.length; index++) {
      dataView.setUint8(byteOffset + index, asciiString.charCodeAt(index));
    }
  };

  writeAsciiString(0, 'RIFF');
  dataView.setUint32(4, totalByteSize - 8, true);
  writeAsciiString(8, 'WAVE');

  writeAsciiString(12, 'fmt ');
  dataView.setUint32(16, 16, true);
  dataView.setUint16(20, 1, true);
  dataView.setUint16(22, channelCount, true);
  dataView.setUint32(24, sampleRate, true);
  dataView.setUint32(28, sampleRate * bytesPerBlock, true);
  dataView.setUint16(32, bytesPerBlock, true);
  dataView.setUint16(34, 16, true);

  writeAsciiString(36, 'data');
  dataView.setUint32(40, dataByteSize, true);

  const channelDataList = [];
  for (let channelIndex = 0; channelIndex < channelCount; channelIndex++) {
    channelDataList.push(audioBuffer.getChannelData(channelIndex));
  }

  let byteOffset = 44;
  for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex++) {
    for (let channelIndex = 0; channelIndex < channelCount; channelIndex++) {
      const sample = Math.max(-1, Math.min(1, channelDataList[channelIndex][sampleIndex]));
      const int16Sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      dataView.setInt16(byteOffset, int16Sample, true);
      byteOffset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

async function startAudioCaptureAndDownload() {
  if (appState.status !== 'idle') return;
  if (!elements.text.value.trim()) return;

  if (!navigator.mediaDevices?.getDisplayMedia) {
    elements.guideDialog.showModal();
    return;
  }

  let mediaStream = null;
  try {
    mediaStream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
  } catch {
    return;
  }

  const audioTrack = mediaStream.getAudioTracks()?.[0];
  if (!audioTrack) {
    mediaStream.getTracks().forEach(track => track.stop());
    elements.guideDialog.showModal();
    return;
  }

  audioTrack.onended = () => {
    if (appState.status !== 'idle') {
      appState.shouldDiscardDownload = true;
      stopReading();
    }
  };

  const audioOnlyStream = new MediaStream([audioTrack]);
  const recorder = (appState.activeMediaRecorder = new MediaRecorder(audioOnlyStream));
  const recordedChunks = [];
  appState.shouldDiscardDownload = false;

  recorder.ondataavailable = event => {
    if (event.data?.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  recorder.onstop = async () => {
    mediaStream.getTracks().forEach(track => track.stop());
    if (appState.activeMediaRecorder === recorder) {
      appState.activeMediaRecorder = null;
    }

    if (appState.shouldDiscardDownload || !recordedChunks.length) {
      return;
    }

    const recordedBlob = new Blob(recordedChunks, { type: recorder.mimeType || 'audio/webm' });
    const arrayBuffer = await recordedBlob.arrayBuffer();
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContextClass();
    const decodedAudioBuffer = await audioContext.decodeAudioData(arrayBuffer).catch(() => null);

    const finalBlob = decodedAudioBuffer ? audioBufferToWavBlob(decodedAudioBuffer) : recordedBlob;
    const fileExtension = decodedAudioBuffer
      ? 'wav'
      : (recorder.mimeType?.includes('mp4') ? 'mp4' : 'webm');

    const downloadUrl = URL.createObjectURL(finalBlob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = downloadUrl;
    downloadAnchor.download = `speech.${fileExtension}`;
    downloadAnchor.click();

    setTimeout(() => URL.revokeObjectURL(downloadUrl), 10000);
    if (audioContext.state !== 'closed') {
      audioContext.close();
    }
  };

  recorder.start();
  setStatus('recording');

  startReading(() => {
    setTimeout(() => {
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
    }, 500);
  });
}

function setupDropdown({
  inputElement,
  menuElement,
  getItems,
  onSelect,
  getEmptyText,
  onClose
}) {
  let activeIndex = -1;
  let currentItems = [];

  function pickItem(index) {
    const targetIndex = index >= 0 ? index : 0;
    if (currentItems[targetIndex]) {
      onSelect(currentItems[targetIndex]);
      closeMenu();
    }
  }

  function moveSelection(delta) {
    const itemElements = menuElement.querySelectorAll('.drop-item:not(.empty)');
    if (!itemElements.length) return;
    if (menuElement.hidden) {
      openMenu();
      return;
    }
    activeIndex = (activeIndex + delta + itemElements.length) % itemElements.length;
    itemElements.forEach((element, index) => {
      const isActive = index === activeIndex;
      element.classList.toggle('active', isActive);
      if (isActive) {
        inputElement.setAttribute('aria-activedescendant', element.id);
      }
    });
    itemElements[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }

  function renderMenu(query = '') {
    activeIndex = -1;
    inputElement.removeAttribute('aria-activedescendant');
    const normalizedQuery = query.toLowerCase().trim();
    currentItems = getItems(normalizedQuery);

    if (!currentItems.length) {
      menuElement.innerHTML = `<div class="drop-item empty">${getEmptyText()}</div>`;
      return;
    }

    const menuId = menuElement.id;
    menuElement.innerHTML = currentItems
      .map((item, index) => {
        const selectedClass = item.selected ? ' selected' : '';
        const optionId = `${menuId}-opt-${index}`;
        return `<div id="${optionId}" class="drop-item${selectedClass}" role="option" aria-selected="${item.selected}">${escapeHtml(item.label)}</div>`;
      })
      .join('');
  }

  menuElement.onmousedown = event => {
    const itemElement = event.target.closest('.drop-item:not(.empty)');
    if (!itemElement) return;
    event.preventDefault();
    const itemIndex = [...menuElement.children].indexOf(itemElement);
    if (itemIndex >= 0) {
      pickItem(itemIndex);
    }
  };

  function openMenu() {
    menuElement.hidden = false;
    inputElement.setAttribute('aria-expanded', 'true');
    renderMenu('');
    inputElement.select();
    setTimeout(() => {
      menuElement.querySelector('.selected')?.scrollIntoView({ block: 'nearest' });
    }, 0);
  }

  function closeMenu() {
    if (menuElement.hidden) return;
    menuElement.hidden = true;
    inputElement.setAttribute('aria-expanded', 'false');
    inputElement.removeAttribute('aria-activedescendant');
    activeIndex = -1;
    if (onClose) onClose();
  }

  inputElement.onclick = () => {
    if (menuElement.hidden) openMenu();
  };

  inputElement.onfocus = () => {
    if (menuElement.hidden) openMenu();
  };

  inputElement.oninput = () => {
    menuElement.hidden = false;
    inputElement.setAttribute('aria-expanded', 'true');
    renderMenu(inputElement.value);
  };

  inputElement.onkeydown = event => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveSelection(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveSelection(-1);
    } else if (event.key === 'Enter') {
      if (!menuElement.hidden && currentItems.length) {
        event.preventDefault();
        pickItem(activeIndex);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      closeMenu();
    }
  };

  const handleDocumentInteraction = event => {
    if (!inputElement.contains(event.target) && !menuElement.contains(event.target)) {
      closeMenu();
    }
  };

  document.addEventListener('click', handleDocumentInteraction);
  document.addEventListener('focusin', handleDocumentInteraction);

  return {
    render: renderMenu,
    close: closeMenu,
    open: openMenu
  };
}

function getLanguageItems(query = '') {
  const uniqueLanguages = [...new Set(appState.voices.map(voice => voice.lang))].sort();
  const allLanguagesItem = {
    label: strings[appState.uiLanguage].allLanguages,
    value: '',
    selected: !appState.languageFilter
  };

  const languageItems = uniqueLanguages.map(languageCode => ({
    label: languageCode,
    value: languageCode,
    selected: appState.languageFilter.toLowerCase() === languageCode.toLowerCase()
  }));

  const completeList = [allLanguagesItem, ...languageItems];
  if (!query) return completeList;
  return completeList.filter(item => item.label.toLowerCase().includes(query));
}

function getVoiceItems(query = '') {
  const filteredVoices = filterVoicesByLanguage(appState.voices, appState.languageFilter);
  const matchedVoices = query
    ? filteredVoices.filter(voice => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();
      return name.includes(query) || lang.includes(query) || `${name} - ${lang}`.includes(query);
    })
    : filteredVoices;

  return matchedVoices.map(voice => ({
    label: `${voice.name} - ${voice.lang}`,
    value: voice.voiceURI,
    selected: appState.selectedVoiceURI === voice.voiceURI
  }));
}

function loadVoices() {
  appState.voices = window.speechSynthesis.getVoices() || [];
  if (!appState.voices.length) return;
  elements.noSpeech.hidden = true;

  if (!appState.languageDropdown) {
    appState.languageDropdown = setupDropdown({
      inputElement: elements.langInput,
      menuElement: elements.langMenu,
      getItems: getLanguageItems,
      getEmptyText: () => strings[appState.uiLanguage].noResults,
      onClose: syncInputs,
      onSelect: selectedItem => {
        appState.languageFilter = selectedItem.value;
        const chosenVoice = resolveDefaultVoice(appState.voices, appState);
        if (chosenVoice) {
          appState.selectedVoiceURI = chosenVoice.voiceURI;
        }
        syncInputs();
        if (elements.voiceMenu.hidden) appState.voiceDropdown?.render();
        debouncedSaveSettings();
      }
    });

    appState.voiceDropdown = setupDropdown({
      inputElement: elements.voiceInput,
      menuElement: elements.voiceMenu,
      getItems: getVoiceItems,
      getEmptyText: () => strings[appState.uiLanguage].noResults,
      onClose: syncInputs,
      onSelect: selectedItem => {
        appState.selectedVoiceURI = selectedItem.value;
        const matchedVoice = appState.voices.find(voice => voice.voiceURI === selectedItem.value);
        if (matchedVoice) {
          appState.languageFilter = matchedVoice.lang;
        }
        syncInputs();
        if (elements.langMenu.hidden) appState.languageDropdown?.render();
        debouncedSaveSettings();
      }
    });
  }

  const existingVoice = appState.voices.find(voice => voice.voiceURI === appState.selectedVoiceURI);
  if (!existingVoice) {
    const fallbackVoice = resolveDefaultVoice(appState.voices, appState);
    if (fallbackVoice) {
      appState.selectedVoiceURI = fallbackVoice.voiceURI;
    }
  }

  syncInputs();
  if (elements.langMenu.hidden) appState.languageDropdown?.render();
  if (elements.voiceMenu.hidden) appState.voiceDropdown?.render();
}

function handleDownloadClick() {
  if (appState.status !== 'idle') return;
  if (!elements.text.value.trim()) {
    elements.text.focus();
    return;
  }

  if (isGuideHidden()) {
    startAudioCaptureAndDownload();
  } else {
    elements.guideDialog.showModal();
  }
}

elements.uiLang.onchange = event => applyLanguage(event.target.value);

elements.text.oninput = () => updateCounts();

elements.btnPaste.onclick = () => {
  if (!navigator.clipboard?.readText) {
    elements.text.focus();
    return;
  }
  navigator.clipboard
    .readText()
    .then(pastedText => {
      if (pastedText) {
        elements.text.value = pastedText;
        updateCounts();
      }
    })
    .catch(() => elements.text.focus());
};

elements.btnOpen.onclick = () => elements.fileInput.click();

elements.fileInput.onchange = event => {
  const selectedFile = event.target.files?.[0];
  if (selectedFile) {
    if (selectedFile.size > 2e6) {
      event.target.value = '';
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = readEvent => {
      elements.text.value = readEvent.target.result;
      updateCounts();
    };
    fileReader.readAsText(selectedFile);
  }
  event.target.value = '';
};

elements.btnDownload.onclick = handleDownloadClick;

elements.btnClear.onclick = () => {
  if (appState.status === 'recording') {
    appState.shouldDiscardDownload = true;
  }
  if (appState.status !== 'idle') {
    stopReading();
  }
  elements.text.value = '';
  updateCounts();
  elements.text.focus();
};

elements.btnRead.onclick = () => startReading();
elements.btnPause.onclick = () => pauseReading();
elements.btnResume.onclick = () => resumeReading();

elements.btnStop.onclick = () => {
  if (appState.status === 'recording') {
    appState.shouldDiscardDownload = true;
  }
  stopReading();
};

elements.btnTest.onclick = () => testVoice();

elements.btnCloseGuide.onclick = () => elements.guideDialog.close();

elements.btnConfirmDownload.onclick = () => {
  if (elements.guideDontShow.checked) {
    setGuideHidden(true);
  }
  elements.guideDialog.close();
  startAudioCaptureAndDownload();
};

elements.guideDialog.onclick = event => {
  const dialogRect = event.currentTarget.getBoundingClientRect();
  if (
    event.clientX < dialogRect.left ||
    event.clientX > dialogRect.right ||
    event.clientY < dialogRect.top ||
    event.clientY > dialogRect.bottom
  ) {
    event.currentTarget.close();
  }
};

CONTROL_IDS.forEach(controlId => {
  const rangeInput = elements[controlId];
  const numberInput = elements[`${controlId}Num`];

  const syncControlValue = value => {
    rangeInput.value = value;
    numberInput.value = value;
    debouncedSaveSettings();
  };

  rangeInput.oninput = () => syncControlValue(rangeInput.value);
  numberInput.oninput = () => syncControlValue(numberInput.value);
  numberInput.onchange = () => syncControlValue(numberInput.value);
});

elements.btnReset.onclick = () => {
  CONTROL_IDS.forEach(controlId => {
    elements[controlId].value = 1;
    elements[`${controlId}Num`].value = 1;
  });
  debouncedSaveSettings();
};

document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    if (appState.status === 'idle') {
      startReading();
    }
  } else if (event.key === 'Escape') {
    window.speechSynthesis?.cancel();
    if (appState.status === 'recording') {
      appState.shouldDiscardDownload = true;
    }
    if (appState.status !== 'idle') {
      stopReading();
    }
  }
});

window.addEventListener('pagehide', () => {
  window.speechSynthesis?.cancel();
});

const savedSettings = loadSavedSettings();
if (savedSettings.uiLang && strings[savedSettings.uiLang]) {
  appState.uiLanguage = savedSettings.uiLang;
} else {
  appState.uiLanguage = getInitialLanguage();
}
if (savedSettings.langFilter) {
  appState.languageFilter = savedSettings.langFilter;
}
if (savedSettings.voiceURI) {
  appState.selectedVoiceURI = savedSettings.voiceURI;
}

CONTROL_IDS.forEach(controlId => {
  const savedValue = savedSettings[controlId] ?? 1;
  elements[controlId].value = savedValue;
  elements[`${controlId}Num`].value = savedValue;
});

applyLanguage(appState.uiLanguage);

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();
  setTimeout(() => {
    if (!appState.voices.length) {
      elements.noSpeech.textContent = strings[appState.uiLanguage].noVoices;
      elements.noSpeech.hidden = false;
    }
  }, 1500);
} else {
  elements.noSpeech.hidden = false;
  elements.btnRead.disabled = true;
  elements.btnTest.disabled = true;
  elements.btnDownload.disabled = true;
}
