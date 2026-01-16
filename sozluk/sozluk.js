const sozfaList = document.getElementById('sozfa-list');
const searchBox = document.getElementById('search-box');
const categoriesDiv = document.getElementById('categories');

let tümKelimeler = [];
let filtrelenmisKelimeler = [];
let visibleCount = 50;
const ITEMS_PER_PAGE = 50;
let currentSearch = "";
let currentCategory = null;
let searchTimeout = null;

// JSON dosyasını yükle
async function verileriYukle() {
    try {
        if (typeof sozlukData === 'undefined') {
            throw new Error('Veri dosyası (db.js) yüklenemedi');
        }


        // Tüm kelimeleri birleştir ve sırala
        tümKelimeler = Object.entries(sozlukData).flatMap(([kategori, sozler]) =>
            sozler.map(soz => ({ ...soz, kategori }))
        ).sort((a, b) => a.sozfa.localeCompare(b.sozfa, 'tr'));

        // Başlangıçta listeyi hazırla
        yeniArama("");

    } catch (error) {
        console.error('Veri yükleme hatası:', error);
        sozfaList.innerHTML = `<li style="text-align: center; padding: 20px; color: red;">
            Veriler yüklenirken hata oluştu: ${error.message}
        </li>`;
    }
}



// Arama ve Sayfalama Mantığı
function yeniArama(aramaMetni) {
    currentSearch = aramaMetni.trim().toLowerCase();
    visibleCount = ITEMS_PER_PAGE;

    filtrelenmisKelimeler = tümKelimeler.filter(item => {
        const matchesSearch = !currentSearch || item.sozfa.toLowerCase().startsWith(currentSearch);
        return matchesSearch;
    });

    renderList();
    sozfaList.scrollTop = 0;
}

function renderList() {
    sozfaList.innerHTML = "";

    if (filtrelenmisKelimeler.length === 0) {
        sozfaList.innerHTML = `<li style="text-align: center; padding: 20px; color: var(--text-secondary);">
            Sonuç bulunamadı...
        </li>`;
        return;
    }

    const fragment = document.createDocumentFragment();
    const itemsToShow = filtrelenmisKelimeler.slice(0, visibleCount);

    itemsToShow.forEach((item, index) => {
        const li = document.createElement('li');
        const delay = Math.min(index * 0.03, 0.8);
        li.style.animationDelay = `${delay}s`;

        let displayWord = item.sozfa;
        if (currentSearch && item.sozfa.toLowerCase().startsWith(currentSearch)) {
            const len = currentSearch.length;
            displayWord = `<span style="color: var(--accent-violet); font-weight: bold;">${item.sozfa.substring(0, len)}</span>${item.sozfa.substring(len)}`;
        }

        li.innerHTML = `
            <p class="word-title">${displayWord}</p>
            <div class="details">
                <p class="meaning">${item.anlam}</p>
                <div class="meta-info">
                    <span>
                         اوقینش :  ${item.soztr} &nbsp;|&nbsp;
                         تور : ${item.türü} &nbsp;|&nbsp;  
                         نمبر : ${item.id}
                    </span>
                    <a href="https://wa.me/5380264262?text=سلام  لغت ${item.id}  غلط " target="_blank" onclick="event.stopPropagation()"> 
                    بیلدیر
                    </a>
                </div>
            </div>
        `;

        li.addEventListener('click', function () {
            this.classList.toggle('active');
        });

        fragment.appendChild(li);
    });

    sozfaList.appendChild(fragment);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'list-footer';
    footer.style.cssText = 'text-align: center; padding: 20px; color: var(--text-secondary); font-size: 14px;';

    if (visibleCount < filtrelenmisKelimeler.length) {
        const loadMore = document.createElement('button');
        loadMore.textContent = "Daha Fazla...";
        loadMore.className = 'load-more-btn';
        loadMore.onclick = () => {
            visibleCount += ITEMS_PER_PAGE;
            renderList();
        };
        footer.appendChild(loadMore);
    } else {
        footer.textContent = `${filtrelenmisKelimeler.length} kelime listeleniyor`;
    }

    sozfaList.appendChild(footer);
}

// Scroll ile otomatik yükleme
sozfaList.addEventListener('scroll', () => {
    if (sozfaList.scrollTop + sozfaList.clientHeight >= sozfaList.scrollHeight - 100) {
        if (visibleCount < filtrelenmisKelimeler.length) {
            visibleCount += ITEMS_PER_PAGE;
            renderList();
        }
    }
});

searchBox.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        yeniArama(searchBox.value);
    }, 300);
});

document.addEventListener('DOMContentLoaded', verileriYukle);