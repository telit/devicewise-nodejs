# deviceWISE NodeJS API Service

## Installation
`npm install devicewise-nodejs --save`;

## Example implementation

```
const dw = require("devicewise-nodejs");

class Dwopen {
    constructor() {
        this.getInfo();
        this.multiPostExample();
    }

    async getSessionInfo() {
        return await dw.request("<api-endpoint>", "<sessionId>", {
            command: "session.info",
        });
    }

    async multiPostExample() {
        const multipleCommands = {
            0: { command: "session.info" },
            1: { command: "org.find", params: { key: "<orgKey>" } },
        };
        return await dw.request("<api-endpoint>", "<sessionId>", multipleCommands);
    }
}

new Dwopen();
```
