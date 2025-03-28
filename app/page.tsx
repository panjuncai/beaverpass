"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  return (
    <>
      <style jsx global>{`
        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          transform-origin: center;
        }
        
        .soft-edge {
          box-shadow: 0 0 40px rgba(0, 0, 0, 0.05);
          border-radius: 16px;
        }
        
        .mobile-menu {
          transform: translateX(100%);
          transition: transform 0.3s ease-in-out;
          width: 75%;
          max-width: 320px;
          box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
          right: 0;
          left: auto;
        }
        
        .mobile-menu.active {
          transform: translateX(0);
        }
        
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 40;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
        }
        
        .overlay.active {
          opacity: 1;
          visibility: visible;
        }
        
        .mobile-hero-button {
          background-color: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(4px);
          border-radius: 8px;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .mobile-hero-button:hover {
          background-color: rgba(255, 255, 255, 0.9);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        
        @media (max-width: 1200px) {
          .main-content {
            transform: scale(0.9);
          }
        }
        @media (max-width: 992px) {
          .main-content {
            transform: scale(0.8);
          }
        }
        @media (max-width: 768px) {
          .main-content {
            transform: none;
          }
          .hero-container {
            height: 90vh;
            width: 100%;
            padding: 0;
            border-radius: 25px;
            overflow: hidden;
            margin: 0 auto;
          }
          .hero-image {
            width: 100%;
            height: 100%;
            border-radius: 25px;
            object-fit: cover;
          }
          .hero-overlay {
            height: 100%;
            border-radius: 25px 25px 0 0;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-0 m-0">
        <div className="w-full max-w-[1400px] min-h-screen flex flex-col bg-white overflow-hidden mx-auto soft-edge">
          {/* <!-- Header Section --> */}
          <div className="h-16 bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.1)] flex items-center px-7 sticky top-0 z-50">
              <div className="w-full max-w-[1200px] mx-auto flex items-center">
                  <img className="w-44 h-12" src="./homepage/logo_maple.png" alt="Logo" />
                  
                  {/* <!-- Desktop Navigation --> */}
                  <div className="hidden md:flex space-x-8 ml-4 px-8">
                      <Link href={"/"} className="text-gray-800 hover:text-lime-600 hover:scale-105 transform transition-all duration-300 ease-in-out font-medium font-['Inter']">Home</Link>
                      <Link href={"/post"} className="text-gray-800 hover:text-lime-600 hover:scale-105 transform transition-all duration-300 ease-in-out font-medium font-['Inter']">Post</Link>
                      <Link href={"/inbox"} className="text-gray-800 hover:text-lime-600 hover:scale-105 transform transition-all duration-300 ease-in-out font-medium font-['Inter']">Inbox</Link>
                      <Link href={"/deals"} className="text-gray-800 hover:text-lime-600 hover:scale-105 transform transition-all duration-300 ease-in-out font-medium font-['Inter']">Deals</Link>
                      <Link href={"/recycle"} className="text-gray-800 hover:text-lime-600 hover:scale-105 transform transition-all duration-300 ease-in-out font-medium font-['Inter']">Donate</Link>
                      <Link href={"/"} className="text-gray-800 hover:text-lime-600 hover:scale-105 transform transition-all duration-300 ease-in-out font-medium font-['Inter'] flex items-center gap-1">
                          More
                          <svg className="w-4 h-4 transition-colors duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                      </Link>
                  </div>
                  
                  <div className="hidden md:block ml-auto">
                      <Link href={"/login"} className="text-gray-800 hover:text-lime-600 hover:scale-105 transform transition-all duration-300 ease-in-out font-medium font-['Inter']">Sign In</Link>
                  </div>

                  {/* <!-- Mobile Menu Button --> */}
                  <button id="menuButton" className="md:hidden ml-auto p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300" onClick={toggleMobileMenu}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                      </svg>
                  </button>
              </div>
          </div>

          {/* <!-- Overlay for mobile menu --> */}
          <div 
            className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
            onClick={toggleMobileMenu}
          ></div>

          {/* <!-- Mobile Menu - Half width --> */}
          <div 
            className={`fixed top-0 right-0 h-screen w-80 bg-white z-50 md:hidden pt-16 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          >
              <div className="flex flex-col p-4">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
                      <div>
                          <h2 className="text-lg font-bold text-gray-800 font-['Inter']">Menu</h2>
                      </div>
                      <button onClick={toggleMobileMenu} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                      </button>
                  </div>
                  
                  <a href="#" className="py-3 px-4 text-gray-800 hover:text-lime-600 hover:bg-gray-50 rounded-lg transition-all duration-300 font-medium font-['Inter']">Sign In</a>
                  
                  <div className="border-t border-gray-200 my-4"></div>
                  
                  <a href="#" className="py-3 px-4 text-gray-800 hover:text-lime-600 hover:bg-gray-50 rounded-lg transition-all duration-300 font-medium font-['Inter']">Home</a>
                  <a href="#" className="py-3 px-4 text-gray-800 hover:text-lime-600 hover:bg-gray-50 rounded-lg transition-all duration-300 font-medium font-['Inter']">Post</a>
                  <a href="#" className="py-3 px-4 text-gray-800 hover:text-lime-600 hover:bg-gray-50 rounded-lg transition-all duration-300 font-medium font-['Inter']">Inbox</a>
                  <a href="#" className="py-3 px-4 text-gray-800 hover:text-lime-600 hover:bg-gray-50 rounded-lg transition-all duration-300 font-medium font-['Inter']">Deals</a>
                  <a href="#" className="py-3 px-4 text-gray-800 hover:text-lime-600 hover:bg-gray-50 rounded-lg transition-all duration-300 font-medium font-['Inter']">Donate</a>
                  
                  <div className="py-3 px-4">
                      <div className="flex items-center justify-between text-gray-800 font-medium font-['Inter']">
                          More
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                      </div>
                  </div>
              </div>
          </div>

          {/* <!-- Main Content Section --> */}
          <div className="main-content flex flex-wrap justify-center gap-4 p-7">
              {/* <!-- Left Side - Hidden on mobile --> */}
              <div className="hidden md:flex md:flex-col space-y-4 w-72 h-[450px]">
                  {/* <!-- Left Side: UP CARD --> */}
                  <div className="w-full h-[200px] bg-zinc-100 rounded-tr-[50px] rounded-bl-[50px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                      <div className="px-8 py-8">
                          <span className="text-lime-600 text-2xl font-light font-['Poppins'] leading-7.5 tracking-widest">Shop</span>
                          <span className="text-lime-600 text-2xl font-semibold font-['Poppins'] leading-7 tracking-widest"> Smart<br/></span>
                          <span className="text-lime-600 text-2xl font-light font-['Poppins'] leading-7.5 tracking-widest">Live</span>
                          <span className="text-lime-600 text-2xl font-semibold font-['Poppins'] leading-7 tracking-widest"> Green<br/></span>
                          <span className="text-lime-600 text-2xl font-light font-['Poppins'] leading-7.5 tracking-widest">Give</span>
                          <span className="text-lime-600 text-2xl font-semibold font-['Poppins'] leading-7 tracking-widest"> Back</span>
                          <div className="flex items-center justify-end space-x-2 mt-6" onClick={() => router.push('/search')}>
                              <span className="text-yellow-950 text-xl font-normal font-['Poppins'] hover:text-lime-600 hover:scale-105 transform transition-all duration-300 ease-in-out group">Buy Now&nbsp;&nbsp;</span> 
                              <div className="relative w-8 h-8 group">
                                  <div className="w-8 h-8 absolute bg-yellow-950 rounded-full transition-colors duration-300 ease-in-out group-hover:bg-lime-600"></div>
                                  {/* <!-- Single arrow using SVG for precise control --> */}
                                  <svg className="absolute inset-0 m-auto transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M12 6L20 12L12 18M4 12H20" transform="translate(3, 3) scale(0.7)" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                              </div>
                          </div>
                      </div>
                  </div>
                  {/* <!-- Left Side: DOWN CARD --> */}
                  <div className="w-full h-[230px]">
                      <img className="w-full h-full rounded-tr-[50px] rounded-bl-[50px] object-cover" src="./homepage/1_girl.jpg" alt="Furniture 1" />
                  </div>
              </div>

              {/* <!-- Center - Full width on mobile --> */}
              <div className="hero-container relative w-full md:w-[450px] h-[450px] md:h-[450px] flex-shrink-0">
                  {/* <!-- Base layer: Image --> */}
                  <img className="hero-image w-full h-full md:w-[450px] md:h-[450px] md:rounded-tl-[100px] md:rounded-br-[100px] object-cover" src="./homepage/2_van.jpg" alt="Main Furniture" />
                  
                  {/* <!-- Middle layer: Dark overlay --> */}
                  <div className="hero-overlay absolute top-0 left-0 w-full h-full md:h-[200px] opacity-30 bg-zinc-800 md:rounded-tl-[100px] z-10"></div>
                  
                  {/* <!-- Top layer: Text (hidden on mobile) --> */}
                  <div className="absolute top-0 left-0 w-full h-[200px] flex items-center justify-center z-20 hidden md:flex">
                      <h1 className="text-white text-3xl font-black font-['Poppins'] leading-12 tracking-widest text-center drop-shadow-lg">
                          We Handle<br/>Pickup & Delivery<br/>
                              <span className="text-white text-base font-light font-['Poppins'] leading-2 tracking-widest text-center block mt-2" style={{textShadow: '0 0 20px rgba(63, 98, 18, 0.8), 0 0 20px rgba(63, 98, 18, 0.6), 0 0 30px rgba(101, 163, 13, 0.4)'}}>
                              Pass Your Furniture To Someone In Need
                          </span>
                      </h1>                
                  </div>
                  
                  {/* <!-- Mobile view text and buttons (visible only on mobile) --> */}
                  <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-between z-20 p-4 md:hidden">
                      {/* <!-- Top text section --> */}
                      <div className="mt-8 text-center">
                          <h1 className="text-white text-base font-light font-['Poppins'] opacity-70 leading-2 tracking-widest text-center block mt-1 py-4">
                              Pass Your Furniture To Someone In Need
                          </h1>
                          <h2 className="text-white text-3xl font-black font-['Poppins'] leading-12 tracking-widest text-center drop-shadow-lg">
                              We Handle<br/>Pickup & Delivery
                          </h2>
                      </div>
                      
                      {/* <!-- Button section --> */}
                      <div className="mb-12 w-full flex flex-col gap-4">
                          <a href="#" className="mobile-hero-button opacity-80 flex items-center justify-between py-4 px-6 w-full">
                              <span className="text-yellow-950 text-xl font-medium font-['Poppins']">Buy furniture</span>
                              <div className="relative w-8 h-8">
                                  <div className="w-8 h-8 absolute bg-yellow-950 rounded-full"></div>
                                  <svg className="absolute inset-0 m-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M12 6L20 12L12 18M4 12H20" transform="translate(2, 1) scale(0.8)" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                              </div>
                          </a>
                          <a href="#" className="mobile-hero-button opacity-80 flex items-center justify-between py-4 px-6 w-full">
                              <span className="text-yellow-950 text-xl font-medium font-['Poppins']">Sell furniture</span>
                              <div className="relative w-8 h-8">
                                  <div className="w-8 h-8 absolute bg-yellow-950 rounded-full"></div>
                                  <svg className="absolute inset-0 m-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M12 6L20 12L12 18M4 12H20" transform="translate(2, 1) scale(0.8)" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                              </div>
                          </a>
                      </div>
                  </div>
              </div>

              {/* <!-- Right Side - Hidden on mobile --> */}
              <div className="hidden md:flex md:flex-col space-y-4 w-72 h-[450px]">
                  <div className="w-full h-[230px]">
                      <img className="w-full h-full rounded-tr-[50px] rounded-bl-[50px] object-cover" src="./homepage/3_boy.jpg" alt="Furniture 2" />
                  </div>
                  <div className="w-full h-[200px] bg-zinc-100 rounded-tr-[50px] rounded-bl-[50px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                      <div className="px-8 py-8">
                          <span className="text-lime-600 text-2xl font-light font-['Poppins'] leading-7.5 tracking-widest">Sell</span>
                          <span className="text-lime-600 text-2xl font-semibold font-['Poppins'] leading-7 tracking-widest"> Smart<br/></span>
                          <span className="text-lime-600 text-2xl font-light font-['Poppins'] leading-7.5 tracking-widest">Share</span>
                          <span className="text-lime-600 text-2xl font-semibold font-['Poppins'] leading-7 tracking-widest"> More<br/></span>
                          <span className="text-lime-600 text-2xl font-light font-['Poppins'] leading-7.5 tracking-widest">Waste</span>
                          <span className="text-lime-600 text-2xl font-semibold font-['Poppins'] leading-7 tracking-widest"> Less</span>
                          <div className="flex items-center justify-end space-x-2 mt-6" onClick={() => router.push('/post')}>
                              <span className="text-yellow-950 text-xl font-normal font-['Poppins'] hover:text-lime-600 hover:scale-105 transform transition-all duration-300 ease-in-out group">Sell Now&nbsp;&nbsp;</span> 
                              <div className="relative w-8 h-8 group">
                                  <div className="w-8 h-8 absolute bg-yellow-950 rounded-full transition-colors duration-300 ease-in-out group-hover:bg-lime-600"></div>
                                  {/* <!-- Single arrow using SVG for precise control --> */}
                                  <svg className="absolute inset-0 m-auto transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M12 6L20 12L12 18M4 12H20" transform="translate(3, 3) scale(0.7)" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* <!-- Popular Listings Section --> */}
          <div className="w-full px-7 pt-5 pb-5 relative">
              {/* <!-- Horizontal line --> */}
              <div className="w-full h-[1px] bg-gray-200"></div>
              
              {/* <!-- Overlapping label - positioned to center over the line --> */}
              <div className="absolute left-0 right-0 top-0 flex justify-center">
                  <div className="w-40 h-9 bg-yellow-950 rounded-[20px] flex items-center justify-center">
                      <h2 className="text-white text-base font-light font-['Inter']">Popular Listings</h2>
                  </div>
              </div>
              
              {/* <!-- Add some space to move cards below the overlapping label --> */}
              <div className="pt-4"></div>

              {/* <!-- Navigation and Cards Container --> */}
              <div className="relative mt-4">
                  {/* <!-- Container for cards and navigation arrows with set width --> */}
                  <div className="max-w-[1000px] mx-auto relative">
                      {/* <!-- Navigation Arrows - Positioned at left and right edges of the container --> */}
                      <div className="absolute left-[-100px] top-1/2 transform -translate-y-1/2">
                          <div className="w-16 h-16 rounded-full border border-zinc-300 flex items-center justify-center cursor-pointer group transition-all duration-300 ease-in-out hover:border-lime-600 hover:scale-105">
                              <span className="text-black text-4xl font-light font-['Poppins'] group-hover:text-lime-600 transition-colors duration-300 ease-in-out">&lt;</span>
                          </div>
                      </div>
                      
                      <div className="absolute right-[-100px] top-1/2 transform -translate-y-1/2">
                          <div className="w-16 h-16 rounded-full border border-zinc-300 flex items-center justify-center cursor-pointer group transition-all duration-300 ease-in-out hover:border-lime-600 hover:scale-105">
                              <span className="text-black text-4xl font-light font-['Poppins'] group-hover:text-lime-600 transition-colors duration-300 ease-in-out">&gt;</span>
                          </div>
                      </div>

                      {/* <!-- Listing Cards --> */}
                      <div className="flex flex-wrap justify-center gap-8">
                          {/* <!-- Card 1 --> */}
                          <div onClick={() => router.push('/search')} className="w-52 h-56 rounded-[20px] shadow-[0px_4px_7.300000190734863px_0px_rgba(0,0,0,0.26)] border-2 border-stone-100 overflow-hidden hover:scale-110 hover:shadow-[0px_0px_20px_rgba(63,98,18,0.5)] transform transition-all duration-300 ease-in-out cursor-pointer group">
                              <img className="w-52 h-40 object-cover" src="./homepage/1_table.png" alt="Apartment Dining Table" />
                              <div className="p-3 text-black text-base font-medium font-['Poppins'] group-hover:text-lime-600">
                                  Apartment Dining Table<br/>$ 90
                              </div>
                          </div>

                          {/* <!-- Card 2 --> */}
                          <div onClick={() => router.push('/search')} className="w-52 h-56 rounded-[20px] shadow-[0px_4px_7.300000190734863px_0px_rgba(0,0,0,0.26)] border-2 border-stone-100 overflow-hidden hover:scale-110 hover:shadow-[0px_0px_20px_rgba(63,98,18,0.5)] transform transition-all duration-300 ease-in-out cursor-pointer group">
                              <img className="w-52 h-40 object-cover" src="./homepage/2_sofa.png" alt="Cognac Faux-Leather" />
                              <div className="p-3 text-black text-base font-medium font-['Poppins'] group-hover:text-lime-600">
                                  COGNAC FAUX-LEATHER 4 ...<br/>$ 399
                              </div>
                          </div>

                          {/* <!-- Card 3 --> */}
                          <div onClick={() => router.push('/search')} className="w-52 h-56 rounded-[20px] shadow-[0px_4px_7.300000190734863px_0px_rgba(0,0,0,0.26)] border-2 border-stone-100 overflow-hidden hover:scale-110 hover:shadow-[0px_0px_20px_rgba(63,98,18,0.5)] transform transition-all duration-300 ease-in-out cursor-pointer group">
                              <img className="w-52 h-40 object-cover" src="./homepage/3_bed.png" alt="Single Bed & Matress" />
                              <div className="p-3 text-black text-base font-medium font-['Poppins'] group-hover:text-lime-600">
                                  Single Bed & Matress<br/>$ 120
                              </div>
                          </div>

                          {/* <!-- Card 4 (New) --> */}
                          <div onClick={() => router.push('/search')} className="w-52 h-56 rounded-[20px] shadow-[0px_4px_7.300000190734863px_0px_rgba(0,0,0,0.26)] border-2 border-stone-100 overflow-hidden hover:scale-110 hover:shadow-[0px_0px_20px_rgba(63,98,18,0.5)] transform transition-all duration-300 ease-in-out cursor-pointer group">
                              <img className="w-52 h-40 object-cover" src="./homepage/4_chair.png" alt="Modern Office Chair" />
                              <div className="p-3 text-black text-base font-medium font-['Poppins'] group-hover:text-lime-600">
                                  Modern Office Chair<br/>$ 150
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </div>
    </>
  );
}