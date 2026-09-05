"use client";

import { useAuth } from "@/components/AuthContext";

export default function GoogleAuthButton() {
  const { signInWithOAuth } = useAuth();

  const handleGoogleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const { error } = await signInWithOAuth("google");
    if (error) {
      console.error("Google OAuth error:", error.message);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-medium py-3 px-4 rounded-xl hover:bg-gray-100 transition-all border border-gray-300"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M22.563 10.227h-1.005c-.14.426-.324.834-.555 1.21l4.677 2.674c1.068-1.103 1.834-2.479 2.176-3.985-.734-.554-1.692-1.054-2.723-1.382l-.037.03c-.777.375-1.639.578-2.543.552z"
          fill="#4285F4"
        />
        <path
          d="M10.605 15.045c-1.868 1.684-4.43 2.748-7.285 2.256-2.689-.438-4.81-2.523-5.316-5.072-.42-2.165.37-4.297 1.982-5.662.796-.67 1.73-.96 2.684-.96 1.026 0 2.018.352 2.853.986 1.283-1.019 2.849-1.633 4.532-1.696-1.196-2.966-3.67-5.013-6.787-5.626-1.861-.392-3.746-.268-5.585.384-1.89.675-3.517 1.808-4.747 3.315-1.108 1.393-1.86 3.087-2.035 4.926-.16 1.69-.15 3.348.015 4.968.185 1.879.968 3.676 2.184 5.193 1.357 1.674 3.176 2.806 5.22 3.241 2.619.587 5.48.336 7.973-1.093 1.285-.761 2.397-1.828 3.234-3.078z"
          fill="#34A853"
        />
        <path
          d="M23.785 9.81c-.135-.012-4.48.904-8.854.305-.186-.366-.37-1.103-.562-2.036.998-.348 2.138-.696 3.215-.734.12 0 .243 0 .361-.008.003-.021.007-.042.012-.058 1.85-.053 3.69-.006 3.828.006.694.017 1.185.04 1.243.013z"
          fill="#FBBC04"
        />
        <path
          d="M1.472 10.228c0 .759.104 1.514.303 2.236 1.822.286 3.37.354 4.496.156 1.254-1.557 1.72-3.585 1.351-5.446-.588.022-1.172.108-1.748.352-.972.445-1.841 1.152-2.537 2.058-.473.572-.858 1.215-1.152 1.922-.276.66-.486 1.34-.622 2.03z"
          fill="#EA4335"
        />
      </svg>
      Continue with Google
    </button>
  );
}
