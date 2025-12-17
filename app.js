const ALGORITHMS = {
    aes: {
        title: 'AES-128 Encryption',
        desc: 'Advanced Encryption Standard with 128-bit key',
        keyHint: '16-char text OR 32-char hex key',
        hasMatrix: false
    },
    rsa: {
        title: 'RSA Encryption',
        desc: 'Asymmetric cryptography with public/private keys',
        keyHint: 'Enter prime numbers P, Q and exponent E',
        hasMatrix: false
    },
    des: {
        title: 'DES Encryption',
        desc: 'Data Encryption Standard - 56-bit key cipher',
        keyHint: '8-char text OR 16-char hex key',
        hasMatrix: false
    },
    playfair: {
        title: 'Playfair Cipher',
        desc: 'Classical digraph substitution cipher with 5x5 matrix',
        keyHint: 'Enter a keyword (J treated as I)',
        hasMatrix: true,
        matrixSize: 5
    },
    hill: {
        title: 'Hill Cipher',
        desc: 'Matrix-based polygraphic substitution cipher',
        keyHint: 'Select matrix size and enter values (0-25)',
        hasMatrix: true,
        matrixSize: 3
    }
};

let currentAlgorithm = 'aes';
let playfairMatrix = [];
let hillKeyMatrix = [];
let currentHillSize = 3;

const TECH_CHARS = '01アイウエオカキクケコ@#$%&*!?<>[]{}=+-~^ΔΩΣπλμ';

function animateText(targetElement, finalString, options = {}) {
    const duration = options.duration || 1500;
    const fps = options.fps || 30;
    const frameInterval = 1000 / fps;
    
    const length = finalString.length;
    let startTime = null;
    let lastFrameTime = 0;
    
    function getRandomChar() {
        return TECH_CHARS[Math.floor(Math.random() * TECH_CHARS.length)];
    }
    
    function generateFrame(progress) {
        let result = '';
        const resolvePoint = Math.floor(progress * length);
        
        for (let i = 0; i < length; i++) {
            if (i < resolvePoint) {
                result += finalString[i];
            } else if (i === resolvePoint && progress > 0) {
                if (Math.random() > 0.3) {
                    result += finalString[i];
                } else {
                    result += getRandomChar();
                }
            } else {
                result += getRandomChar();
            }
        }
        return result;
    }
    
    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        
        const elapsed = timestamp - startTime;
        const timeSinceLastFrame = timestamp - lastFrameTime;
        
        if (timeSinceLastFrame >= frameInterval) {
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutQuart(progress);
            
            targetElement.value = generateFrame(eased);
            lastFrameTime = timestamp;
        }
        
        if (elapsed < duration) {
            requestAnimationFrame(animate);
        } else {
            targetElement.value = finalString;
        }
    }
    
    if (finalString.length === 0) {
        targetElement.value = '';
        return;
    }
    
    requestAnimationFrame(animate);
}

function easeOutQuart(x) {
    return 1 - Math.pow(1 - x, 4);
}

function generatePlayfairMatrix(key) {
    const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
    key = key.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    
    const seen = new Set();
    const matrix = [];
    
    for (const char of key) {
        if (!seen.has(char)) {
            seen.add(char);
            matrix.push(char);
        }
    }
    
    for (const char of alphabet) {
        if (!seen.has(char)) {
            seen.add(char);
            matrix.push(char);
        }
    }
    
    return matrix;
}

function findCharPosition(matrix, char) {
    const index = matrix.indexOf(char);
    return { row: Math.floor(index / 5), col: index % 5 };
}

function playfairProcessInput(text) {
    text = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    let processed = '';
    
    for (let i = 0; i < text.length; i += 2) {
        let pair = text.substring(i, i + 2);
        if (pair.length === 1) {
            pair += 'X';
        }
        if (pair[0] === pair[1]) {
            processed += pair[0] + 'X';
            i--;
        } else {
            processed += pair;
        }
    }
    return processed;
}

function playfairRemovePadding(text) {
    let result = text;
    
    if (result.endsWith('X')) {
        result = result.slice(0, -1);
    }
    
    let cleaned = '';
    for (let i = 0; i < result.length; i++) {
        if (result[i] === 'X' && i > 0 && i < result.length - 1) {
            if (result[i - 1] === result[i + 1]) {
                continue;
            }
        }
        cleaned += result[i];
    }
    
    return cleaned;
}

