import asyncio
import time
from typing import Optional, Dict, Any
from urllib.parse import urlparse
import httpx
from app.config import settings
from app.utils.logger import logger
from app.services.crawler.validator import is_safe_url, normalize_url
from app.services.crawler.robots import is_allowed_by_robots

# Maximum response content length to avoid memory exhaustion (5MB)
MAX_CONTENT_LENGTH = 5 * 1024 * 1024

# Non-HTML / media content types to ignore
IGNORED_CONTENT_TYPES = (
    "application/pdf",
    "application/zip",
    "application/octet-stream",
    "application/msword",
    "application/vnd.openxmlformats-officedocument",
    "image/",
    "video/",
    "audio/",
)


class BaseCrawler:
    """
    Base crawler providing safe, async HTTP fetching with:
    - User-Agent: SCM-NewsMonitor/1.0
    - Robots.txt enforcement
    - SSRF prevention & validation
    - Max response size cap
    - Content-type filtering
    - Exponential backoff retry
    - Per-domain rate limiting
    """

    def __init__(
        self,
        user_agent: str = "SCM-NewsMonitor/1.0",
        timeout: float = 15.0,
        rate_limit_delay: float = 1.0,
        max_retries: int = 3
    ):
        self.user_agent = user_agent
        self.timeout = timeout
        self.rate_limit_delay = rate_limit_delay
        self.max_retries = max_retries
        self._last_domain_request: Dict[str, float] = {}

    def _get_headers(self) -> Dict[str, str]:
        return {
            "User-Agent": self.user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "id,en-US;q=0.9,en;q=0.8",
        }

    async def _throttle_domain(self, domain: str):
        """Ensure rate limit delay between requests to the same domain."""
        now = time.time()
        if domain in self._last_domain_request:
            elapsed = now - self._last_domain_request[domain]
            if elapsed < self.rate_limit_delay:
                await asyncio.sleep(self.rate_limit_delay - elapsed)
        self._last_domain_request[domain] = time.time()

    async def fetch(self, url: str) -> Optional[str]:
        """
        Safely fetch textual content from a URL.
        Returns text or None if fetch fails or content is not allowed/valid.
        """
        # 1. SSRF & Scheme safety check
        safe, reason = is_safe_url(url)
        if not safe:
            logger.warning(f"[BaseCrawler] Blocked unsafe URL {url}: {reason}")
            return None

        # 2. Robots.txt check
        if not await is_allowed_by_robots(url, user_agent=self.user_agent):
            logger.warning(f"[BaseCrawler] Blocked by robots.txt: {url}")
            return None

        parsed = urlparse(url)
        domain = f"{parsed.scheme}://{parsed.netloc}"
        await self._throttle_domain(domain)

        headers = self._get_headers()
        backoff = 1.0

        for attempt in range(1, self.max_retries + 1):
            try:
                async with httpx.AsyncClient(
                    timeout=self.timeout,
                    headers=headers,
                    follow_redirects=True,
                    limits=httpx.Limits(max_keepalive_connections=5, max_connections=10)
                ) as client:
                    async with client.stream("GET", url) as response:
                        if response.status_code != 200:
                            logger.warning(f"[BaseCrawler] HTTP {response.status_code} for {url}")
                            return None

                        content_type = response.headers.get("content-type", "").lower()
                        for ignored in IGNORED_CONTENT_TYPES:
                            if ignored in content_type:
                                logger.info(f"[BaseCrawler] Skipping media/binary {content_type} for {url}")
                                return None

                        content_length = response.headers.get("content-length")
                        if content_length and int(content_length) > MAX_CONTENT_LENGTH:
                            logger.warning(f"[BaseCrawler] Content-Length exceeds limit for {url}")
                            return None

                        # Read body stream safely with size cap
                        body_chunks = []
                        total_bytes = 0
                        async for chunk in response.aiter_bytes():
                            total_bytes += len(chunk)
                            if total_bytes > MAX_CONTENT_LENGTH:
                                logger.warning(f"[BaseCrawler] Download aborted (> {MAX_CONTENT_LENGTH} bytes): {url}")
                                return None
                            body_chunks.append(chunk)

                        body = b"".join(body_chunks)
                        encoding = response.encoding or "utf-8"
                        try:
                            return body.decode(encoding, errors="replace")
                        except Exception:
                            return body.decode("utf-8", errors="replace")

            except (httpx.RequestError, httpx.TimeoutException) as e:
                logger.warning(f"[BaseCrawler] Attempt {attempt}/{self.max_retries} failed for {url}: {e}")
                if attempt < self.max_retries:
                    await asyncio.sleep(backoff)
                    backoff *= 2.0
                else:
                    return None
            except Exception as e:
                logger.error(f"[BaseCrawler] Unexpected error fetching {url}: {e}")
                return None

        return None
