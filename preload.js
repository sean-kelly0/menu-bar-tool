const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getAssignments: () => ipcRenderer.invoke('get-assignments'),
  saveAssignments: (assignments) => ipcRenderer.invoke('save-assignments', assignments),
  closeWindow: () => ipcRenderer.invoke('close-window'),
});
