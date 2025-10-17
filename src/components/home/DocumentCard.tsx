import { TestDocument } from "@/types";
import Link from "next/link";

export function DocumentCard({ doc }: { doc: TestDocument }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Link
      href={`/documents/${doc.id}`}
      className="group block border-black pt-5 pb-8 transition-all rounded-lg p-4"
    >
      {/* Дата публікації */}
      <p className="text-sm md:text-base leading-5 mb-5 pb-2.5 border-b-2 border-black">
        {formatDate(doc.date_created)}
      </p>

      {/* Назва документа - Title + Name */}
      <h4 className="text-lg md:text-xl lg:text-2xl leading-[1.2] md:leading-[1.25] lg:leading-[1.3] font-normal pr-8 md:pr-10 relative">
        <span className="line-clamp-6">
          {doc.title}
          {doc.name && ` «${doc.name}»`}
        </span>

        {/* Стрілка при ховері */}
        <span className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg
            width="24"
            height="24"
            className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M8.097 8.13h16.064v16h-2V11.535L8.803 24.838 7.392 23.42 20.74 10.129H8.097v-2Z"
              fill="#000"
            />
          </svg>
        </span>
      </h4>
    </Link>
  );
}
