const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Book'em title on the left */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Book'em
          </h1>
          
          {/* Motto in the center */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <p className="text-gray-600 text-sm whitespace-nowrap">
              Find your next great read
            </p>
          </div>
          
          {/* Empty space on the right for balance */}
          <div className="w-0"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
