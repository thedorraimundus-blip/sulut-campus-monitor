@echo off
echo Setting up remote...
"C:\Program Files\Git\cmd\git.exe" remote remove origin 2>nul
"C:\Program Files\Git\cmd\git.exe" remote add origin https://github.com/thedorraimundus-blip/sulut-campus-monitor.git
echo Remote set!
echo.
echo Pushing to GitHub... (Browser mungkin akan terbuka untuk login)
"C:\Program Files\Git\cmd\git.exe" branch -M main
"C:\Program Files\Git\cmd\git.exe" push -u origin main
echo.
echo SELESAI! Tekan tombol apapun untuk tutup.
pause
