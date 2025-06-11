// src/components/Navbar.jsx
import React, { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { auth, provider } from '../firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useUser } from '../contexts/UserContext';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, Bars3Icon } from '@heroicons/react/24/solid';

const Navbar = () => {
  const { user, loading } = useUser();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <nav className="bg-black text-white p-4 flex justify-between items-center shadow-lg">
        <h2 className="text-xl font-bold">EDD BOYZ NETWORK</h2>
        <p className="italic text-sm">Loading...</p>
      </nav>
    );
  }

  return (
    <nav className="bg-gradient-to-r from-black to-red-900 text-white p-4 flex justify-between items-center shadow-2xl">
      <Link to="/" className="text-2xl font-extrabold tracking-widest relative">
        <span className="text-red-600 drop-shadow-[2px_2px_0_#fff]">
          EDD
        </span>
        <span className="text-white drop-shadow-[2px_2px_0_#ff0000] ml-1">
          BOYZ
        </span>
        <span className="text-yellow-400 drop-shadow-[2px_2px_0_#000] ml-1">
          NETWORK
        </span>
      </Link>      {/* Mobile Menu */}
      <div className="md:hidden">
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="inline-flex items-center px-3 py-2 text-sm font-bold bg-red-700 hover:bg-red-600 rounded shadow-md transition">
            <Bars3Icon className="h-5 w-5 mr-2" />
            Menu
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-black text-white divide-y divide-gray-700 rounded-md shadow-xl ring-1 ring-red-600 z-50">
              <div className="p-1">
                {[
                  ['Home', '/'],
                  ['Teams', '/teams'],
                  ['News', '/news'],
                  ['Gallery', '/vods'],
                  ['Submit VOD', '/submit-vod'],
                  ['Select Team', '/select-team'],
                  ['Profile', '/profile'],
                  ['Predictions', '/predictionUI'],
                  ['Admin Dashboard', '/dashboard'],
                  ['Update Matchups','/update-results']
                ].map(([label, link]) => (
                  <Menu.Item key={link}>
                    <Link to={link} className="block px-4 py-2 hover:bg-red-700 rounded">
                      {label}
                    </Link>
                  </Menu.Item>
                ))}

                {user?.role === 'commissioner' && (
                  <>
                    <Menu.Item><Link to="/VODreview" className="block px-4 py-2 hover:bg-red-700 rounded">Review VODs</Link></Menu.Item>
                    <Menu.Item><Link to="/add-matchup" className="block px-4 py-2 hover:bg-red-700 rounded">Add Matchup</Link></Menu.Item>
                    <Menu.Item><Link to="/update-results" className="block px-4 py-2 hover:bg-red-700 rounded">Update Matchups</Link></Menu.Item>
                  </>
                )}
              </div>

              <div className="px-4 py-2">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500 transition"
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={handleLogin}
                    disabled={isLoggingIn}
                    className="w-full bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500 transition"
                  >
                    {isLoggingIn ? 'Logging in...' : 'Login'}
                  </button>
                )}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-6">
        {[
          ['Home', '/'],
          ['Teams', '/teams'],
          ['News', '/news'],
          ['Gallery', '/vods'],
          ['Submit VOD', '/submit-vod'],
          ['Select Team', '/select-team'],
          ['Profile', '/profile'],
          ['Predictions', '/predictionUI'],
          ['AdminDashboard', '/dashboard'],
          ['UpdateResults', "/update-results"]
        ].map(([label, link]) => (
          <Link key={link} to={link} className="hover:text-red-400 font-semibold transition">
            {label}
          </Link>
        ))}

        {user?.role === 'commissioner' && (
          <>
            <Link to="/update-results" className="hover:text-red-400 font-semibold transition">Update Results</Link>
            <Link to="/VODreview" className="hover:text-red-400 font-semibold transition">Review VODs</Link>
            <Link to="/add-matchup" className="hover:text-red-400 font-semibold transition">Add Matchup</Link>
          </>
        )}

        {user && (
          <div className="flex items-center space-x-2">
            {user.profilePic && <img src={user.profilePic} alt="Profile" className="w-8 h-8 rounded-full border-2 border-red-500" />}
            <span className="text-sm font-semibold">{user.username || user.displayName}</span>
          </div>
        )}

        {user ? (
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500 shadow-md"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500 shadow-md"
          >
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
