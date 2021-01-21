/**
 * string to ArrayBuffer
 */

export function stringToArrayBuffer(str: string): ArrayBuffer {
    str = unescape(encodeURIComponent(str));
    const buffer = new ArrayBuffer(str.length);
    const data = new Uint8Array(buffer);
    for (let i = 0; i < str.length; i++) {
        data[i] = str.charCodeAt(i);
    }
    return buffer;
}

/**
 * Array to ArrayBuffer
 */

export function arrayToArrayBuffer(array: number[]): ArrayBuffer {
    const buffer = new ArrayBuffer(array.length);
    const data = new Uint8Array(buffer);
    array.forEach((num, idx) => data[idx] = num);
    return buffer;
}

/**
 * ArrayBuffer to HEX string
 */

export function arrayToHex(data: Uint8Array): string {
    const length = data.length;
    let hex = "";
    for (let i = 0; i < length; i++) {
        hex += (data[i] | 0x100).toString(16).substr(-2);
    }
    return hex;
}