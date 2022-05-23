import React, { useContext } from "react";
import { Outlet, Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { NotificationContext } from "../contexts/NotificationContext";

export function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { unreadMessageCount } = useContext(NotificationContext);
  return (
    <>
      <nav className="bg-white border-gray-200 px-4 sm:px-6 py-2.5 rounded dark:bg-gray-800">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-between items-center">
          <Link to="/" className="flex items-center">
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
              Conversa DJ
            </span>
          </Link>
          <button
            data-collapse-toggle="mobile-menu"
            type="button"
            className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="mobile-menu"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              ></path>
            </svg>
            <svg
              className="hidden w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
          <div className="hidden w-full md:block md:w-auto" id="mobile-menu">
            <ul className="flex flex-col mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium">
              <li className="flex">
                <Link
                  to="/conversations"
                  className="block py-2 pr-4 pl-3 text-white md:p-0 dark:text-white"
                  aria-current="page"
                >
                  Active Conversations
                  {unreadMessageCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center h-6 w-6 rounded-full bg-white">
                      <span className="text-xs font-medium leading-none text-gray-800">
                        {unreadMessageCount}
                      </span>
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="block py-2 pr-4 pl-3 text-white md:p-0 dark:text-white"
                  aria-current="page"
                >
                  Chats
                </Link>
              </li>
              {!user ? (
                <li>
                  <Link
                    to="/login"
                    className="block py-2 pr-4 pl-3 text-white md:p-0 dark:text-white"
                  >
                    Login
                  </Link>
                </li>
              ) : (
                <>
                  <span className="text-white">Logged in: {user.username}</span>
                  <button
                    className="block py-2 pr-4 pl-3 text-white md:p-0 dark:text-white"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto py-6">
        <Outlet />
      </div>
    </>
  );
}
