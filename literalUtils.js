function calculateLiterals(code) {
    const literals = code
        .substring(0)
        .split(/[.\-=/_\:\;\,\}\{\)\(\"\'\]\[\/\#\?\>\<\&\*]/)
        .flatMap((r) => {
            return r.split(/[\n\r\s\t]+/);
        })
        .filter(Boolean);
    return literals;
}

module.exports = {
    calculateLiterals
}