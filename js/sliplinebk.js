// =========================================================
// ไฟล์ js/sliplinebk.js (แก้ปัญหาภาพบีบ/พิกัดล้น + ดึงขนาดจากภาพจริง)
// =========================================================

// 1. ฟังก์ชันโหลดฟอนต์
function loadFonts() {
    const fonts = [
        new FontFace('SFThonburiLight', 'url(assets/fonts/SFThonburi.woff)'),
        new FontFace('SFThonburiRegular', 'url(assets/fonts/SFThonburi-Regular.woff)'),
        new FontFace('SFThonburiSemiBold', 'url(assets/fonts/SFThonburi-Semibold.woff)'),
        new FontFace('SFThonburiBold', 'url(assets/fonts/SFThonburi-Bold.woff)')
    ];

    return Promise.all(fonts.map(font => font.load().catch(e => console.warn('Font load error:', e)))).then(function(loadedFonts) {
        loadedFonts.forEach(function(font) {
            if (font) document.fonts.add(font);
        });
    });
}

window.onload = function() {
    setCurrentDateTime();
    loadFonts().then(function() {
        document.fonts.ready.then(function() {
            updateDisplay(); 
        });
    }).catch(function() {
        updateDisplay();
    });
};

function setCurrentDateTime() {
    const now = new Date();
    const localDateTime = now.toLocaleString('sv-SE', { timeZone: 'Asia/Bangkok', hour12: false });
    const formattedDateTime = localDateTime.replace(' ', 'T');
    const dtElem = document.getElementById('datetime');
    if (dtElem && !dtElem.value) dtElem.value = formattedDateTime;
}

// ปรับให้ดึงปี 2 หลักแบบชัวร์ๆ (เช่น 69)
function formatDate(date) {
    if (!date || date === '-') return '-';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const month = months[d.getMonth()];
    const year = (d.getFullYear() + 543).toString().slice(-2);
    return `${day} ${month} ${year}`;
}

// 2. ฟังก์ชันสุ่มรหัสอ้างอิงของ LINE BK
function generateUniqueID() {
    const datetimeInput = document.getElementById('datetime');
    const now = new Date(datetimeInput ? datetimeInput.value : new Date());
    const startDate = new Date("2024-07-24");
    const dayDifference = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    const uniqueDayNumber = 54206 + dayDifference;
    const uniqueDayString = uniqueDayNumber.toString().padStart(6, '0');

    const randomString = generateRandomString(13, 3); 
    return uniqueDayString + randomString;
}

function generateRandomString(length, numDigits) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '123456789';
    let result = [];

    for (let i = 0; i < numDigits; i++) {
        result.push(digits.charAt(Math.floor(Math.random() * digits.length)));
    }
    for (let i = 0; i < length - numDigits; i++) {
        result.push(letters.charAt(Math.floor(Math.random() * letters.length)));
    }
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result.join('');
}

// 3. จัดรูปแบบเลขบัญชีอัตโนมัติ (10, 12, Wallet)
window.autoFormatAccount = function() {
    const bank = document.getElementById('bank')?.value;
    const accInput = document.getElementById('receiveraccount');
    if (!bank || !accInput) return;

    let rawVal = accInput.value.replace(/[^0-9]/g, '');
    if (rawVal.length === 0) return;

    if (bank.includes('วอลเล็ท') || bank.includes('เติมเงินพร้อมเพย์') || rawVal.length >= 15) {
        rawVal = rawVal.padStart(15, '0');
        accInput.value = `XXXXXXXXXXX${rawVal.slice(-4)}`;
    } else if (bank === 'ออมสิน' || bank === 'ธ.ก.ส.' || rawVal.length === 12) {
        rawVal = rawVal.padStart(12, '0');
        accInput.value = `XXXXXXXX${rawVal.slice(-4)}`;
    } else {
        rawVal = rawVal.padStart(10, '0');
        accInput.value = `XXXXXX${rawVal.slice(-4)}`;
    }

    if (typeof updateDisplay === 'function') updateDisplay();
};

