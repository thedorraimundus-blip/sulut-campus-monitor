import httpx
import feedparser

sources = [
    ('Tribun Manado', 'https://manado.tribunnews.com', 'https://manado.tribunnews.com/rss'),
    ('BeritaManado', 'https://beritamanado.com', 'https://beritamanado.com/feed/'),
    ('Manado Post', 'https://manadopost.jawapos.com', 'https://manadopost.jawapos.com/feed'),
    ('ZonAutara', 'https://zonautara.com', 'https://zonautara.com/feed/'),
    ('Manado Terkini', 'https://manadoterkini.com', 'https://manadoterkini.com/feed/'),
    ('Manado News', 'https://manadonews.co.id', 'https://manadonews.co.id/feed/'),
    ('Sulut Review', 'https://sulutreview.com', 'https://sulutreview.com/feed/'),
    ('Bicara Manado', 'https://bicaramanado.com', 'https://bicaramanado.com/feed/'),
    ('Unsrat Official', 'https://www.unsrat.ac.id', 'https://www.unsrat.ac.id/feed/'),
    ('Unima Official', 'https://unima.ac.id', 'https://unima.ac.id/feed/'),
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

for name, base_url, rss_url in sources:
    try:
        r_base = httpx.get(base_url, headers=headers, timeout=6.0, follow_redirects=True)
        rss_status = "N/A"
        rss_count = 0
        try:
            r_rss = httpx.get(rss_url, headers=headers, timeout=6.0, follow_redirects=True)
            rss_status = str(r_rss.status_code)
            feed = feedparser.parse(r_rss.text)
            rss_count = len(feed.entries)
        except Exception as rexc:
            rss_status = f"Err: {rexc}"
        print(f"{name:<20} | Base HTTP {r_base.status_code} | RSS HTTP {rss_status} ({rss_count} items)")
    except Exception as e:
        print(f"{name:<20} | Base ERROR: {e}")