async function playfairCipher(text, key, mode) {
    const matrix = generatePlayfairMatrix(key);
    playfairMatrix = matrix;
    updateVisualMatrix(matrix, 5);
    
    let inputText;
    if (mode === 1) {
        inputText = playfairProcessInput(text);
    } else {
        inputText = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    }
    
    let output = '';
    
    for (let i = 0; i < inputText.length; i += 2) {
        const pair = inputText.substring(i, i + 2);
        if (pair.length < 2) continue;
        
        const char1 = pair[0].replace(/J/g, 'I');
        const char2 = pair[1].replace(/J/g, 'I');
        
        const pos1 = findCharPosition(matrix, char1);
        const pos2 = findCharPosition(matrix, char2);
        
        await highlightMatrixCells([pos1.row * 5 + pos1.col, pos2.row * 5 + pos2.col], 150);
        
        let newPos1, newPos2;
        
        if (pos1.row === pos2.row) {
            newPos1 = { row: pos1.row, col: (pos1.col + mode + 5) % 5 };
            newPos2 = { row: pos2.row, col: (pos2.col + mode + 5) % 5 };
        } else if (pos1.col === pos2.col) {
            newPos1 = { row: (pos1.row + mode + 5) % 5, col: pos1.col };
            newPos2 = { row: (pos2.row + mode + 5) % 5, col: pos2.col };
        } else {
            newPos1 = { row: pos1.row, col: pos2.col };
            newPos2 = { row: pos2.row, col: pos1.col };
        }
        
        output += matrix[newPos1.row * 5 + newPos1.col];
        output += matrix[newPos2.row * 5 + newPos2.col];
    }
    
    if (mode === -1) {
        output = playfairRemovePadding(output);
    }
    
    return output;
}

function modInverse(n, modulus) {
    n = ((n % modulus) + modulus) % modulus;
    for (let x = 1; x < modulus; x++) {
        if ((n * x) % modulus === 1) return x;
    }
    return null;
}

