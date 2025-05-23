function formatSI(n) {
    if (n < 1_000) return n.toString();

    const units = ['K', 'M', 'B', 'T'];
    const tier = Math.floor(Math.log10(n) / 3);
    const suffix = units[tier - 1];
    const scale = Math.pow(10, tier * 3);
    const scaled = n / scale;

    return `${scaled % 1 === 0 ? scaled : scaled.toFixed(1)}${suffix}`;
}


module.exports = formatSI;
