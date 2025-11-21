let foods = [];
let slideIndex = 0;
let slideTimer = null;

// 画面切り替え
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const view = document.getElementById('view-' + name);
  if (view) view.classList.add('active');
}

// カード描画共通
function renderCards(container, items) {
  container.innerHTML = '';
  items.forEach(item => {
    const article = document.createElement('article');
    article.className = 'entry-card';
    article.innerHTML = `
      <img src="${item.photo}" alt="${item.place}">
      <div class="entry-card-body">
        <div class="entry-card-place">${item.place}</div>
        <div class="entry-card-date">${item.date}</div>
      </div>
    `;
    container.appendChild(article);
  });
}

// CSV読み込み
async function loadFoodsFromCSV() {
  try {
    const res = await fetch('foods.csv');
    if (!res.ok) {
      console.error('foods.csv を読み込めませんでした', res.status);
      return;
    }
    const text = await res.text();
    const lines = text.trim().split('\n');
    if (lines.length <= 1) return;

    const dataLines = lines.slice(1);
    foods = dataLines.map(line => {
      const cols = line.split(',');
      return {
        date: (cols[0] || '').trim(),
        place: (cols[1] || '').trim(),
        photo: (cols[2] || '').trim()
      };
    });

    setupSlideshow();
    setupPlaceSelect();
    initSearchViews();
  } catch (e) {
    console.error('CSV 読み込み中にエラー', e);
  }
}

// スライドショー初期化
function setupSlideshow() {
  if (!foods.length) return;

  const img = document.getElementById('slideImage');
  const placeEl = document.getElementById('slidePlace');
  const dateEl = document.getElementById('slideDate');

  function showSlide(i) {
    const item = foods[i];
    img.src = item.photo;
    img.alt = item.place;
    placeEl.textContent = item.place;
    dateEl.textContent = item.date;
  }

  showSlide(0);

  if (slideTimer) clearInterval(slideTimer);
  slideTimer = setInterval(() => {
    slideIndex = (slideIndex + 1) % foods.length;
    showSlide(slideIndex);
  }, 4000);
}

// 場所セレクトボックス設定
function setupPlaceSelect() {
  const select = document.getElementById('placeSelect');
  if (!select) return;
  const places = Array.from(new Set(foods.map(f => f.place))).sort();
  places.forEach(place => {
    const opt = document.createElement('option');
    opt.value = place;
    opt.textContent = place;
    select.appendChild(opt);
  });
}

// 検索画面のイベント
function initSearchViews() {
  // キーワード検索
  const keywordInput = document.getElementById('keywordInput');
  const keywordResults = document.getElementById('keywordResults');
  const keywordNoResults = document.getElementById('keywordNoResults');

  if (keywordInput && keywordResults && keywordNoResults) {
    function updateKeyword() {
      const kw = keywordInput.value.trim().toLowerCase();
      let results = foods;
      if (kw) {
        results = foods.filter(f =>
          f.place.toLowerCase().includes(kw) ||
          f.date.toLowerCase().includes(kw)
        );
      }
      renderCards(keywordResults, results);
      keywordNoResults.style.display = results.length ? 'none' : 'block';
    }
    keywordInput.addEventListener('input', updateKeyword);
    updateKeyword();
  }

  // 場所検索（セレクト）
  const placeSelect = document.getElementById('placeSelect');
  const placeResults = document.getElementById('placeResults');
  const placeNoResults = document.getElementById('placeNoResults');

  if (placeSelect && placeResults && placeNoResults) {
    function updatePlace() {
      const place = placeSelect.value;
      const results = place ? foods.filter(f => f.place === place) : [];
      renderCards(placeResults, results);
      placeNoResults.style.display = results.length ? 'none' : 'block';
    }
    placeSelect.addEventListener('change', updatePlace);
  }

  // 日付検索
  const dateInput = document.getElementById('dateInput');
  const dateResults = document.getElementById('dateResults');
  const dateNoResults = document.getElementById('dateNoResults');

  if (dateInput && dateResults && dateNoResults) {
    function updateDate() {
      const d = dateInput.value;
      const results = d ? foods.filter(f => f.date === d) : [];
      renderCards(dateResults, results);
      dateNoResults.style.display = results.length ? 'none' : 'block';
    }
    dateInput.addEventListener('change', updateDate);
  }

  // 地域ビュー（九州・関東など）の県ボタン
  setupRegionButtons('view-kyushu', 'kyushuResults', 'kyushuNoResults');
  setupRegionButtons('view-kanto',  'kantoResults',  'kantoNoResults');
}

// 地域ビュー内の県ボタン共通処理
function setupRegionButtons(sectionId, resultsId, noResultsId) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const buttons = section.querySelectorAll('.btn-pref');
  const results = document.getElementById(resultsId);
  const noResults = document.getElementById(noResultsId);

  if (!buttons.length || !results || !noResults) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const pref = btn.dataset.pref; // CSVの place に含めておく文字列
      const list = foods.filter(f => f.place.includes(pref));
      renderCards(results, list);
      noResults.style.display = list.length ? 'none' : 'block';
    });
  });
}

// ボタンで画面切り替え（data-target="home" など）
function setupViewButtons() {
  document.querySelectorAll('[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      showView(target);
    });
  });
}

// 日本地図クリック → 地域ビューへ
function setupJapanMapClick() {
  const areas = document.querySelectorAll('map[name="japanMap"] area[data-region]');
  areas.forEach(area => {
    area.addEventListener('click', (e) => {
      e.preventDefault();
      const region = area.dataset.region;
      switch (region) {
        case 'kyushu':
          showView('kyushu');
          break;
        case 'kanto':
          showView('kanto');
          break;
        // 他の地域を追加するときはここに case を足す
        case 'hokkaido':
          // showView('hokkaido');
          break;
        case 'tohoku':
          // showView('tohoku');
          break;
        case 'chubu':
          // showView('chubu');
          break;
        case 'kinki':
          // showView('kinki');
          break;
        case 'chugoku':
          // showView('chugoku');
          break;
        case 'shikoku':
          // showView('shikoku');
          break;
      }
    });
  });
}

// DOM 準備完了時に初期化
document.addEventListener('DOMContentLoaded', () => {
  setupViewButtons();
  setupJapanMapClick();
  loadFoodsFromCSV();
});
