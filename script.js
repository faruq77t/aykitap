let books = [];
const booksPerPage = 18;
let currentPage = 1;
let totalPages = 1;
let selectedCategory = null;
let currentLetterFilter = null; // Yeni: Alfabetik filtre

// İndirme çubuğu elementleri
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

// Sayfa yüklendiğinde başlatıcılar
document.addEventListener('DOMContentLoaded', function () {
    // İndirme çubuğu başlangıcı
    if (progressContainer) {
        progressContainer.style.display = 'block';
        progressBar.style.width = '10%';
        progressText.textContent = 'Yükleniyor... %10';
    }

    // Local Data Fallback 
    if (typeof booksData !== 'undefined') {
        booksData.kategoriler.forEach(cat => {
            cat.kitaplar.forEach(book => {
                if (book.kitap_resmi.startsWith('/')) book.kitap_resmi = book.kitap_resmi.substring(1);
                if (book.kitap_baglanti.startsWith('/')) book.kitap_baglanti = book.kitap_baglanti.substring(1);
            });
        });

        books = booksData.kategoriler;
        const allBooks = books.flatMap((kategori) => kategori.kitaplar);
        books.unshift({ kategori_adi: "تمــــــــــــــــامی", kitaplar: allBooks });

        populateCategories(allBooks); // Güncellendi: allBooks parametresi eklendi

        selectedCategory = books[0].kitaplar;
        currentPage = 1;
        totalPages = Math.ceil(selectedCategory.length / booksPerPage);
        renderBooks();
        renderPagination();

        if (progressBar) {
            progressBar.style.width = '100%';
            progressText.textContent = 'Tamamlandı!';
        }
        setTimeout(() => { if (progressContainer) progressContainer.style.display = 'none'; }, 500);
    }

    // Dropdown ve Menu Aktiviteleri
    const dropdown = document.getElementById("dropdown");
    const dropdownContent = document.getElementById("categoryDropdown");
    const dropdownBtn = document.getElementById("dropdownBtn");

    if (dropdown && dropdownContent) {
        dropdown.addEventListener("mouseenter", () => { dropdownContent.style.display = "block"; });
        dropdown.addEventListener("mouseleave", () => { dropdownContent.style.display = "none"; });
    }

    if (dropdownBtn && dropdownContent) {
        dropdownBtn.addEventListener("click", () => {
            dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
        });
    }

    // Mobil Menü Toggle
    const menuToggle = document.getElementById('menuToggle');
    const popupMenu = document.getElementById('popupMenu');

    if (menuToggle && popupMenu) {
        menuToggle.addEventListener('click', () => {
            popupMenu.style.display = (popupMenu.style.display === 'block' ? 'none' : 'block');
        });

        document.addEventListener('click', (event) => {
            if (!menuToggle.contains(event.target) && !popupMenu.contains(event.target)) {
                popupMenu.style.display = 'none';
            }
        });
    }
});

