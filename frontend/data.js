export const serialize = (tree) => {
    const v = JSON.stringify(tree);
    return bytesToBase64(v);
}

export const deserialize = (data) => {
    const v = base64ToBytes(data);
    return JSON.parse(v);
}

function base64ToBytes(base64) {
    const binString = atob(base64);
    return new TextDecoder().decode(Uint8Array.from(binString, (m) => m.codePointAt(0)));
}

function bytesToBase64(bytes) {
    const binString = Array.from(new TextEncoder().encode(bytes), (byte) =>
        String.fromCodePoint(byte),
    ).join("");
    return btoa(binString);
}