function determinant2x2(m) {
    return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

function determinant3x3(m) {
    return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
           m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
           m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
}

function inverseMatrix2x2(m) {
    const det = determinant2x2(m);
    const detInv = modInverse(det, 26);
    
    if (detInv === null) {
        throw new Error('Matrix is not invertible (det has no modular inverse mod 26)');
    }
    
    const adjugate = [
        [m[1][1], -m[0][1]],
        [-m[1][0], m[0][0]]
    ];
    
    return adjugate.map(row =>
        row.map(val => (((val * detInv) % 26) + 26) % 26)
    );
}

function inverseMatrix3x3(m) {
    const det = determinant3x3(m);
    const detInv = modInverse(det, 26);
    
    if (detInv === null) {
        throw new Error('Matrix is not invertible (det has no modular inverse mod 26)');
    }
    
    const adjugate = [
        [
            (m[1][1] * m[2][2] - m[1][2] * m[2][1]),
            -(m[0][1] * m[2][2] - m[0][2] * m[2][1]),
            (m[0][1] * m[1][2] - m[0][2] * m[1][1])
        ],
        [
            -(m[1][0] * m[2][2] - m[1][2] * m[2][0]),
            (m[0][0] * m[2][2] - m[0][2] * m[2][0]),
            -(m[0][0] * m[1][2] - m[0][2] * m[1][0])
        ],
        [
            (m[1][0] * m[2][1] - m[1][1] * m[2][0]),
            -(m[0][0] * m[2][1] - m[0][1] * m[2][0]),
            (m[0][0] * m[1][1] - m[0][1] * m[1][0])
        ]
    ];
    
    return adjugate.map(row =>
        row.map(val => (((val * detInv) % 26) + 26) % 26)
    );
}

function inverseMatrix(m) {
    if (m.length === 2) {
        return inverseMatrix2x2(m);
    } else {
        return inverseMatrix3x3(m);
    }
}

function multiplyMatrixVector(matrix, vector) {
    const size = matrix.length;
    const result = [];
    for (let i = 0; i < size; i++) {
        let sum = 0;
        for (let j = 0; j < size; j++) {
            sum += matrix[i][j] * vector[j];
        }
        result.push(((sum % 26) + 26) % 26);
    }
    return result;
}

async function hillCipher(text, keyMatrix, mode) {
    const size = keyMatrix.length;
    text = text.toUpperCase().replace(/[^A-Z]/g, '');
    
    while (text.length % size !== 0) {
        text += 'X';
    }
    
    const matrix = mode === 'encrypt' ? keyMatrix : inverseMatrix(keyMatrix);
    let result = '';
    
    const totalCells = size * size;
    const cellIndices = Array.from({ length: totalCells }, (_, i) => i);
    
    for (let i = 0; i < text.length; i += size) {
        const vector = [];
        for (let j = 0; j < size; j++) {
            vector.push(text.charCodeAt(i + j) - 65);
        }
        
        await highlightHillCells(cellIndices, 100);
        
        const resultVector = multiplyMatrixVector(matrix, vector);
        for (let j = 0; j < size; j++) {
            result += String.fromCharCode(resultVector[j] + 65);
        }
    }
    
    if (mode === 'decrypt') {
        result = result.replace(/X+$/, '');
    }
    
    return result;
}

function isHexString(str) {
    return /^[0-9a-fA-F]+$/.test(str);
}

function parseAESKey(key) {
    if (key.length === 16) {
        return CryptoJS.enc.Utf8.parse(key);
    } else if (key.length === 32 && isHexString(key)) {
        return CryptoJS.enc.Hex.parse(key);
    } else {
        throw new Error('Key must be 16-char text OR 32-char hex');
    }
}

function parseDESKey(key) {
    if (key.length === 8) {
        return CryptoJS.enc.Utf8.parse(key);
    } else if (key.length === 16 && isHexString(key)) {
        return CryptoJS.enc.Hex.parse(key);
    } else {
        throw new Error('Key must be 8-char text OR 16-char hex');
    }
}

function aesEncrypt(plaintext, key) {
    const keyParsed = parseAESKey(key);
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(plaintext, keyParsed, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    
    return iv.toString(CryptoJS.enc.Hex) + encrypted.ciphertext.toString(CryptoJS.enc.Hex);
}

function aesDecrypt(ciphertext, key) {
    const keyParsed = parseAESKey(key);
    const iv = CryptoJS.enc.Hex.parse(ciphertext.substr(0, 32));
    const ciphertextParsed = CryptoJS.enc.Hex.parse(ciphertext.substr(32));
    
    const decrypted = CryptoJS.AES.decrypt({ ciphertext: ciphertextParsed }, keyParsed, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    
    return decrypted.toString(CryptoJS.enc.Utf8);
}

function desEncrypt(plaintext, key) {
    const keyParsed = parseDESKey(key);
    const iv = CryptoJS.lib.WordArray.random(8);
    const encrypted = CryptoJS.DES.encrypt(plaintext, keyParsed, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    
    return iv.toString(CryptoJS.enc.Hex) + encrypted.ciphertext.toString(CryptoJS.enc.Hex);
}

function desDecrypt(ciphertext, key) {
    const keyParsed = parseDESKey(key);
    const iv = CryptoJS.enc.Hex.parse(ciphertext.substr(0, 16));
    const ciphertextParsed = CryptoJS.enc.Hex.parse(ciphertext.substr(16));
    
    const decrypted = CryptoJS.DES.decrypt({ ciphertext: ciphertextParsed }, keyParsed, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    
    return decrypted.toString(CryptoJS.enc.Utf8);
}

function modPow(base, exp, mod) {
    let result = 1n;
    base = BigInt(base) % BigInt(mod);
    exp = BigInt(exp);
    mod = BigInt(mod);
    
    while (exp > 0n) {
        if (exp % 2n === 1n) {
            result = (result * base) % mod;
        }
        exp = exp / 2n;
        base = (base * base) % mod;
    }
    return result;
}

function gcd(a, b) {
    a = BigInt(a);
    b = BigInt(b);
    while (b !== 0n) {
        [a, b] = [b, a % b];
    }
    return a;
}

function modInverseBig(a, m) {
    a = BigInt(a);
    m = BigInt(m);
    let [old_r, r] = [a, m];
    let [old_s, s] = [1n, 0n];
    
    while (r !== 0n) {
        const quotient = old_r / r;
        [old_r, r] = [r, old_r - quotient * r];
        [old_s, s] = [s, old_s - quotient * s];
    }
    
    return ((old_s % m) + m) % m;
}

function getRSAParams() {
    const p = parseInt(document.getElementById('rsa-p').value);
    const q = parseInt(document.getElementById('rsa-q').value);
    const e = parseInt(document.getElementById('rsa-e').value) || 65537;
    
    if (isNaN(p) || isNaN(q)) {
        throw new Error('Please enter valid prime numbers for P and Q');
    }
    
    return { p, q, e };
}

function rsaEncrypt(plaintext, p, q, e) {
    const n = BigInt(p) * BigInt(q);
    const phi = (BigInt(p) - 1n) * (BigInt(q) - 1n);
    const eBig = BigInt(e);
    
    if (gcd(eBig, phi) !== 1n) {
        throw new Error('Invalid: e and phi(n) must be coprime');
    }
    
    const encrypted = [];
    for (const char of plaintext) {
        const m = BigInt(char.charCodeAt(0));
        const c = modPow(m, eBig, n);
        encrypted.push(c.toString());
    }
    
    return JSON.stringify({ n: n.toString(), e: e.toString(), data: encrypted });
}

function rsaDecrypt(ciphertext, p, q, e) {
    const parsed = JSON.parse(ciphertext);
    const n = BigInt(parsed.n);
    const phi = (BigInt(p) - 1n) * (BigInt(q) - 1n);
    const eBig = BigInt(e);
    const d = modInverseBig(eBig, phi);
    
    let decrypted = '';
    for (const c of parsed.data) {
        const m = modPow(BigInt(c), d, n);
        decrypted += String.fromCharCode(Number(m));
    }
    
    return decrypted;
}

function updateVisualMatrix(matrix, size) {
    const container = document.getElementById('visual-matrix');
    const outputSection = document.getElementById('output-matrix-section');
    
    outputSection.style.display = 'block';
    container.innerHTML = '';
    container.className = `visual-matrix grid-${size}x${size}`;
    
    for (let i = 0; i < matrix.length; i++) {
        const cell = document.createElement('div');
        cell.className = 'matrix-cell';
        cell.textContent = matrix[i];
        cell.dataset.index = i;
        container.appendChild(cell);
    }
}

function highlightMatrixCells(indices, duration) {
    return new Promise(resolve => {
        const container = document.getElementById('visual-matrix');
        const cells = container.querySelectorAll('.matrix-cell');
        
        indices.forEach((index, i) => {
            if (cells[index]) {
                cells[index].classList.add(i === 0 ? 'highlight' : 'highlight-secondary');
            }
        });
        
        setTimeout(() => {
            cells.forEach(cell => {
                cell.classList.remove('highlight', 'highlight-secondary');
            });
            resolve();
        }, duration);
    });
}

function highlightHillCells(indices, duration) {
    return new Promise(resolve => {
        const container = document.getElementById('visual-matrix');
        const cells = container.querySelectorAll('.matrix-cell');
        
        indices.forEach(index => {
            if (cells[index]) {
                cells[index].classList.add('flash');
            }
        });
        
        setTimeout(() => {
            cells.forEach(cell => {
                cell.classList.remove('flash');
            });
            resolve();
        }, duration);
    });
}

function renderKeySection(algorithm) {
    const keySection = document.getElementById('key-section');
    const rsaSection = document.getElementById('rsa-section');
    const matrixSection = document.getElementById('matrix-section');
    const matrixSizeSelector = document.getElementById('matrix-size-selector');
    const outputMatrixSection = document.getElementById('output-matrix-section');
    const keyInput = document.getElementById('cipher-key');
    const keyHint = document.getElementById('key-hint');
    
    outputMatrixSection.style.display = 'none';
    keySection.style.display = 'none';
    rsaSection.style.display = 'none';
    matrixSection.style.display = 'none';
    matrixSizeSelector.style.display = 'none';
    
    if (algorithm === 'rsa') {
        rsaSection.style.display = 'block';
        document.getElementById('rsa-p').value = '';
        document.getElementById('rsa-q').value = '';
        document.getElementById('rsa-e').value = '65537';
    } else if (algorithm === 'hill') {
        matrixSection.style.display = 'block';
        matrixSizeSelector.style.display = 'block';
        renderHillKeyInputs(currentHillSize);
    } else if (algorithm === 'playfair') {
        keySection.style.display = 'block';
        keyInput.placeholder = 'Enter keyword...';
        keyHint.textContent = ALGORITHMS[algorithm].keyHint;
    } else {
        keySection.style.display = 'block';
        keyInput.placeholder = 'Enter encryption key...';
        keyHint.textContent = ALGORITHMS[algorithm].keyHint;
    }
}

function renderHillKeyInputs(size) {
    const container = document.getElementById('matrix-grid');
    container.innerHTML = '';
    container.className = 'matrix-grid hill-key-inputs';
    
    for (let i = 0; i < size; i++) {
        const row = document.createElement('div');
        row.className = 'hill-key-row';
        
        for (let j = 0; j < size; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'hill-key-cell';
            input.placeholder = `[${i},${j}]`;
            input.dataset.row = i;
            input.dataset.col = j;
            input.min = 0;
            input.max = 25;
            row.appendChild(input);
        }
        
        container.appendChild(row);
    }
}

function getHillKeyMatrix(size) {
    const inputs = document.querySelectorAll('.hill-key-cell');
    const matrix = [];
    
    for (let i = 0; i < size; i++) {
        matrix.push([]);
    }
    
    inputs.forEach(input => {
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        const val = parseInt(input.value) || 0;
        matrix[row][col] = val;
    });
    
    return matrix;
}

function showHillMatrixVisual(matrix) {
    const size = matrix.length;
    const flatMatrix = matrix.flat().map(n => n.toString());
    updateVisualMatrix(flatMatrix, size);
}

function switchAlgorithm(algorithm) {
    currentAlgorithm = algorithm;
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.algorithm === algorithm) {
            item.classList.add('active');
        }
    });
    
    const algo = ALGORITHMS[algorithm];
    document.querySelector('.algorithm-title').textContent = algo.title;
    document.querySelector('.algorithm-desc').textContent = algo.desc;
    
    renderKeySection(algorithm);
    
    document.getElementById('input-text').value = '';
    document.getElementById('output-text').value = '';
    document.getElementById('cipher-key').value = '';
}

async function handleEncrypt() {
    const input = document.getElementById('input-text').value;
    const key = document.getElementById('cipher-key').value;
    const output = document.getElementById('output-text');
    
    if (!input) {
        output.value = 'Please enter a message to encrypt';
        return;
    }
    
    try {
        let result;
        
        switch (currentAlgorithm) {
            case 'aes':
                result = aesEncrypt(input, key);
                break;
            case 'des':
                result = desEncrypt(input, key);
                break;
            case 'rsa':
                const rsaParams = getRSAParams();
                result = rsaEncrypt(input, rsaParams.p, rsaParams.q, rsaParams.e);
                break;
            case 'playfair':
                if (!key) throw new Error('Please enter a keyword');
                result = await playfairCipher(input, key, 1);
                break;
            case 'hill':
                const hillMatrix = getHillKeyMatrix(currentHillSize);
                showHillMatrixVisual(hillMatrix);
                result = await hillCipher(input, hillMatrix, 'encrypt');
                break;
        }
        
        animateText(output, result);
    } catch (e) {
        output.value = 'Error: ' + e.message;
    }
}

async function handleDecrypt() {
    const input = document.getElementById('input-text').value;
    const key = document.getElementById('cipher-key').value;
    const output = document.getElementById('output-text');
    
    if (!input) {
        output.value = 'Please enter a message to decrypt';
        return;
    }
    
    try {
        let result;
        
        switch (currentAlgorithm) {
            case 'aes':
                result = aesDecrypt(input, key);
                break;
            case 'des':
                result = desDecrypt(input, key);
                break;
            case 'rsa':
                const rsaParams = getRSAParams();
                result = rsaDecrypt(input, rsaParams.p, rsaParams.q, rsaParams.e);
                break;
            case 'playfair':
                if (!key) throw new Error('Please enter a keyword');
                result = await playfairCipher(input, key, -1);
                break;
            case 'hill':
                const hillMatrix = getHillKeyMatrix(currentHillSize);
                showHillMatrixVisual(hillMatrix);
                result = await hillCipher(input, hillMatrix, 'decrypt');
                break;
        }
        
        animateText(output, result);
    } catch (e) {
        output.value = 'Error: ' + e.message;
    }
}

function copyToClipboard() {
    const output = document.getElementById('output-text');
    output.select();
    document.execCommand('copy');
    
    const btn = document.getElementById('copy-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>&#10003;</span>';
    btn.style.color = 'var(--neon-cyan)';
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.color = '';
    }, 1500);
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            switchAlgorithm(item.dataset.algorithm);
        });
    });
    
    document.getElementById('btn-encrypt').addEventListener('click', handleEncrypt);
    document.getElementById('btn-decrypt').addEventListener('click', handleDecrypt);
    document.getElementById('copy-btn').addEventListener('click', copyToClipboard);
    
    document.getElementById('hill-size').addEventListener('change', (e) => {
        currentHillSize = parseInt(e.target.value);
        renderHillKeyInputs(currentHillSize);
    });
    
    switchAlgorithm('aes');
});
