"use client";
import Link from "next/link";

import { useState } from "react";
  import { signIn } from "next-auth/react";
    import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (!res || res.error) {
      setError("Invalid Credentials");
      return;
    }

    router.replace("/dashboard");
  };
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="backdrop-blur-lg bg-white/70 p-8 rounded-2xl shadow-xl w-full max-w-sm border border-white/30">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6 tracking-tight">
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm text-gray-700 font-medium">
              Username
            </label>
            <input
                          type="text"
                          onChange={e=>setEmail(e.target.value)}
              placeholder="Enter username"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 font-medium">
              Password
            </label>
            <input
                          type="password"
                          onChange={e=>setPassword(e.target.value)}
              placeholder="Enter password"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Login
                  </button>
                  
                  {error && <div className="text-center mt-4 text-red-500">
                      {error}
                  </div>
                  }     
          <div className="text-center mt-4">
          <p className="text-center text-sm mt-4">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Register here
          </a>
        </p>
        </div>
        </form>

      </div>
    </div>
  );
}
