
import SpaceBackground from '@/components/SpaceBackground';

const Index = () => {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <SpaceBackground />
      <div className="relative z-10 text-center">
        <h1 className="mb-4 text-5xl font-bold text-white">Welcome to Your AI-Powered Study Hub</h1>
        <p className="text-xl text-gray-300">Navigate through your academic world with ease and intelligence.</p>
      </div>
    </div>
  );
};

export default Index;
