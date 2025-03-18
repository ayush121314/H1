import { NextPage, NextPageContext } from 'next';
import Head from 'next/head';

interface ErrorProps {
  statusCode?: number;
  message?: string;
}

const Error: NextPage<ErrorProps> = ({ statusCode, message }) => {
  return (
    <div className="container mx-auto px-4 py-16">
      <Head>
        <title>Error {statusCode || ''} | Chess GameFi</title>
      </Head>
      
      <div className="max-w-lg mx-auto p-8 bg-red-50 rounded-lg border border-red-200 shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {statusCode 
            ? `Error ${statusCode}` 
            : 'An error occurred'}
        </h1>
        
        <p className="text-lg text-gray-700 mb-6">
          {message || 'Sorry, something went wrong. Please try again later.'}
        </p>
        
        <button 
          onClick={() => window.location.href = '/'}
          className="px-6 py-3 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Return to Homepage
        </button>
      </div>
    </div>
  );
};

Error.getInitialProps = ({ res, err }: NextPageContext): ErrorProps => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode, message: err?.message };
};

export default Error; 