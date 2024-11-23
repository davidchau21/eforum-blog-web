const storeInSession = (key, value) => {
    // return sessionStorage.setItem(key, value);
    return localStorage.setItem(key, value);
}

const lookInSession = (key) => {
    // return sessionStorage.getItem(key)
    return localStorage.getItem(key);
}

const removeFromSession = (key) => {
    // return sessionStorage.removeItem(key);
    return localStorage.removeItem(key);
}

export { storeInSession, lookInSession, removeFromSession }