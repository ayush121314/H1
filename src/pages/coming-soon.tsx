import React from 'react';
import Head from 'next/head';

const ComingSoon: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Head>
        <title>Coming Soon</title>
        <meta name="description" content="This feature is coming soon!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="text-4xl font-bold mb-8">Coming Soon</h1>
      <img src="/coming_soon.jpg" alt="Coming Soon" className="w-full h-full object-cover" />
    </div>
  );
};

export default ComingSoon; 
