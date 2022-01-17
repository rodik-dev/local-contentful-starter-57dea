function cssClassesFromUrlPath(urlPath) {
    const parts = urlPath.replace(/^\/|\/$/g, '').split('/').filter(Boolean);

    let css = 'page';
    return parts.map((part) => {
        css += `-${part}`;
        return css;
    });
}


module.exports = {
    cssClassesFromUrlPath
};
