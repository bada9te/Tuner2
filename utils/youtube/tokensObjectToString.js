module.exports = function tokenObjectToString(token) {
    // We want to format keys and values joined by '='
    // Then join each pair by '; ' (semicolon + space)
    
    // Optional: rename or reformat keys if needed (e.g. expiry_date from some other key)
    // For now, map 'expires_in' to expiry_date with a calculated timestamp
    const now = Date.now();
    const expiryDate = token.expires_in
        ? new Date(now + token.expires_in * 1000).toISOString()
        : token.expiry_date || '';

    const pairs = [
        `access_token=${token.access_token}`,
        `refresh_token=${token.refresh_token}`,
        `scope=${token.scope}`,
        `token_type=${token.token_type}`,
        expiryDate ? `expiry_date=${expiryDate}` : null,
    ].filter(Boolean); // remove nulls

    return pairs.join('; ');
}
