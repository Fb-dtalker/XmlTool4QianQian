const { app, BrowserWindow } = require('electron')

let globalWin;

function main() {
    globalWin = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        },
        frame: true,
        transparent: false,
        resizable: true,
        skipTaskbar: false, //隐藏任务栏
        title: ""
    });

    globalWin.loadFile("index.html");
}

app.whenReady().then(main);