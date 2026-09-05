import pytest
from app.services.crawler.validator import is_safe_url, normalize_url
from app.services.crawler.html_scraper import clean_html_with_soup


def test_url_validator_safe_http():
    safe, _ = is_safe_url("https://manadopost.jawapos.com/pendidikan")
    assert safe is True


def test_url_validator_blocks_ssrf():
    # Localhost and loopback must be rejected
    safe1, _ = is_safe_url("http://localhost:8000/admin")
    assert safe1 is False

    safe2, _ = is_safe_url("http://127.0.0.1:8080/secret")
    assert safe2 is False

    safe3, _ = is_safe_url("ftp://example.com/file")
    assert safe3 is False


def test_url_normalizer_strips_tracking():
    raw_url = "https://beritamanado.com/berita-unsrat/?utm_source=facebook&utm_campaign=promo&ref=123"
    norm = normalize_url(raw_url)
    assert "utm_source" not in norm
    assert "utm_campaign" not in norm
    assert "ref" not in norm
    assert norm == "https://beritamanado.com/berita-unsrat"


def test_html_cleaner_removes_boilerplate():
    raw_html = """
    <html>
        <head><title>Prestasi Unsrat Manado</title></head>
        <body>
            <nav><a href="/">Home</a><a href="/news">Berita</a></nav>
            <script>alert('ad');</script>
            <main>
                <h1>Mahasiswa Unsrat Raih Medali Emas</h1>
                <p>Mahasiswa Universitas Sam Ratulangi berhasil menorehkan prestasi gemilang di tingkat nasional dengan membawa pulang medali emas bidang robotika.</p>
                <p>Dekan memberikan apresiasi tinggi kepada seluruh anggota tim dan dosen pembimbing atas perjuangan mereka.</p>
            </main>
            <footer><p>Hak cipta dilindungi undang-undang</p></footer>
        </body>
    </html>
    """
    result = clean_html_with_soup(raw_html)
    assert "Prestasi Unsrat Manado" in result["title"]
    assert "Mahasiswa Universitas Sam Ratulangi" in result["content"]
    assert "alert" not in result["content"]
    assert "Home" not in result["content"]
