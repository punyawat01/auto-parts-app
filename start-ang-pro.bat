@echo off
chcp 65001 > nul
title ANG PRO - Auto Parts System
color 0B

echo ===================================================
echo             ANG PRO - Auto Parts System
echo ===================================================
echo.
echo กำลังตรวจสอบระบบ... (Checking system requirements)

:: 1. Check if Node.js is installed
node -v >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] ไม่พบโปรแกรม Node.js ในเครื่องนี้! 
    echo กรุณาดาวน์โหลดและติดตั้ง Node.js จาก https://nodejs.org/ (เลือกเวอร์ชัน LTS)
    echo เมื่อติดตั้งเสร็จสิ้น ให้เปิดไฟล์นี้ใหม่อีกครั้ง
    echo.
    pause
    exit /b
)

:: 2. Check if node_modules exists, if not, install dependencies
if not exist "node_modules\" (
    echo.
    echo [INFO] เป็นการเปิดใช้งานครั้งแรก ระบบกำลังติดตั้งไลบรารีที่จำเป็น...
    echo กรุณารอสักครู่ (อาจใช้เวลา 1-3 นาทีขึ้นอยู่กับความเร็วอินเทอร์เน็ต)
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [ERROR] การติดตั้งไลบรารีล้มเหลว ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
        pause
        exit /b
    )
    echo [SUCCESS] ติดตั้งไลบรารีสำเร็จ!
)

:: 3. Prepare Database (Generate Client and Push Schema)
echo.
echo [INFO] กำลังตรวจสอบและเตรียมฐานข้อมูล...
call npx prisma generate
call npx prisma db push --accept-data-loss

:: 4. Start Next.js Server
echo.
echo ===================================================
echo [READY] ระบบพร้อมใช้งานแล้ว! กำลังเปิดหน้าเว็บ ANG PRO...
echo ===================================================
echo โปรดอย่าปิดหน้าต่างสีดำนี้ในขณะที่คุณกำลังใช้งานโปรแกรม
echo (Please do not close this window while using the app)
echo.

:: 5. Open Browser after a short delay to let server boot up
start "" "http://localhost:3000"

:: Start the actual server (this will block the terminal)
call npm run dev

pause
