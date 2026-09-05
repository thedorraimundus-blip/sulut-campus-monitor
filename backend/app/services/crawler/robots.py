import time
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser
import httpx
from app.config import settings
from app.utils.logger import logger

_ROBOTS_CACHE: dict[str, tuple[RobotFileParser, float]] = {}
CACHE_TTL = 3600  # 1 hour


async def is_allowed_by_robots(url: str, user_agent: str = "SCM-NewsMonitor/1.0") -> bool:
    """
    Check if crawling the URL is allowed by the domain's robots.txt.
    Caches robots.txt per domain for 1 hour.
    """
    try:
        parsed = urlparse(url)
        domain = f"{parsed.scheme}://{parsed.netloc}"
        now = time.time()

        if domain in _ROBOTS_CACHE:
            rp, ts = _ROBOTS_CACHE[domain]
            if now - ts < CACHE_TTL:
                return rp.can_fetch(user_agent, url)

        robots_url = f"{domain}/robots.txt"
        rp = RobotFileParser()

        async with httpx.AsyncClient(timeout=10.0, headers={"User-Agent": user_agent}, follow_redirects=True) as client:
            resp = await client.get(robots_url)
            if resp.status_code == 200:
                rp.parse(resp.text.splitlines())
            else:
                # If robots.txt returns 404 or fails, standard convention is that crawling is allowed
                rp.allow_all = True

        _ROBOTS_CACHE[domain] = (rp, now)
        return rp.can_fetch(user_agent, url)

    except Exception as e:
        logger.warning(f"Could not verify robots.txt for {url}: {e}. Defaulting to allowed.")
        return True
