
import React from 'react';
import { BeeIcon } from './icons/BeeIcon';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 py-12 px-6 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1 space-y-4">
          <div className="flex items-center space-x-2 text-bee-gold">
            <BeeIcon className="w-5 h-5" />
            <span className="font-black text-lg tracking-tighter">BUZZCRAFT</span>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            Revolutionizing creative workflows with high-fidelity, consistent AI character generation.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Product</h4>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li><a href="#" className="hover:text-bee-gold transition-colors">Story Engine</a></li>
            <li><a href="#" className="hover:text-bee-gold transition-colors">Character Labs</a></li>
            <li><a href="#" className="hover:text-bee-gold transition-colors">API Access</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Company</h4>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li><a href="#" className="hover:text-bee-gold transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-bee-gold transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-bee-gold transition-colors">Terms of Service</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-6">Stay Connected</h4>
          <div className="flex space-x-4">
            <a href="#" className="w-10 h-10 bg-gray-900 border border-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-bee-gold hover:border-bee-gold transition-all">
              <span className="sr-only">X</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" className="w-10 h-10 bg-gray-900 border border-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-bee-gold hover:border-bee-gold transition-all">
              <span className="sr-only">GitHub</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/></svg>
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center text-gray-600 text-xs">
        <p>&copy; 2025 BuzzCraft AI Solutions. All rights reserved.</p>
        <p className="mt-4 md:mt-0 flex items-center">
          Powered by 
          <span className="ml-1 text-bee-gold font-bold">Gemini Flash Image</span>
          <span className="mx-2">•</span>
          Made with ❤️ for Creators
        </p>
      </div>
    </footer>
  );
};
