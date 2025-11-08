import { db } from './db.js';

const sozfaList = document.getElementById('sozfa-list');
const searchBox = document.getElementById('search-box');
const categoriesDiv = document.getElementById('categories');

let açıkDetay = null;

// Tüm kategorileri al
const kategoriListesi = Object.keys(db);

// Kategorileri buton olarak göster
kategoriListesi.forEach(kategori => {
    const kategoriBtn = document.createElement('button');
    kategoriBtn.textContent = kategori;
    kategoriBtn.style.margin = "5px";
    kategoriBtn.style.padding = "10px";
    kategoriBtn.style.border = "1px solid #ddd";
    kategoriBtn.style.cursor = "pointer";
    kategoriBtn.style.backgroundColor = "#f9f9f9";
    kategoriBtn.style.fontSize = "16px";
    kategoriBtn.addEventListener('click', () => {
        listeyiGüncelle("", kategori); // Belirli kategoriyi göster
    });
    categoriesDiv.appendChild(kategoriBtn);
});

// Tüm kelimeleri ve kategorileri birleştir
const tümKelimeler = Object.entries(db).flatMap(([kategori, kelimeler]) => 
    kelimeler.map(kelime => ({ ...kelime, kategori }))
);

// Listeyi yeniden oluşturma işlevi
function listeyiGüncelle(filtre = "", kategoriFiltre = null) {
    sozfaList.innerHTML = ""; // Mevcut listeyi temizle

    tümKelimeler
        .filter(item => {
            const kategoriEşleşmesi = kategoriFiltre ? item.kategori === kategoriFiltre : true;
            const aramaEşleşmesi = item.sozfa.includes(filtre) || item.kategori.includes(filtre);
            return kategoriEşleşmesi && aramaEşleşmesi;
        }) // Hem kategori hem arama filtresini uygula
        .forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<strong><span>${item.sozfa}</strong></span>`;
            li.style.cursor = "pointer";

            // Detay paneli oluştur
            const detailsDiv = document.createElement('div');
            detailsDiv.innerHTML = `
                <p><strong>${item.anlam}</strong></p>
                <p>
                اوقینش :  ${item.soztr} &nbsp;&nbsp;|&nbsp;&nbsp;
                  تور : ${item.türü} &nbsp;&nbsp;|&nbsp;&nbsp;  
                 نمبر : ${item.id} &nbsp;&nbsp;|&nbsp;&nbsp; 

                  <a href="https://wa.me/5380264262?text=سلام  لغت ${item.id}  غلط " target="_blank"> 
                  بیلدیر
                  </a>
                
                 </p>
            `;
            detailsDiv.style.display = "none"; // Başlangıçta gizli
            detailsDiv.style.padding = "10px 10px 0px 10px";
            detailsDiv.style.border = "1px solid #ddd";
            detailsDiv.style.backgroundColor = "#f9f9f9";

            // Tıklama olayını ayarla
            li.addEventListener('click', () => {
                if (açıkDetay && açıkDetay !== detailsDiv) {
                    açıkDetay.style.display = "none"; // Önceki detayı kapat
                }
                detailsDiv.style.display = detailsDiv.style.display === "none" ? "block" : "none";
                açıkDetay = detailsDiv.style.display === "block" ? detailsDiv : null;
            });

            // Liste elemanını ve detaylarını ekle
            sozfaList.appendChild(li);
            sozfaList.appendChild(detailsDiv);
        });
}

// Arama olayını ekle
searchBox.addEventListener('input', () => {
    const arama = searchBox.value.trim();
    listeyiGüncelle(arama); // Listeyi aramaya göre güncelle
});

// Başlangıçta tüm kelimeleri göster
listeyiGüncelle();
