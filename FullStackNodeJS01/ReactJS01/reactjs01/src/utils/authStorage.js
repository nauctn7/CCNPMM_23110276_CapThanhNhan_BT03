const TOKEN_KEY = 'auth_token';

/** Token lưu sessionStorage — đóng trình duyệt / mở tab mới = khách guest */
export const getToken = () => sessionStorage.getItem(TOKEN_KEY);

export const setToken = (token) => {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
};

export const clearToken = () => sessionStorage.removeItem(TOKEN_KEY);
