export const enum NetworkAdapter {
    POST = 'POST',
    GET = 'GET',
    PUT = 'PUT',
    DELETE = 'DELETE',
}

export const getTokenFromStorage = (): string | undefined => {
    const token = localStorage.getItem("authToken");
    return token ? token : undefined;
}

export const saveTokenInStorage = (token: string) => {
    localStorage.setItem("authToken", token);
}

export const removeTokenFromStorage = () => {
    localStorage.removeItem("authToken");
}

export const setAuthHeader = (headers: Headers | undefined = undefined): Headers => {
    const token = getTokenFromStorage();

    if (!token) {
        console.warn("No auth token found in storage.");
    }

    const targetHeaders = headers || new Headers();
    targetHeaders.set("Authorization", `Bearer ${token ?? ""}`);

    return targetHeaders;
}