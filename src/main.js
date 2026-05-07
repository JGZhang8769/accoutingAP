const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const Tesseract = require('tesseract.js');
const internalIp = require('internal-ip');

let win;
let expressApp;
let server;
const PORT = 3000;

// Store expected vouchers from Angular
let expectedVouchers = [];
let matchedIndices = new Set(); // Track which vouchers are already matched

function startExpressServer() {
  expressApp = express();
  expressApp.use(cors());
  expressApp.use(express.json());

  // Serve the mobile PWA static files
  expressApp.use(express.static(path.join(__dirname, 'mobile-app')));

  const upload = multer({ storage: multer.memoryStorage() });

  expressApp.post('/api/scan', upload.single('image'), async (req, res) => {
    try {
      let amountStr = req.body.manualAmount;
      let isManual = false;

      // If manual amount is not provided, perform OCR
      if (!amountStr && req.file) {
        console.log('Starting OCR process...');
        // For offline usage, you would bundle language data, but here Tesseract.js fetches it
        // to cache locally the first time. In a production completely offline build,
        // you would configure Tesseract to use a local langPath.
        const result = await Tesseract.recognize(req.file.buffer, 'eng+chi_tra', {
           logger: m => console.log(m)
        });
        const text = result.data.text;
        console.log('OCR Text:', text);

        // Regex to find total amount. Very naive approach:
        // Looks for words like 總計, 合計, Total followed by numbers
        const match = text.match(/(?:總計|合計|Total|金額|Amount)[\s:：$]*([\d,]+(?:\.\d+)?)/i);
        if (match) {
          amountStr = match[1];
        } else {
          // fallback: find the largest number on the receipt?
          const numbers = [...text.matchAll(/[\d,]+(?:\.\d+)?/g)].map(m => parseFloat(m[0].replace(/,/g, ''))).filter(n => !isNaN(n));
          if (numbers.length > 0) {
              amountStr = Math.max(...numbers).toString();
          }
        }
      } else {
         isManual = true;
      }

      if (!amountStr) {
        return res.json({ success: false, needsManual: true, message: 'OCR 無法辨識金額，請手動輸入' });
      }

      const parsedAmount = parseFloat(amountStr.replace(/,/g, ''));
      if (isNaN(parsedAmount)) {
        return res.json({ success: false, needsManual: true, message: '解析的金額無效，請手動輸入' });
      }

      // 3. Match against expected vouchers
      let matchedIndex = -1;
      for (let i = 0; i < expectedVouchers.length; i++) {
        if (matchedIndices.has(i)) continue; // skip already matched

        const v = expectedVouchers[i];
        const netAmount = Math.abs(v.credit - v.debit); // simple assumption
        if (Math.abs(netAmount - parsedAmount) < 0.01) {
           matchedIndex = i;
           break;
        }
      }

      if (matchedIndex !== -1) {
        matchedIndices.add(matchedIndex);
        const position = matchedIndex + 1; // 1-based
        const row = Math.ceil(position / 10);
        const col = position % 10 === 0 ? 10 : position % 10;

        const responseData = {
          success: true,
          amount: parsedAmount,
          position: position,
          row: row,
          col: col,
          voucher: expectedVouchers[matchedIndex],
          isManual: isManual
        };

        // Notify Angular frontend
        if (win) {
           win.webContents.send('scan-matched', responseData);
        }

        return res.json(responseData);
      } else {
        return res.json({
          success: false,
          amount: parsedAmount,
          message: '⚠️ 找不到符合此金額的帳款！請放置於【異常區 / 待確認盒】',
          isManual: isManual
        });
      }

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error during OCR' });
    }
  });

  server = expressApp.listen(PORT, '0.0.0.0', () => {
    console.log(`Mobile scanner server running on port ${PORT}`);
  });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, 'dist/ap-balance-tool/browser/index.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', async () => {
  createWindow();
  startExpressServer();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

// IPC Handlers to communicate with Angular
ipcMain.handle('get-scanner-url', async () => {
  try {
    const ip = await internalIp.v4();
    return `http://${ip}:${PORT}`;
  } catch(e) {
    return `http://localhost:${PORT}`;
  }
});

ipcMain.on('set-vouchers', (event, vouchers) => {
  expectedVouchers = vouchers;
  matchedIndices.clear(); // reset matching state when new vouchers are set
  console.log(`Received ${vouchers.length} vouchers for matching.`);
});
