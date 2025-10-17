import Link from "next/link";

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
}: {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}) {
  const getPageUrl = (page: number) => {
    const url = new URL(baseUrl, "http://localhost");
    url.searchParams.set("page", page.toString());
    return url.pathname + url.search;
  };

  const renderPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + showPages - 1);

    if (endPage - startPage < showPages - 1) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    // Перша сторінка
    if (startPage > 1) {
      pages.push(
        <Link key={1} href={getPageUrl(1)}>
          <li
            className={`page ${
              currentPage === 1 ? "active" : ""
            } border-2 border-transparent rounded-full px-3 py-1 cursor-pointer hover:border-black`}
          >
            1
          </li>
        </Link>
      );
      if (startPage > 2) {
        pages.push(
          <li key="dots1" className="page inactive px-2">
            ...
          </li>
        );
      }
    }

    // Сторінки між
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Link key={i} href={getPageUrl(i)}>
          <li
            className={`page ${
              currentPage === i ? "active border-black" : ""
            } border-2 border-transparent rounded-full px-3 py-1 cursor-pointer hover:border-black`}
          >
            {i}
          </li>
        </Link>
      );
    }

    // Остання сторінка
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <li key="dots2" className="page inactive px-2">
            ...
          </li>
        );
      }
      pages.push(
        <Link key={totalPages} href={getPageUrl(totalPages)}>
          <li
            className={`page ${
              currentPage === totalPages ? "active" : ""
            } border-2 border-transparent rounded-full px-3 py-1 cursor-pointer hover:border-black`}
          >
            {totalPages}
          </li>
        </Link>
      );
    }

    return pages;
  };

  return (
    <div className="flex justify-between items-center border-t-2 border-black pt-5 mt-8">
      {/* Попередня сторінка */}
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="flex items-center text-black hover:underline"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2"
          >
            <path
              d="M23.2588 12.0021L2.00012 11.9566M2.00012 11.9566L12.6521 22.6086M2.00012 11.9566L12.6067 1.35001"
              stroke="black"
              strokeWidth="2"
            />
          </svg>
          <p>Попередня сторінка</p>
        </Link>
      ) : (
        <div className="flex items-center text-gray-400">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2"
          >
            <path
              d="M23.2588 12.0021L2.00012 11.9566M2.00012 11.9566L12.6521 22.6086M2.00012 11.9566L12.6067 1.35001"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <p>Попередня сторінка</p>
        </div>
      )}

      {/* Номери сторінок */}
      <ul className="flex items-center space-x-2">{renderPageNumbers()}</ul>

      {/* Наступна сторінка */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="flex items-center text-black hover:underline"
        >
          <p>Наступна сторінка</p>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="ml-2"
          >
            <path
              d="M1 11.9566L22.2587 12.0021M22.2587 12.0021L11.6067 1.3501M22.2587 12.0021L11.6521 22.6087"
              stroke="black"
              strokeWidth="2"
            />
          </svg>
        </Link>
      ) : (
        <div className="flex items-center text-gray-400">
          <p>Наступна сторінка</p>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="ml-2"
          >
            <path
              d="M1 11.9566L22.2587 12.0021M22.2587 12.0021L11.6067 1.3501M22.2587 12.0021L11.6521 22.6087"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
