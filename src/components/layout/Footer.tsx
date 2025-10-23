"use client";

import Image from "next/image";
import Link from "next/link";
import SocialLinks from "./SocialLinks";

export default function Footer() {
  return (
    <footer className="w-full text-sm">
      {/* === Верхня секція з навігацією === */}
      <section className="bg-[#cdf4df] text-black">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1 - ГРОМАДА */}
            <div>
              <h3 className="font-bold text-base mb-4 uppercase">ГРОМАДА</h3>
              <nav className="flex flex-col gap-2.5">
                <Link
                  href="/"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Контакти та звернення
                </Link>
                <Link
                  href="/"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Секретар Бориславської міської ради
                </Link>
                <Link
                  href="/"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Депутатський корпус
                </Link>
                <Link
                  href="/"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Виконком
                </Link>
                <Link
                  href="/"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Інвестиційний паспорт
                </Link>
                <Link
                  href="/"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Паспорт громади
                </Link>
                <Link
                  href="#"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Пам&apos;ятки
                </Link>
                <Link
                  href="#"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Очищення влади
                </Link>
                <Link
                  href="#"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Відеопрезентація про громаду
                </Link>
                <Link
                  href="#"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Бренд міста
                </Link>
              </nav>
            </div>

            {/* Column 2 - ДОКУМЕНТИ ТА ДАНІ */}
            <div>
              <h3 className="font-bold text-base mb-4 uppercase">
                ДОКУМЕНТИ ТА ДАНІ
              </h3>
              <nav className="flex flex-col gap-2.5">
                <Link
                  href="/"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Публічна інформація
                </Link>
                <Link
                  href="/"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Фінанси
                </Link>
                <Link
                  href="/"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Документи (НПА)
                </Link>
                <Link
                  href="/"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Регуляторна діяльність
                </Link>
                <Link
                  href="#"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Статут Бориславської міської територіальної громади
                </Link>
                <Link
                  href="#"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Стратегія розвитку Бориславської міської територіальної
                  громади
                </Link>
              </nav>
            </div>

            {/* Column 3 - ГРОМАДЯНАМ */}
            <div>
              <h3 className="font-bold text-base mb-4 uppercase">ГРОМАДЯНАМ</h3>
              <nav className="flex flex-col gap-2.5">
                <Link
                  href="/"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Кабінет мешканця
                </Link>
                <Link
                  href="/"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Послуги
                </Link>
                <Link
                  href="/"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Чат-бот «СВОЇ»
                </Link>
                <Link
                  href="/"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Довідник закладів
                </Link>
                <Link
                  href="#"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Це має знати і вміти кожен
                </Link>
                <Link
                  href="#"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Повідомити про корупцію
                </Link>
                <Link
                  href="#"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Програма ментального здоров&apos;я «Ти як?»
                </Link>
              </nav>
            </div>

            {/* Column 4 - ГРОМАДСЬКА УЧАСТЬ */}
            <div>
              <h3 className="font-bold text-base mb-4 uppercase">
                ГРОМАДСЬКА УЧАСТЬ
              </h3>
              <nav className="flex flex-col gap-2.5">
                <Link
                  href="/"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Електронні петиції
                </Link>
                <Link
                  href="/"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Електронні консультації
                </Link>
                <Link
                  href="/"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Співвласникам багатоквартирних будинків
                </Link>
                <Link
                  href="/"
                  className="text-[15px] leading-relaxed hover:underline"
                >
                  Органи самоорганізації населення
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* === Нижній footer (чорний) === */}
      <div className="bg-black text-white">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start justify-between">
            {/* Ліва колонка */}
            <div className="space-y-8">
              {/* Лого + назва */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 shrink-0  rounded flex items-center justify-center">
                  <Image
                    src="/icons/footer-logo.svg"
                    alt="Герб"
                    width={48}
                    height={48}
                  />
                </div>
                <div>
                  <p className="font-bold text-base leading-snug text-white">
                    Бориславська міська територіальна громада
                  </p>
                  <p className="text-sm mt-1 text-gray-300">
                    Офіційний вебсайт
                  </p>
                </div>
              </div>

              {/* EGAP текст */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 shrink-0  rounded flex items-center justify-center">
                  <Image
                    src="/icons/footer-line.svg"
                    alt="Герб"
                    width={48}
                    height={48}
                  />
                </div>
                <p className="text-[15px] leading-relaxed text-gray-200">
                  Створено в межах швейцарсько-української Програми «Електронне
                  урядування задля підзвітності влади та участі громади» (EGAP),
                  що реалізується Фондом Східна Європа у партнерстві з
                  Міністерством цифрової трансформації України за підтримки
                  Швейцарії.
                </p>
              </div>

              {/* Свої */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 shrink-0">
                  <Image
                    src="/icons/svoi.png"
                    alt="Свої"
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                </div>
                <Link
                  href="https://toolkit.in.ua/"
                  className="underline text-[15px] hover:text-blue-300 text-white"
                >
                  Хочете такий сайт з чат-ботом для громади?
                </Link>
              </div>

              {/* Creative Commons */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 shrink-0">
                  <Image
                    src="/icons/i.cc.svg"
                    alt="Creative Commons"
                    width={48}
                    height={48}
                  />
                </div>
                <p className="text-[15px] leading-relaxed text-gray-200">
                  Весь контент доступний за ліцензією{" "}
                  <span className="italic">
                    Creative Commons Attribution 4.0 International license
                  </span>
                  , якщо не зазначено інше.
                </p>
              </div>
            </div>

            {/* Права колонка */}
            <div className="space-y-10 justify-self-end">
              {/* Соцмережі */}
              {/* <div>
                <p className="font-bold text-base mb-4">Слідкуй за нами тут:</p>
                <div className="flex items-center gap-4">
                  <Link
                    href="https://www.facebook.com/smr.gov.ua"
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src="/icons/facebook.svg"
                      alt="Facebook"
                      width={20}
                      height={20}
                    />
                  </Link>
                  <Link
                    href="https://www.youtube.com/@sumy_miskrada"
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src="/icons/youtube.svg"
                      alt="YouTube"
                      width={20}
                      height={20}
                    />
                  </Link>
                  <Link
                    href="https://wa.me/"
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src="/icons/whatsapp.svg"
                      alt="WhatsApp"
                      width={20}
                      height={20}
                    />
                  </Link>
                  <Link
                    href="https://t.me/"
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src="/icons/telegram.svg"
                      alt="Telegram"
                      width={20}
                      height={20}
                    />
                  </Link>
                  <Link
                    href="https://gromada.smr.gov.ua/rss.xml"
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src="/icons/rss.svg"
                      alt="RSS"
                      width={20}
                      height={20}
                    />
                  </Link>
                </div>
              </div> */}
              <p className="font-bold text-white text-base mb-4">
                Слідкуй за нами тут:
              </p>
              <SocialLinks />

              {/* QR-коди */}
              <div>
                <p className="font-bold text-base text-white mb-4">
                  Наша громада у смартфоні:
                </p>
                <div className="flex items-start gap-8">
                  <div className="flex flex-col items-center">
                    <div className="w-[100px] h-[100px] bg-white rounded">
                      <Image
                        src="/icons/viber-qr.png"
                        alt="Viber QR"
                        width={100}
                        height={100}
                      />
                    </div>
                    <p className="mt-3 text-sm font-medium">Viber</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-[100px] h-[100px] bg-white rounded">
                      <Image
                        src="/icons/telegram-qr.png"
                        alt="Telegram QR"
                        width={100}
                        height={100}
                      />
                    </div>
                    <p className="mt-3 text-sm font-medium">Telegram</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
