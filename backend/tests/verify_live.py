import httpx

endpoints = [
    '/api/health',
    '/api/dashboard/stats',
    '/api/articles?limit=5',
    '/api/alerts?limit=5',
    '/api/universities',
    '/api/sources',
    '/api/ai/status',
    '/api/monitoring/status'
]

def main():
    print("Testing live endpoints against http://127.0.0.1:8000 ...")
    all_ok = True
    for ep in endpoints:
        try:
            r = httpx.get(f"http://127.0.0.1:8000{ep}", timeout=10.0)
            print(f"  {ep:<30} -> HTTP {r.status_code}")
            if r.status_code >= 400:
                all_ok = False
        except Exception as e:
            print(f"  {ep:<30} -> ERROR: {e}")
            all_ok = False
    print("All live endpoints verified successfully!" if all_ok else "Some endpoints failed!")

if __name__ == "__main__":
    main()
