@echo off
title Push Kode SCM ke GitHub
echo ===================================================
echo   Mengirim Seluruh Kode SCM ke GitHub...
echo ===================================================
echo.

cd /d "C:\Users\ASUS\.gemini\antigravity\scratch\sulut-campus-monitor"

"C:\Program Files\Git\cmd\git.exe" remote remove origin 2>nul
"C:\Program Files\Git\cmd\git.exe" remote add origin https://github.com/thedorraimundus-blip/monitor-kampus-sulut.git

"C:\Program Files\Git\cmd\git.exe" branch -M main
"C:\Program Files\Git\cmd\git.exe" add -A
"C:\Program Files\Git\cmd\git.exe" commit -m "Upload seluruh source code SCM" 2>nul

echo.
echo Mengunggah file ke https://github.com/thedorraimundus-blip/monitor-kampus-sulut ...
echo (Jika muncul jendela login GitHub, silakan klik 'Sign in with your browser')
echo.

"C:\Program Files\Git\cmd\git.exe" push -u origin main --force

echo.
echo ===================================================
echo              SELESAI!
echo ===================================================
echo Silakan buka kembali halaman GitHub di browser Anda.
echo Folder backend dan frontend sekarang sudah muncul.
echo.
pause
