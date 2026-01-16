function loadComponent(componentPath, elementId, callback) {
    // Mevcut konumu belirle (alt klasörde miyizi kontrol et)
    const isSubDir = window.location.pathname.includes('/sozluk/') ||
        window.location.pathname.includes('/nakillar/') ||
        window.location.pathname.includes('/404/');
    const basePrefix = isSubDir ? '../' : '';

    // Check for local data first (fixes file:/// issues)
    if (typeof hfComponents !== 'undefined') {
        const componentName = componentPath.split('/').pop().replace('.html', '');
        let data = hfComponents[componentName];
        // Fallback for "header" vs "ust" naming if needed, though exact names match well

        if (data) {
            // Template içindeki {{base}} veya ../ gibi yolları düzelt
            let fixedData = data.replace(/\.\.\/img\//g, basePrefix + 'img/');
            fixedData = fixedData.replace(/href="\//g, 'href="' + basePrefix); // /sozluk -> ../sozluk

            document.getElementById(elementId).innerHTML = fixedData;
            if (callback) setTimeout(callback, 50);
            return;
        }
    }

    fetch(componentPath)
        .then(response => {
            if (!response.ok) throw new Error('Dosya bulunamadı: ' + componentPath);
            return response.text();
        })
        .then(data => {
            // Template içindeki {{base}} veya ../ gibi yolları düzelt
            let fixedData = data.replace(/\.\.\/img\//g, basePrefix + 'img/');
            fixedData = fixedData.replace(/href="\//g, 'href="' + basePrefix); // /sozluk -> ../sozluk

            document.getElementById(elementId).innerHTML = fixedData;
            if (callback) setTimeout(callback, 50);
        })
        .catch(error => console.error('Yükleme hatası:', error));
}

// === MOBİL MENÜ YÖNETİMİ ===
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.getElementById('nav-hamburger');

    if (!hamburger || !navMenu) {
        console.error('Mobil menü elementleri bulunamadı!');
        return false;
    }

    // Hamburger tıklama eventi
    hamburger.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleMobileMenu();
    });

    // Menüyü aç/kapa fonksiyonu
    function toggleMobileMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';

        if (navMenu.classList.contains('active')) {
            document.addEventListener('click', closeMenuOnClickOutside);
        } else {
            document.removeEventListener('click', closeMenuOnClickOutside);
        }
    }

    // Dışarı tıklayınca menüyü kapat
    function closeMenuOnClickOutside(e) {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
            closeMobileMenu();
        }
    }

    // Menüyü kapat
    function closeMobileMenu() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
        document.removeEventListener('click', closeMenuOnClickOutside);
    }

    // Menü linklerine tıklayınca kapat
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            if (!this.getAttribute('href')?.startsWith('http')) {
                closeMobileMenu();
            }
        });
    });

    // ESC tuşu ile kapat
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    console.log('Mobil menü başarıyla yüklendi!');
    return true;
}

// === HEADER YÜKLENDİKTEN SONRA ===
function initHeader() {
    let attempts = 0;
    const maxAttempts = 3;

    const tryInit = setInterval(() => {
        attempts++;
        if (initMobileMenu()) {
            clearInterval(tryInit);
            console.log('Mobil menü aktif!');
        } else if (attempts >= maxAttempts) {
            clearInterval(tryInit);
            console.warn('Mobil menü yüklenemedi!');
        }
    }, 100);
}

// === SAYFA YÜKLENDİĞİNDE ===
document.addEventListener('DOMContentLoaded', function () {
    console.log('Sayfa yükleniyor...');

    // Mevcut konumu belirle (alt klasörde miyizi kontrol et)
    const isSubDir = window.location.pathname.includes('/sozluk/') ||
        window.location.pathname.includes('/nakillar/') ||
        window.location.pathname.includes('/404/');
    const pathPrefix = isSubDir ? '../hf/' : 'hf/';

    // Önce header'ı yükle
    loadComponent(pathPrefix + 'header.html', 'header-container', function () {
        // Header yüklendikten sonra mobil menüyü başlat
        initHeader();
    });

    // Footer'ı yükle
    loadComponent(pathPrefix + 'footer.html', 'footer-container');
});

// === SAYFA TAMAMEN YÜKLENDİĞİNDE ===
window.addEventListener('load', function () {
    console.log('Sayfa tamamen yüklendi!');
});