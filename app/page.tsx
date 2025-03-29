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
      <style jsx>{`
        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          transform-origin: center;
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
          background-color: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
          border-radius: 8px;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .mobile-hero-button:hover {
          background-color: rgba(236, 253, 216, 0.95);
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
            padding: 0.5rem;
          }
          .hero-container {
            height: auto;
            max-height: 450px;
            width: 100%;
            padding: 0;
            border-radius: 16px;
            overflow: hidden;
            margin: 0 auto;
            position: relative;
          }
          .hero-image {
            width: 100%;
            height: auto;
            max-height: 450px;
            border-radius: 16px;
            object-fit: cover;
            object-position: center 30%;
            background-color: #f5f5f5;
          }
          .hero-overlay {
            height: 100%;
            border-radius: 16px 16px 0 0;
          }
        }
        .mobile-container {
          box-shadow: none;
          border-radius: 0;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-0 m-0">
        <div className="w-full max-w-[1400px] min-h-screen flex flex-col bg-white overflow-hidden mx-auto soft-edge md:soft-edge mobile-container">
          {/* <!-- Header Section --> */}
          <div className="h-16 bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.1)] flex items-center px-7 sticky top-0 z-50">
              <div className="w-full max-w-[1200px] mx-auto flex items-center">
                  <img className="w-44 h-12" src="./homepage/logo_maple.png" alt="Logo" />
                  
                  {/* <!-- Desktop Navigation --> */}
                  <div className="hidden md:flex space-x-8 ml-4 px-8">
                      <Link href={"/post"} className="nav-link transform transition-all duration-300 ease-in-out font-medium font-['Inter']">Post</Link>
                      <Link href={"/inbox"} className="nav-link transform transition-all duration-300 ease-in-out font-medium font-['Inter']">Inbox</Link>
                      <Link href={"/deals"} className="nav-link transform transition-all duration-300 ease-in-out font-medium font-['Inter']">Deals</Link>
                      <Link href={"/recycle"} className="nav-link transform transition-all duration-300 ease-in-out font-medium font-['Inter']">Donate</Link>
                      <Link href={"/"} className="nav-link transform transition-all duration-300 ease-in-out font-medium font-['Inter'] flex items-center gap-1">
                          More
                          <svg className="w-4 h-4 transition-colors duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                      </Link>
                  </div>
                  
                  <div className="hidden md:block ml-auto">
                      <Link href={"/login"} className="nav-link transform transition-all duration-300 ease-in-out font-medium font-['Inter']">Sign In</Link>
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
            className={`fixed inset-0 z-40 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            style={{backgroundColor: 'rgba(0, 0, 0, 0.3)'}}
            onClick={toggleMobileMenu}
          ></div>

          {/* <!-- Mobile Menu - Half width --> */}
          <div 
            className={`fixed top-0 right-0 h-screen w-[60%] max-w-[300px] bg-white z-50 md:hidden pt-16 shadow-lg transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
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
                  
                  <Link href="/login" className="py-3 px-4 nav-link transform transition-all duration-300 ease-in-out font-medium font-['Inter']">Sign In</Link>
                  
                  <div className="border-t border-gray-200 my-4"></div>
                  
                  <Link href="/post" className="py-3 px-4 nav-link transform transition-all duration-300 ease-in-out font-medium font-['Inter']">Post</Link>
                  <Link href="/inbox" className="py-3 px-4 nav-link transform transition-all duration-300 ease-in-out font-medium font-['Inter']">Inbox</Link>
                  <Link href="/deals" className="py-3 px-4 nav-link transform transition-all duration-300 ease-in-out font-medium font-['Inter']">Deals</Link>
                  <Link href="/recycle" className="py-3 px-4 nav-link transform transition-all duration-300 ease-in-out font-medium font-['Inter']">Donate</Link>
                  
                  <div className="flex items-center justify-between py-3 px-4 nav-link transform transition-all duration-300 ease-in-out font-medium font-['Inter']">
                      More
                      <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                  </div>
              </div>
          </div>

          {/* <!-- Main Content Section --> */}
          <div className="main-content flex flex-row flex-nowrap justify-center items-start gap-2 p-4">
              {/* <!-- Left Side - Hidden on mobile --> */}
              <div className="hidden md:flex md:flex-col space-y-4 w-[270px] flex-shrink-0">
                  {/* <!-- Left Side: UP CARD --> */}
                  <div className="w-full h-[200px] bg-zinc-100 rounded-tr-[50px] rounded-bl-[50px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                      <div className="px-8 py-8">
                          <span className="text-lime-600 text-2xl font-light font-['Poppins'] leading-7.5 tracking-widest">Shop</span>
                          <span className="text-lime-600 text-2xl font-semibold font-['Poppins'] leading-7 tracking-widest"> Smart<br/></span>
                          <span className="text-lime-600 text-2xl font-light font-['Poppins'] leading-7.5 tracking-widest">Live</span>
                          <span className="text-lime-600 text-2xl font-semibold font-['Poppins'] leading-7 tracking-widest"> Green<br/></span>
                          <span className="text-lime-600 text-2xl font-light font-['Poppins'] leading-7.5 tracking-widest">Give</span>
                          <span className="text-lime-600 text-2xl font-semibold font-['Poppins'] leading-7 tracking-widest"> Back</span>
                          <div className="flex items-center justify-end space-x-2 mt-6 relative group cursor-pointer" onClick={() => router.push('/search')}>
                              <div className="absolute inset-y-0 right-0 w-8 h-8 bg-yellow-950 rounded-full transition-all duration-300 ease-in-out group-hover:w-40 group-hover:rounded-3xl group-hover:bg-lime-600"></div>
                              <span className="relative z-10 text-yellow-950 text-xl font-normal font-['Poppins'] transition-all duration-300 ease-in-out group-hover:text-white">Buy Now</span> 
                              <div className="relative z-10 w-12 h-8 flex items-center justify-center">
                                  <svg className="transition-transform duration-300 ease-in-out" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="25" height="25">
                                      <path d="M12 6L20 12L12 18M4 12H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                              </div>
                          </div>
                      </div>
                  </div>
                  {/* <!-- Left Side: DOWN CARD --> */}
                  <div className="w-full h-[220px]">
                      <img className="w-full h-full rounded-tr-[50px] rounded-bl-[50px] object-cover" src="./homepage/1_girl.jpg" alt="Furniture 1" />
                  </div>
              </div>

              {/* <!-- Center - Full width on mobile --> */}
              <div className="hero-container relative w-full md:w-[430px] flex-shrink-0">
                  {/* <!-- Base layer: Image --> */}
                  <img className="hero-image w-full h-full md:w-[450px] md:h-[440px] md:rounded-tl-[100px] md:rounded-br-[100px] object-cover md:object-cover" src="./homepage/2_van.jpg" alt="Main Furniture" />
                  
                  {/* <!-- Middle layer: Dark overlay --> */}
                  <div className="hero-overlay absolute top-0 left-0 w-full md:h-[200px] opacity-50 bg-zinc-800 md:rounded-tl-[100px] z-10"></div>
                  
                  {/* <!-- Top layer: Text (hidden on mobile) --> */}
                  <div className="absolute top-0 left-0 w-full h-[200px] flex items-center justify-center z-20 hidden md:flex">
                      <h1 className="text-white text-4xl font-black font-['Poppins'] leading-12 tracking-wide text-center drop-shadow-lg">
                          We Handle<br/>Pickup & Delivery<br/>
                              <span className="text-white text-base font-light font-['Poppins'] leading-2 tracking-widest text-center block mt-2" style={{textShadow: '0 0 20px rgba(63, 98, 18, 0.8), 0 0 20px rgba(63, 98, 18, 0.6), 0 0 30px rgba(101, 163, 13, 0.4)'}}>
                              Pass Your Furniture To Someone In Need
                          </span>
                      </h1>                
                  </div>
                  
                  {/* <!-- Mobile view text and buttons (visible only on mobile) --> */}
                  <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-between z-20 p-6 md:hidden">
                      {/* <!-- Top text section --> */}
                      <div className="mt-14 text-center">
                          <h2 className="text-white text-3xl font-black font-['Poppins'] leading-tight tracking-wide text-center drop-shadow-lg">
                              We Handle<br/>Pickup & Delivery
                          </h2>
                      </div>
                      
                      {/* <!-- Bottom button section --> */}
                      <div className="w-full flex flex-col items-center justify-center mb-4 px-2">
                          <div className="text-center mb-4">
                              <h1 className="text-white text-xs font-light font-['Poppins'] opacity-90 leading-2 tracking-normal text-center">
                                  Pass Your Furniture To Someone In Need
                              </h1>
                          </div>
                          <div className="mb-3 w-full">
                              <a href="#" className="mobile-hero-button w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white bg-opacity-90 shadow-md transition-all duration-300 hover:bg-lime-50 hover:translate-y-[-2px] hover:shadow-lg" onClick={() => router.push('/search')}>
                                  <span className="text-zinc-800 text-lg font-medium font-['Poppins']">Buy furniture</span>
                                  <div className="bg-amber-800 rounded-full p-2">
                                      <svg className="h-5 w-5 text-white" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                          <path stroke="none" d="M0 0h24v24H0z" />
                                          <line x1="5" y1="12" x2="19" y2="12" />
                                          <line x1="13" y1="18" x2="19" y2="12" />
                                          <line x1="13" y1="6" x2="19" y2="12" />
                                      </svg>
                                  </div>
                              </a>
                          </div>
                          <div className="w-full">
                              <a href="#" className="mobile-hero-button w-full flex items-center justify-between px-4 py-3 rounded-lg bg-white bg-opacity-90 shadow-md transition-all duration-300 hover:bg-lime-50 hover:translate-y-[-2px] hover:shadow-lg" onClick={() => router.push('/post')}>
                                  <span className="text-zinc-800 text-lg font-medium font-['Poppins']">Sell furniture</span>
                                  <div className="bg-amber-800 rounded-full p-2">
                                      <svg className="h-5 w-5 text-white" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                          <path stroke="none" d="M0 0h24v24H0z" />
                                          <line x1="5" y1="12" x2="19" y2="12" />
                                          <line x1="13" y1="18" x2="19" y2="12" />
                                          <line x1="13" y1="6" x2="19" y2="12" />
                                      </svg>
                                  </div>
                              </a>
                          </div>
                      </div>
                  </div>
              </div>

              {/* <!-- Right Side - Hidden on mobile --> */}
              <div className="hidden md:flex md:flex-col space-y-2 w-[270px] flex-shrink-0">
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
                          <div className="flex items-center justify-end space-x-2 mt-6 relative group cursor-pointer" onClick={() => router.push('/post')}>
                              <div className="absolute inset-y-0 right-0 w-8 h-8 bg-yellow-950 rounded-full transition-all duration-300 ease-in-out group-hover:w-40 group-hover:rounded-3xl group-hover:bg-lime-600"></div>
                              <span className="relative z-10 text-yellow-950 text-xl font-normal font-['Poppins'] transition-all duration-300 ease-in-out group-hover:text-white">Sell Now</span> 
                              <div className="relative z-10 w-12 h-8 flex items-center justify-center">
                                  <svg className="transition-transform duration-300 ease-in-out" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="25" height="25">
                                      <path d="M12 6L20 12L12 18M4 12H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* <!-- Popular Listings Section --> */}
          <div className="w-full px-4 md:px-7 pt-4 md:pt-8 pb-6 md:pb-12 relative">
              {/* <!-- Horizontal line --> */}
              <div className="w-full h-[1px] bg-gray-200 relative">
                  {/* <!-- Overlapping label - positioned to center over the line --> */}
                  <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-0">
                      <div className="w-40 h-9 bg-yellow-950 rounded-[20px] flex items-center justify-center">
                          <h2 className="text-white text-base font-light font-['Inter']">Popular Listings</h2>
                      </div>
                  </div>
              </div>
              
              {/* <!-- Add some space to move cards below the overlapping label --> */}
              <div className="pt-6 md:pt-8"></div>

              {/* <!-- Navigation and Cards Container --> */}
              <div className="relative mt-2 md:mt-4">
                  {/* <!-- Container for cards and navigation arrows with set width --> */}
                  <div className="max-w-[1000px] mx-auto relative px-1 sm:px-4 md:px-14 py-2">
                      {/* <!-- Navigation Arrows - Positioned at left and right edges of the container (hidden on small mobile) --> */}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 hidden sm:block">
                          <div className="w-12 h-12 rounded-full border border-zinc-300 flex items-center justify-center cursor-pointer group transition-all duration-300 ease-in-out hover:border-lime-600 hover:scale-105">
                              <span className="text-black text-3xl font-light font-['Poppins'] group-hover:text-lime-600 transition-colors duration-300 ease-in-out">&lt;</span>
                          </div>
                      </div>
                      
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 hidden sm:block">
                          <div className="w-12 h-12 rounded-full border border-zinc-300 flex items-center justify-center cursor-pointer group transition-all duration-300 ease-in-out hover:border-lime-600 hover:scale-105">
                              <span className="text-black text-3xl font-light font-['Poppins'] group-hover:text-lime-600 transition-colors duration-300 ease-in-out">&gt;</span>
                          </div>
                      </div>

                      {/* <!-- Listing Cards --> */}
                      <div className="flex flex-wrap justify-evenly sm:justify-center gap-x-2 gap-y-2 md:gap-8">
                          {/* <!-- Card 1 --> */}
                          <div onClick={() => router.push('/search')} className="w-[150px] md:w-44 h-[175px] md:h-52 rounded-[20px] shadow-[0px_4px_7.300000190734863px_0px_rgba(0,0,0,0.26)] border-2 border-stone-100 overflow-hidden hover:scale-105 hover:shadow-[0px_0px_20px_rgba(63,98,18,0.5)] transform transition-all duration-500 ease-in-out cursor-pointer group mb-1 md:mb-0">
                              <img className="w-full h-[115px] md:h-36 object-cover" src="./homepage/1_table.png" alt="Apartment Dining Table" />
                              <div className="p-1 md:p-2">
                                  <div className="text-black text-xs md:text-sm font-normal font-['Poppins'] group-hover:text-lime-600 truncate">Apartment Dining Table</div>
                                  <div className="text-black text-xs md:text-sm font-medium font-['Poppins'] group-hover:text-lime-600">$ 90</div>
                              </div>
                          </div>

                          {/* <!-- Card 2 --> */}
                          <div onClick={() => router.push('/search')} className="w-[150px] md:w-44 h-[175px] md:h-52 rounded-[20px] shadow-[0px_4px_7.300000190734863px_0px_rgba(0,0,0,0.26)] border-2 border-stone-100 overflow-hidden hover:scale-105 hover:shadow-[0px_0px_20px_rgba(63,98,18,0.5)] transform transition-all duration-500 ease-in-out cursor-pointer group mb-1 md:mb-0">
                              <img className="w-full h-[115px] md:h-36 object-cover" src="./homepage/2_sofa.png" alt="Cognac Faux-Leather" />
                              <div className="p-1 md:p-2">
                                  <div className="text-black text-xs md:text-sm font-normal font-['Poppins'] group-hover:text-lime-600 truncate">COGNAC FAUX-LEATHER 4 SEATER</div>
                                  <div className="text-black text-xs md:text-sm font-medium font-['Poppins'] group-hover:text-lime-600">$ 399</div>
                              </div>
                          </div>

                          {/* <!-- Card 3 --> */}
                          <div onClick={() => router.push('/search')} className="w-[150px] md:w-44 h-[175px] md:h-52 rounded-[20px] shadow-[0px_4px_7.300000190734863px_0px_rgba(0,0,0,0.26)] border-2 border-stone-100 overflow-hidden hover:scale-105 hover:shadow-[0px_0px_20px_rgba(63,98,18,0.5)] transform transition-all duration-500 ease-in-out cursor-pointer group mb-1 md:mb-0">
                              <img className="w-full h-[115px] md:h-36 object-cover" src="./homepage/3_bed.png" alt="Single Bed & Matress" />
                              <div className="p-1 md:p-2">
                                  <div className="text-black text-xs md:text-sm font-normal font-['Poppins'] group-hover:text-lime-600 truncate">Single Bed & Matress</div>
                                  <div className="text-black text-xs md:text-sm font-medium font-['Poppins'] group-hover:text-lime-600">$ 120</div>
                              </div>
                          </div>

                          {/* <!-- Card 4 (New) --> */}
                          <div onClick={() => router.push('/search')} className="w-[150px] md:w-44 h-[175px] md:h-52 rounded-[20px] shadow-[0px_4px_7.300000190734863px_0px_rgba(0,0,0,0.26)] border-2 border-stone-100 overflow-hidden hover:scale-105 hover:shadow-[0px_0px_20px_rgba(63,98,18,0.5)] transform transition-all duration-500 ease-in-out cursor-pointer group mb-1 md:mb-0">
                              <img className="w-full h-[115px] md:h-36 object-cover" src="./homepage/4_chair.png" alt="Modern Office Chair" />
                              <div className="p-1 md:p-2">
                                  <div className="text-black text-xs md:text-sm font-normal font-['Poppins'] group-hover:text-lime-600 truncate">Modern Office Chair</div>
                                  <div className="text-black text-xs md:text-sm font-medium font-['Poppins'] group-hover:text-lime-600">$ 150</div>
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