function populateCategories(allBooks) {
    const btnContainer = document.getElementById("category-buttons");
    if (!btnContainer) return;

    btnContainer.innerHTML = "";

    // Kategoriler
    books.forEach((category, index) => {
        const btn = document.createElement("button");
        btn.textContent = category.kategori_adi;
        if (index === 0) btn.classList.add('active'); // "Tümü" default aktif

        btn.addEventListener("click", () => {
            document.querySelectorAll('.category-buttons button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentLetterFilter = null;
            selectCategory(index);
        });
        btnContainer.appendChild(btn);
    });
}

function selectCategory(index) {
    selectedCategory = books[index].kitaplar;
    currentPage = 1;
    totalPages = Math.ceil(selectedCategory.length / booksPerPage);
    renderBooks();
    renderPagination();
    closeDropdown();
}

function closeDropdown() {
    const dropdownContent = document.getElementById("categoryDropdown");
    dropdownContent.style.display = "none";
    const dropdownBtn = document.getElementById("dropdownBtn");
    dropdownBtn.textContent = "▾ دســته لار";
}

let searchTerm = "";

function renderBooks() {
    const bookList = document.getElementById("book-list");
    bookList.innerHTML = "";

    let booksToShow = selectedCategory
        ? selectedCategory
        : books.flatMap((kategori) => kategori.kitaplar);

    // Alfabetik Filtreleme
    if (currentLetterFilter) {
        booksToShow = booksToShow.filter(book =>
            book.kitap_adi.trim().startsWith(currentLetterFilter)
        );
    }

    // Arama filtrelemesi
    if (searchTerm) {
        booksToShow = booksToShow.filter(book =>
            book.kitap_adi.toLowerCase().includes(searchTerm) ||
            book.yazar_adi.toLowerCase().includes(searchTerm)
        );
    }

    const start = (currentPage - 1) * booksPerPage;
    const end = start + booksPerPage;
    const booksToDisplay = booksToShow.slice(start, end);

    if (booksToDisplay.length === 0) {
        bookList.innerHTML = `<div class="no-results">هیچ کتابی تاپیل مادی...</div>`;
        return;
    }

    booksToDisplay.forEach((book) => {
        const bookDiv = document.createElement("div");
        bookDiv.className = "book-card";
        bookDiv.innerHTML = `
            <div class="card-preview">
                <img src="${book.kitap_resmi}" alt="${book.kitap_adi}" loading="lazy">
            </div>
            <div class="card-info">
                <h3>${book.kitap_adi}</h3>
                <div class="card-meta">
                    <span class="badge author">${book.yazar_adi}</span>
                    <span class="badge pages">${book.sayfa_sayisi} صفحه</span>
                </div>
            </div>
        `;
        bookDiv.addEventListener("click", () => showPopup(book));
        bookList.appendChild(bookDiv);
    });
}

function renderPagination() {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    let booksToShow = selectedCategory
        ? selectedCategory
        : books.flatMap((kategori) => kategori.kitaplar);

    if (currentLetterFilter) {
        booksToShow = booksToShow.filter(book =>
            book.kitap_adi.trim().startsWith(currentLetterFilter)
        );
    }

    if (searchTerm) {
        booksToShow = booksToShow.filter(book =>
            book.kitap_adi.toLowerCase().includes(searchTerm) ||
            book.yazar_adi.toLowerCase().includes(searchTerm)
        );
    }

    totalPages = Math.ceil(booksToShow.length / booksPerPage);

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement("span");
        pageBtn.textContent = i;
        pageBtn.className = i === currentPage ? "active" : "";
        pageBtn.addEventListener("click", () => goToPage(i));
        pagination.appendChild(pageBtn);
    }
}

// Arama girişi dinleyici
document.addEventListener('input', (e) => {
    if (e.target.id === 'searchInput' || e.target.id === 'searchInputMobile') {
        searchTerm = e.target.value.toLowerCase();
        currentPage = 1;
        renderBooks();
        renderPagination();

        // Senkronizasyon (PC ve Mobil arama kutuları arasında)
        const otherId = e.target.id === 'searchInput' ? 'searchInputMobile' : 'searchInput';
        const otherInput = document.getElementById(otherId);
        if (otherInput) otherInput.value = e.target.value;
    }
});

function goToPage(pageNumber) {
    currentPage = pageNumber;
    renderBooks();
    renderPagination();
}

