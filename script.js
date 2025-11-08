let books = [];
const booksPerPage = 18;
let currentPage = 1;
let totalPages = 1;
let selectedCategory = null;

// İndirme çubuğu elementleri
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

// Sayfa yüklendiğinde indirme çubuğunu göster
document.addEventListener('DOMContentLoaded', function() {
  progressContainer.style.display = 'block';
  progressBar.style.width = '10%';
  progressText.textContent = 'Yükleniyor... %10';

  fetch("veri.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error('Veri yüklenirken hata oluştu');
      }
      
      const contentLength = response.headers.get('content-length');
      const total = parseInt(contentLength, 10);
      
      // Eğer content-length yoksa basit bir progress göster
      if (!total) {
        progressBar.style.width = '30%';
        progressText.textContent = 'Yükleniyor... %30';
        return response.json();
      }
      
      let loaded = 0;
      const reader = response.body.getReader();
      const chunks = [];
      
      function read() {
        return reader.read().then(({ done, value }) => {
          if (done) {
            return chunks;
          }
          
          loaded += value.length;
          const progress = 30 + Math.round((loaded / total) * 60); // 30-90% arası
          
          // İndirme çubuğunu güncelle
          progressBar.style.width = progress + '%';
          progressText.textContent = `Yükleniyor... %${progress}`;
          
          chunks.push(value);
          return read();
        });
      }
      
      return read();
    })
    .then(chunks => {
      if (chunks) {
        // Byte'ları birleştir
        const blob = new Blob(chunks);
        return blob.text();
      }
      return null;
    })
    .then(text => {
      const data = text ? JSON.parse(text) : null;
      
      if (!data) {
        // Basit fetch için progress
        progressBar.style.width = '80%';
        progressText.textContent = 'Yükleniyor... %80';
        
        return fetch("veri.json").then(response => response.json());
      }
      return data;
    })
    .then((data) => {
      books = data.kategoriler;
      
      // Tümü kategorisini ekleyelim
      const allBooks = books.flatMap((kategori) => kategori.kitaplar);
      books.unshift({ kategori_adi: "تمــــــــــــــــامی", kitaplar: allBooks });
      
      // İndirme tamamlandı
      progressBar.style.width = '100%';
      progressText.textContent = 'Yükleme tamamlandı!';
      
      // 1 saniye sonra çubuğu gizle
      setTimeout(() => {
        progressContainer.style.display = 'none';
      }, 1000);
      
      populateCategories();

      // Varsayılan olarak "Tümü" kategorisini seç
      selectedCategory = books[0].kitaplar;
      currentPage = 1;
      totalPages = Math.ceil(selectedCategory.length / booksPerPage);
      renderBooks();
      renderPagination();
    })
    .catch((error) => {
      console.error('Hata:', error);
      progressText.textContent = 'Yükleme hatası!';
      progressBar.style.backgroundColor = '#ff4444';
      
      // Hata durumunda 3 saniye sonra gizle
      setTimeout(() => {
        progressContainer.style.display = 'none';
      }, 3000);
    });
});

function populateCategories() {
  const categoryDropdown = document.getElementById("categoryDropdown");
  categoryDropdown.innerHTML = "";

  books.forEach((category, index) => {
    const categoryItem = document.createElement("a");
    categoryItem.textContent = category.kategori_adi;
    categoryItem.addEventListener("click", () => selectCategory(index));
    categoryDropdown.appendChild(categoryItem);
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

function renderBooks() {
  const bookList = document.getElementById("book-list");
  bookList.innerHTML = "";

  let booksToShow = selectedCategory
    ? selectedCategory
    : books.flatMap((kategori) => kategori.kitaplar);

  const start = (currentPage - 1) * booksPerPage;
  const end = start + booksPerPage;
  booksToShow = booksToShow.slice(start, end);

  booksToShow.forEach((book) => {
    const bookDiv = document.createElement("div");
    bookDiv.className = "book";
    bookDiv.innerHTML = `
            <img src="${book.kitap_resmi}" alt="${book.kitap_adi}" loading="lazy">
            <h3>${book.kitap_adi}</h3>
            <p>${book.yazar_adi}</p>
            <p>${book.sayfa_sayisi}:صفحه</p>
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
  totalPages = Math.ceil(booksToShow.length / booksPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("span");
    pageBtn.textContent = i;
    pageBtn.className = i === currentPage ? "active" : "";
    pageBtn.addEventListener("click", () => goToPage(i));
    pagination.appendChild(pageBtn);
  }
}

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
                  progressText.textContent = `İndiriliyor... %${percent}`;
                } else {
                  // Content-length yoksa tahmini progress
                  const percent = Math.min(loaded / 1000000 * 100, 99);
                  progressBar.style.width = percent + '%';
                  progressText.textContent = `İndiriliyor... ~%${Math.round(percent)}`;
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
      progressText.textContent = 'İndirme tamamlandı!';
      
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
      console.error('İndirme hatası:', error);
      progressText.textContent = 'İndirme hatası!';
      progressBar.style.backgroundColor = '#ff4444';
      
      // Hata durumunda 3 saniye sonra gizle
      setTimeout(() => {
        progressContainer.style.display = 'none';
        progressBar.style.backgroundColor = '#4CAF50';
      }, 3000);
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

        <a class="download-btn" onclick="downloadBook(${bookData})">
         کتابی ایندر
        </a>
        <a href="https://wa.me/5380264262?text=سلام آی کتاب دان گیلدیم." target="_blank" class="whatsapp-btn"> 
         کتاب یوله
        </a>
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