// 4. ฟังก์ชันวาดสลิป
window.updateDisplay = async function() {
    const sendername = document.getElementById('sendername')?.value || '-';
    const senderaccount = document.getElementById('senderaccount')?.value || '-';
    const receivername = document.getElementById('receivername')?.value || '-';
    const receiveraccount = document.getElementById('receiveraccount')?.value || '-';
    const bank = document.getElementById('bank')?.value || '-';
    const amount11 = document.getElementById('amount11')?.value || '0.00';
    const datetime = document.getElementById('datetime')?.value || '-';
    
    const noteToggleElem = document.getElementById('modeSwitch');
    const isNoteMode = noteToggleElem ? noteToggleElem.checked : false;
    const AideMemoire = document.getElementById('AideMemoire') ? document.getElementById('AideMemoire').value : '-';
    const selectedImage = document.getElementById('imageSelect')?.value || '';
    const QRCode = document.getElementById('QRCode')?.value || '';

    let bankLogoUrl = '';
    switch (bank) {
        case 'กสิกรไทย': bankLogoUrl = 'assets/image/logo/KBANK.png'; break;
        case 'กรุงไทย': bankLogoUrl = 'assets/image/logo/KTB.png'; break;
        case 'กรุงเทพ': bankLogoUrl = 'assets/image/logo/BBL.png'; break;
        case 'ไทยพาณิชย์': bankLogoUrl = 'assets/image/logo/SCB.png'; break;
        case 'กรุงศรีอยุธยา': bankLogoUrl = 'assets/image/logo/BAY.png'; break;
        case 'ทหารไทยธนชาต': bankLogoUrl = 'assets/image/logo/TTB1.png'; break;
        case 'ออมสิน': bankLogoUrl = 'assets/image/logo/O.png'; break;
        case 'ธ.ก.ส.': bankLogoUrl = 'assets/image/logo/T.png'; break;
        case 'อาคารสงเคราะห์': bankLogoUrl = 'assets/image/logo/C.png'; break;
        case 'เกียรตินาคินภัทร': bankLogoUrl = 'assets/image/logo/K.png'; break;
        case 'ซีไอเอ็มบีไทย': bankLogoUrl = 'assets/image/logo/CIMB.png'; break;
        case 'ยูโอบี': bankLogoUrl = 'assets/image/logo/UOB.png'; break;
        case 'แลนด์ แอนด์ เฮ้าส์': bankLogoUrl = 'assets/image/logo/LHBANK.png'; break;
        case 'ไอซีบีซี': bankLogoUrl = 'assets/image/logo/ICBC.png'; break;
        case 'รหัส e-Wallet': bankLogoUrl = 'assets/image/logo/P-LINE BK.png'; break;
        case 'พร้อมเพย์วอลเล็ท': bankLogoUrl = 'assets/image/logo/P-LINE BK.png'; break;
        default: bankLogoUrl = 'assets/image/logo/P-LINE BK.png'; break;
    }

    const formattedDate = formatDate(datetime);
    let formattedTime = '';
    if (datetime && datetime !== '-') {
        const d = new Date(datetime);
        if (!isNaN(d.getTime())) formattedTime = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let backgroundImageSrc = isNoteMode ? 'assets/image/bs/LINEBK1T.jpg' : 'assets/image/bs/LINEBK1.jpg';

    const loadImage = (src) => new Promise(res => {
        if (!src) return res(null);
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = () => res(null);
        img.src = src;
    });

    const [bgImg, bankLogoImg, kbankLogoImg, customStickerImg] = await Promise.all([
        loadImage(backgroundImageSrc),
        loadImage(bankLogoUrl),
        loadImage('assets/image/logo/KBANK.png'),
        loadImage((selectedImage && !selectedImage.includes('NO.png')) ? selectedImage : null)
    ]);

    // ✅ ปรับขนาด Canvas ให้เท่ากับไฟล์ภาพจริง 100% ป้องกันภาพถูกบีบ
    if (bgImg) {
        canvas.width = bgImg.width;
        canvas.height = bgImg.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    } else {
        canvas.width = isNoteMode ? 990 : 1080;
        canvas.height = 1280;
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // ==========================================
    // วาดข้อความและโลโก้ตามพิกัดเดิมเป๊ะ
    // ==========================================
    if (isNoteMode) {
        drawText(ctx, `฿${amount11}`, 73, 306, 108, 'SFThonburiBold', '#000000', 'left', 1.5, 3, 0, 0, 880, 0);
        drawText(ctx, `${formattedDate} ${formattedTime}`, 73, 382.9, 39, 'SFThonburiRegular', '#999999', 'left', 1.5, 3, 0, 0, 880, 0);

        drawText(ctx, `${sendername}`, 805, 503.1, 39, 'SFThonburiRegular', '#000000', 'right', 1.5, 3, 0, 0, 880, 0);
        drawText(ctx, `กสิกรไทย ${senderaccount}`, 805, 554, 34, 'SFThonburiRegular', '#999999', 'right', 1.5, 2, 0, 0, 880, 0);
        if(kbankLogoImg) ctx.drawImage(kbankLogoImg, 822, 464.5, 95, 95); 

        drawText(ctx, `${receivername}`, 805, 632.4, 39, 'SFThonburiRegular', '#000000', 'right', 1.5, 3, 0, 0, 880, 0);
        drawText(ctx, `${bank} ${receiveraccount}`, 805, 682.2, 34, 'SFThonburiRegular', '#999999', 'right', 1.5, 2, 0, 0, 880, 0);
        if(bankLogoImg) ctx.drawImage(bankLogoImg, 822, 593, 95, 95); 

        drawText(ctx, `฿0.00`, 911.3, 760, 41, 'SFThonburiRegular', '#000000', 'right', 1.5, 3, 0, 0, 880, 0);
        drawText(ctx, `${generateUniqueID()}`, 911.3, 842, 41, 'SFThonburiRegular', '#000000', 'right', 1.5, 3, 0, 0, 880, 0);
        drawText(ctx, `${AideMemoire}`, 911.3, 930.7, 41, 'SFThonburiRegular', '#000000', 'right', 1.5, 3, 0, 0, 880, 0);

        drawText(ctx, `${QRCode}`, 238.9, 599.0, 33, 'SFThonburiRegular', '#4e4e4e', 'left', 1.5, 5, 0, 0, 880, 0);
    } else {
        drawText(ctx, `฿${amount11}`, 79, 329, 115, 'SFThonburiBold', '#000000', 'left', 1.5, 3, 0, 0, 950, 0);
        drawText(ctx, `${formattedDate} ${formattedTime}`, 79, 409.9, 42, 'SFThonburiRegular', '#999999', 'left', 1.5, 3, 0, 0, 880, 0);

        drawText(ctx, `${sendername}`, 863, 539.4, 42, 'SFThonburiRegular', '#000000', 'right', 1.5, 3, 0, 0, 880, 0);
        drawText(ctx, `กสิกรไทย ${senderaccount}`, 863, 592.9, 37, 'SFThonburiRegular', '#999999', 'right', 1.5, 2, 0, 0, 880, 0);
        if(kbankLogoImg) ctx.drawImage(kbankLogoImg, 882, 498, 101, 101); 

        drawText(ctx, `${receivername}`, 863, 677.6, 42, 'SFThonburiRegular', '#000000', 'right', 1.5, 3, 0, 0, 880, 0);
        drawText(ctx, `${bank} ${receiveraccount}`, 863, 731.6, 37, 'SFThonburiRegular', '#999999', 'right', 1.5, 2, 0, 0, 880, 0);
        if(bankLogoImg) ctx.drawImage(bankLogoImg, 882, 636, 101, 101); 

        drawText(ctx, `฿0.00`, 974.6, 815.7, 43, 'SFThonburiRegular', '#000000', 'right', 1.5, 3, 0, 0, 880, 0);
        drawText(ctx, `${generateUniqueID()}`, 974.6, 902.6, 43, 'SFThonburiRegular', '#000000', 'right', 1.5, 3, 0, 0, 880, 0);

        drawText(ctx, `${QRCode}`, 238.9, 599.0, 33, 'SFThonburiRegular', '#4e4e4e', 'left', 1.5, 5, 0, 0, 880, 0);
    }

    if (customStickerImg) {
        ctx.drawImage(customStickerImg, 0, 0, canvas.width, canvas.height); 
    }
};

// 5. ฟังก์ชันวาดอักษร
function drawText(ctx, text, x, y, fontSize, fontFamily, color, align, lineHeight, maxLines, shadowColor, shadowBlur, maxWidth, letterSpacing) {
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.shadowColor = shadowColor || 'transparent';
    ctx.shadowBlur = shadowBlur || 0;

    const paragraphs = text.split('<br>');
    let currentY = y;

    paragraphs.forEach(paragraph => {
        const lines = [];
        let currentLine = '';

        for (let i = 0; i < paragraph.length; i++) {
            const char = paragraph[i];
            const isThai = /[\u0E00-\u0E7F]/.test(char);
            const isWhitespace = /\s/.test(char);

            const testLine = currentLine + char;
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width + (testLine.length - 1) * letterSpacing;

            if (testWidth > maxWidth && currentLine !== '') {
                lines.push(currentLine.trim());
                currentLine = char;
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine.trim());

        lines.forEach((line, index) => {
            let currentX = x;
            
            if (align === 'center') {
                currentX = x - (ctx.measureText(line).width / 2) - ((line.length - 1) * letterSpacing) / 2;
            } else if (align === 'right') {
                currentX = x - ctx.measureText(line).width - ((line.length - 1) * letterSpacing);
            }
        
            drawTextLine(ctx, line, currentX, currentY, letterSpacing);
            currentY += lineHeight;
            if (maxLines && index >= maxLines - 1) {
                return;
            }
        });
    });
}

function drawTextLine(ctx, text, x, y, letterSpacing) {
    if (!letterSpacing) {
        ctx.fillText(text, x, y);
        return;
    }

    const characters = text.split('');
    let currentPosition = x;

    characters.forEach((char, index) => {
        const charCode = char.charCodeAt(0);
        const prevChar = index > 0 ? characters[index - 1] : null;
        
        const isUpperVowel = (charCode >= 0x0E34 && charCode <= 0x0E37);
        const isToneMark = (charCode >= 0x0E48 && charCode <= 0x0E4C);
        const isBeforeVowel = (charCode === 0x0E31);
        const isBelowVowel = (charCode >= 0x0E38 && charCode <= 0x0E3A);

        let yOffset = 0;
        let xOffset = 0;

        if (isUpperVowel) {
            yOffset = -1;
            xOffset = 0;
        }

        if (isToneMark) {
            if (prevChar && ((prevChar.charCodeAt(0) >= 0x0E34 && prevChar.charCodeAt(0) <= 0x0E37) || prevChar.charCodeAt(0) === 0x0E31)) {
                yOffset = -8;
                xOffset = 0;
            } else {
                yOffset = 0;
                xOffset = -7;
            }
        }

        if (isBeforeVowel) {
            yOffset = -1;
            xOffset = 1;
        }

        if (isBelowVowel) {
            yOffset = 0;
            xOffset = -10;
        }

        ctx.fillText(char, currentPosition + xOffset, y + yOffset);

        if (!isToneMark && !isBeforeVowel && !isBelowVowel) {
            currentPosition += ctx.measureText(char).width + letterSpacing;
        } else {
            currentPosition += ctx.measureText(char).width;
        }
    });
}

window.downloadImage = function() {
    const canvas = document.getElementById('canvas');
    if(!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'linebk_slip.png';
    link.click();
};