// Kitap indirme fonksiyonu - book objesi ile
function downloadBook(book) {
    // Progress bar'ı göster
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    progressBar.style.backgroundColor = '#4CAF50';
    progressText.textContent = 'İndirme başlatılıyor... %0';

    fetch(book.kitap_baglanti)
        .then(response => {
            if (!response.ok) {
                throw new Error('Dosya indirilemedi');
            }

            const contentLength = response.headers.get('content-length');
            const total = parseInt(contentLength, 10);
            let loaded = 0;

            return new Response(
                new ReadableStream({
                    start(controller) {
                        const reader = response.body.getReader();

                        function read() {
                            return reader.read().then(({ done, value }) => {
                                if (done) {
                                    controller.close();
                                    return;
                                }

                                loaded += value.length;

                                // Progress güncelleme
                                if (total) {
                                    const percent = Math.round((loaded / total) * 100);
                                    progressBar.style.width = percent + '%';
                                    progressText.textContent = `کتاب ایندرلیور... %${percent}`;
                                } else {
                                    // Content-length yoksa tahmini progress
                                    const percent = Math.min(loaded / 1000000 * 100, 99);
                                    progressBar.style.width = percent + '%';
                                    progressText.textContent = `کتاب ایندرلیور... ~%${Math.round(percent)}`;
                                }

                                controller.enqueue(value);
                                return read();
                            });
                        }

                        read();
                    }
                })
            );
        })
        .then(response => response.blob())
        .then(blob => {
            // İndirme tamamlandı
            progressBar.style.width = '100%';
            progressText.textContent = 'کتاب ایندرلیدی..!';

            // Blob'u indirme linki olarak oluştur
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;

            // Dosya adını kitap_adi ile tam olarak aynı yap
            const fileName = book.kitap_adi + '.pdf';
            a.download = fileName;

            document.body.appendChild(a);
            a.click();

            // Temizlik
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // 2 saniye sonra progress bar'ı gizle
            setTimeout(() => {
                progressContainer.style.display = 'none';
            }, 2000);
        })
        .catch(error => {
            console.error('کتاب ایندرلمیور...! خطا:', error);
            progressText.textContent = 'Direkt indiriliyor...';

            // Fallback: Direkt indirme
            const a = document.createElement('a');
            a.href = book.kitap_baglanti;
            a.download = book.kitap_adi + '.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setTimeout(() => {
                progressContainer.style.display = 'none';
                progressBar.style.backgroundColor = '#4CAF50';
            }, 1000);
        });
}

function showPopup(book) {
    const popup = document.getElementById("popup");
    const popupBookDetails = document.getElementById("popup-book-details");

    // Book objesini string'e çevirerek güvenli şekilde iletiyoruz
    const bookData = JSON.stringify(book).replace(/"/g, '&quot;');

    popupBookDetails.innerHTML = `
        <img src="${book.kitap_resmi}" alt="${book.kitap_adi}">
        <h2>${book.kitap_adi}</h2>
        <p>یازار: ${book.yazar_adi}</p>
        <p>صفحه سانی: ${book.sayfa_sayisi}</p>

        <div class="popup-actions">
            <a class="download-btn" onclick="downloadBook(${bookData})">
            کتابی ایندر
            </a>
            <a href="https://wa.me/5380264262?text=سلام آی کتاب دان گیلدیم." target="_blank" class="whatsapp-btn"> 
            کتاب یوله
            </a>
        </div>
    `;

    popup.style.display = "flex";
}

function closePopup() {
    const popup = document.getElementById("popup");
    popup.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
    const dropdown = document.getElementById("dropdown");
    const dropdownContent = document.getElementById("categoryDropdown");

    dropdown.addEventListener("mouseenter", () => {
        dropdownContent.style.display = "block";
    });

    dropdown.addEventListener("mouseleave", () => {
        dropdownContent.style.display = "none";
    });

    const dropdownBtn = document.getElementById("dropdownBtn");
    dropdownBtn.addEventListener("click", () => {
        dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
    });

    dropdownContent.addEventListener("mouseleave", () => {
        dropdownContent.style.display = "none";
    });
});

// menu mobel-------------------------
const menuToggle = document.getElementById('menuToggle');
const popupMenu = document.getElementById('popupMenu');

menuToggle.addEventListener('click', () => {
    popupMenu.style.display = (popupMenu.style.display === 'block' ? 'none' : 'block');
});

document.addEventListener('click', (event) => {
    if (!menuToggle.contains(event.target) && !popupMenu.contains(event.target)) {
        popupMenu.style.display = 'none';
    }
});
// menu mobel-------------------------