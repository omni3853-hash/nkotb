"use client";

import { IUser } from "@/lib/models/user.model";
import React, { useState, createContext, useEffect, ReactNode } from "react";

interface LoginData {
    token: string;
    user: IUser;
}

interface UserContextType {
    accessToken: string | null;
    user: IUser | null;
    login: (data: LoginData) => void;
    logout: () => void;
    loading: boolean;
}

interface UserProviderProps {
    children: ReactNode;
}

export const logout = () => {
    document.cookie = "accessTokenCelebrityManagement=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "userDataCelebrityManagement=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    if (typeof window !== "undefined") {
        try {
            localStorage.removeItem("accessTokenCelebrityManagement");
            localStorage.removeItem("userDataCelebrityManagement");
        } catch { }
    }
};

export const UserContext = createContext<UserContextType>({
    accessToken: null,
    user: null,
    login: () => { },
    logout: () => { },
    loading: true,
});

const getCookie = (name: string): string | null => {
    const match = typeof document !== "undefined"
        ? document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
        : null;
    return match ? decodeURIComponent(match[2]) : null;
};

const setCookie = (name: string, value: string, days: number) => {
    const expiration = new Date();
    expiration.setTime(expiration.getTime() + days * 24 * 60 * 60 * 1000);
    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    const secureAttr = isHttps ? "; Secure" : "";
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expiration.toUTCString()}; path=/; SameSite=Strict${secureAttr}`;
};

const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [user, setUser] = useState<IUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        let token: string | null = getCookie("accessTokenCelebrityManagement");
        let userJson: string | null = getCookie("userDataCelebrityManagement");

        if (!token && typeof window !== "undefined") {
            try {
                token = localStorage.getItem("accessTokenCelebrityManagement");
                userJson = localStorage.getItem("userDataCelebrityManagement");
            } catch { }
        }

        if (token) setAccessToken(token);
        if (userJson) {
            try {
                setUser(JSON.parse(userJson) as IUser);
            } catch {
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const login = (data: LoginData) => {
        const { token, user } = data;
        setAccessToken(token);
        setUser(user);

        setCookie("accessTokenCelebrityManagement", token, 3);
        setCookie("userDataCelebrityManagement", JSON.stringify(user), 3);

        if (typeof window !== "undefined") {
            try {
                localStorage.setItem("accessTokenCelebrityManagement", token);
                localStorage.setItem("userDataCelebrityManagement", JSON.stringify(user));
            } catch { }
        }
    };

    const doLogout = () => {
        setAccessToken(null);
        setUser(null);
        document.cookie = "accessTokenCelebrityManagement=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "userDataCelebrityManagement=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        if (typeof window !== "undefined") {
            try {
                localStorage.removeItem("accessTokenCelebrityManagement");
                localStorage.removeItem("userDataCelebrityManagement");
            } catch { }
        }
    };

    return (
        <UserContext.Provider value={{ accessToken, user, login, logout: doLogout, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
