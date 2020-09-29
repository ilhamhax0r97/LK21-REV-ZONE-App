const {app, BrowserWindow}  = require('electron');
const {Client} 			        = require('discord-rpc');
const rpc                   = new Client({transport: 'ipc'});
const path                  = require('path');
const startTimestamp        = new Date();

let clientId = 'your_clientId',
  URL = 'https://lk21.rev-zone.com',
  mainWindow,
  detail_title,
  WindowSettings = {
    width: 1200,
    height: 800,
    backgroundColor: '#FFF',
    useContentSize: false,
    autoHideMenuBar: true,
    resizable: true,
    center: true,
    frame: true,
    alwaysOnTop: false,
    title: 'LK21 REV-ZONE',
    icon: __dirname + '/icon.ico',
    webPreferences: {
        nodeIntegration: false,
        plugins: true,
        preload: path.join(__dirname, 'preload.js')
    }
  },
  login = (tries = 0) => {
    if (tries > 10) return mainWindow.webContents.executeJavaScript(connectionNotice);
    tries += 1;
    rpc.login({clientId}).catch(e => setTimeout(() => login(tries), 10E3));
  },
  connectionNotice = `let notice = document.createElement('div'),
      close_btn = document.createElement('span');
      notice.className = 'error-notice';
      notice.setAttribute('style', 'position: fixed; top: 0px; background: #ef5858; border-bottom: 3px solid #e61616; border-radius: 3px; z-index: 101; color: white; width: 99%; line-height: 2em; text-align: center; margin: 0.5%;');
      close_btn.className = 'close-btn';
      close_btn.innerHTML = '&times;';
      close_btn.setAttribute('style', 'float: right; margin-right: 0.5%; font-size: 20px;');
      notice.innerHTML = 'Failed to connect to Discord IRC. Connection timed out.';
      notice.appendChild(close_btn);
      document.body.appendChild(notice);
      notice.onclick = () => document.body.removeChild(notice);
      setTimeout(() => document.body.removeChild(notice), 15E3);`;

function createWindow () {
  mainWindow = new BrowserWindow(WindowSettings);

  mainWindow.on('closed', () => {
		app.quit();
  })
  
  mainWindow.loadURL(URL);
  login();
}

async function checkTitle() {
  if (!rpc || !mainWindow) return;
  detail_title = mainWindow.getTitle();
  rpc.setActivity({
    details: detail_title,
    state: "by Ilham Wicaksono",
    largeImageKey: 'banner',
    largeImageText: 'LK21 REV-ZONE APP',
    startTimestamp,
    instance: false,
  });
}

rpc.on('ready', () => {
  checkTitle();
  setInterval(() => {
    checkTitle();
  }, 1E3);
});

app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

//stops extra app instances from opening
var shouldQuit = app.requestSingleInstanceLock()
app.on('second-instance', (event, argv, cwd) => {
  // Someone tried to run a second instance, we should focus our window.
	if (mainWindow) {
		if (mainWindow.isMinimized()) mainWindow.restore();
		mainWindow.focus();
  }
})

if (!shouldQuit) {
	app.quit();
	return;
}

//only allows one electron window open
var iSWindowOpen = false;
app.on('browser-window-created', function(event, window) {
	if (window == mainWindow){
		if (iSWindowOpen){
			window.loadURL('javascript:window.close();');
			console.log("Close new window");
		}else{
			iSWindowOpen = true;
      console.log("Open one window");
		}
	}
});