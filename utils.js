import https from 'https';

export function generateRandomIP() {
    const randomNum = () => Math.floor(Math.random() * 255);
    return `${randomNum()}.${randomNum()}.${randomNum()}.${randomNum()}`;
}

export function getProxyAgent() {
    return new https.Agent();
}
