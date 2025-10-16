"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export default function Header() {
  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6 px-8">
          {/* Логотип */}
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Документи онлайн
              </h1>
              <p className="text-sm text-gray-600">
                Інтелектуальний портал документів міської ради
              </p>
            </div>
          </Link>

          {/* Авторизація Clerk */}
          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
                  Увійти
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-blue-700 transition">
                  Зареєструватися
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-32 h-32",
                    avatarImg: "w-122 h-122 rounded-full",
                  },
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}
