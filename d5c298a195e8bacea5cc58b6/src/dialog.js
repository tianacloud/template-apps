// Confirmations and notices use the browser's own dialogs; the preview page installs in-page ones.
let handlers = {
  ask: message => Promise.resolve(window.confirm(message)),
  notify: message => { window.alert(message); return Promise.resolve(); },
};
export function useDialogs(next) { handlers = next; }
export function ask(message) { return handlers.ask(message); }
export function notify(message) { return handlers.notify(message); }
