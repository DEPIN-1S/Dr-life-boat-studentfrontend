/* eslint-disable no-restricted-globals */
self.onmessage = (e) => {
    if (e.data === 'start') {
        // interval for 1 second tick
        if (self.timerId) clearInterval(self.timerId);
        self.timerId = setInterval(() => {
            self.postMessage('tick');
        }, 1000);
    } else if (e.data === 'stop') {
        if (self.timerId) clearInterval(self.timerId);
        self.timerId = null;
    }
};
