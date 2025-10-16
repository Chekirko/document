// "use client";

// import Link from "next/link";
// import { FileText } from "lucide-react";
// import {
//   SignedIn,
//   SignedOut,
//   SignInButton,
//   SignUpButton,
//   UserButton,
// } from "@clerk/nextjs";

// export default function Header() {
//   return (
//     <header className="bg-white shadow-lg border-b border-gray-200">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center py-6 px-8">
//           {/* Логотип */}
//           <Link
//             href="/"
//             className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
//           >
//             <FileText className="h-8 w-8 text-blue-600" />
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">
//                 Документи онлайн
//               </h1>
//               <p className="text-sm text-gray-600">
//                 Інтелектуальний портал документів міської ради
//               </p>
//             </div>
//           </Link>

//           {/* Авторизація Clerk */}
//           <div className="flex items-center gap-3">
//             <SignedOut>
//               <SignInButton>
//                 <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
//                   Увійти
//                 </button>
//               </SignInButton>
//               <SignUpButton>
//                 <button className="bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-blue-700 transition">
//                   Зареєструватися
//                 </button>
//               </SignUpButton>
//             </SignedOut>

//             <SignedIn>
//               <UserButton
//                 afterSignOutUrl="/"
//                 appearance={{
//                   elements: {
//                     avatarBox: "w-32 h-32",
//                     avatarImg: "w-122 h-122 rounded-full",
//                   },
//                 }}
//               />
//             </SignedIn>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }

"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
// import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: "/news", label: "Новини" },
    { href: "/", label: "Рішення" },
    { href: "/services", label: "Послуги" },
    { href: "/municipality", label: "Муніципалітет" },
    { href: "/contacts", label: "Контакти" },
  ];

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm font-[e-ukraine] text-[14px] text-black">
      <div className="flex items-center justify-between px-[10%] h-[74px]">
        {/* --- Логотип --- */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/icons/house.png"
              alt="Головна"
              width={40}
              height={40}
              className="mr-2"
            />
          </Link>

          {/* Версія для десктопу */}
          <Link href="/" className="hidden sm:flex items-center">
            <Image
              src="/icons/victoryV1.svg"
              alt="Сумська громада"
              width={280}
              height={45}
            />
          </Link>

          {/* Мобільна версія логотипу */}
          <Link href="/" className="flex sm:hidden items-center">
            <Image
              src="/icons/victoryV1-short.svg"
              alt="Сумська громада"
              width={100}
              height={40}
            />
          </Link>
        </div>

        {/* --- Навігація --- */}
        <nav className="hidden lg:flex items-center space-x-5 relative">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (pathname.startsWith(item.href) && item.href !== "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative py-2 transition-all ${
                  isActive ? "font-medium" : "font-normal"
                }`}
              >
                <span
                  className={`relative z-10 inline-block after:absolute after:left-0 after:bottom-0 after:z-[-1] after:h-[2px] after:bg-black after:transition-all after:duration-300 ${
                    isActive ? "after:w-full" : "after:w-0 hover:after:w-full"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* --- Кнопки праворуч --- */}
        <div className="flex items-center ml-6 space-x-3">
          {/* Пошук */}
          <button className="hover:bg-gray-100 p-2 rounded-full">
            <Image
              src="/icons/search-icon.svg"
              alt="Пошук"
              width={28}
              height={28}
            />
          </button>

          {/* Доступність */}
          <button className="hover:bg-gray-100 p-2 rounded-full">
            <Image
              src="/icons/vision-icon.svg"
              alt="Доступність"
              width={28}
              height={28}
            />
          </button>

          {/* Авторизація */}
          <div className="hidden md:flex items-center gap-2">
            <SignedOut>
              <SignInButton>
                <button className="px-3 py-1.5 text-[13px] font-medium text-gray-700 border border-gray-300 rounded-full hover:bg-gray-100 transition">
                  Увійти
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="bg-black text-white px-4 py-1.5 text-[13px] font-medium rounded-full hover:bg-gray-800 transition">
                  Зареєструватися
                </button>
              </SignUpButton>
            </SignedOut>

            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                    avatarImg: "rounded-full",
                  },
                }}
              />
            </SignedIn>
          </div>

          {/* Меню для мобільних */}
          <button className="lg:hidden p-2 hover:bg-gray-100 rounded-md">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
