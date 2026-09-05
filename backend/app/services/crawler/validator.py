import ipaddress
import socket
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode


BLOCKED_HOSTNAMES = {"localhost", "127.0.0.1", "0.0.0.0", "::1", "intranet", "router"}
TRACKING_PARAMS = {"utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid", "ref"}


def is_safe_url(url: str) -> tuple[bool, str]:
    """
    Validate that the URL is safe to fetch:
    1. HTTP/HTTPS scheme only.
    2. Does not resolve to private/loopback/link-local IP addresses (SSRF protection).
    """
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return False, f"Invalid scheme: {parsed.scheme}. Only http and https are allowed."

        hostname = parsed.hostname
        if not hostname:
            return False, "Missing hostname in URL."

        if hostname.lower() in BLOCKED_HOSTNAMES:
            return False, f"Access to blocked hostname '{hostname}' is not permitted."

        # Resolve IP to protect against SSRF pointing to internal infrastructure
        try:
            ip_str = socket.gethostbyname(hostname)
            ip = ipaddress.ip_address(ip_str)
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
                return False, f"Target IP {ip_str} is in a restricted/private network range."
        except socket.gaierror:
            # Domain cannot be resolved; might be offline or DNS issue
            pass

        return True, "URL is safe"
    except Exception as e:
        return False, f"URL validation error: {str(e)}"


def normalize_url(url: str) -> str:
    """
    Normalize URL:
    - Lowercase scheme and netloc
    - Strip trailing slash
    - Remove tracking query parameters (utm_*, fbclid, etc.)
    """
    try:
        parsed = urlparse(url)
        # Filter tracking query parameters
        clean_queries = [
            (k, v) for k, v in parse_qsl(parsed.query, keep_blank_values=True)
            if k.lower() not in TRACKING_PARAMS
        ]
        new_query = urlencode(clean_queries)
        
        path = parsed.path
        if path != "/" and path.endswith("/"):
            path = path[:-1]

        normalized = urlunparse((
            parsed.scheme.lower(),
            parsed.netloc.lower(),
            path,
            parsed.params,
            new_query,
            ""  # drop fragment
        ))
        return normalized
    except Exception:
        return url.strip()
