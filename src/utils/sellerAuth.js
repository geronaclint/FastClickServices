export const isSellerLoggedIn = () => localStorage.getItem("seller-auth") === "true";
export const loginSeller = () => localStorage.setItem("seller-auth", "true");
export const logoutSeller = () => localStorage.removeItem("seller-auth");
